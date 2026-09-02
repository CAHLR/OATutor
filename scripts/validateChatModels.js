const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const coursePlansPath = path.join(
  __dirname,
  "..",
  "src",
  "content-sources",
  "oatutor",
  "coursePlans.json"
);

const DEFAULT_CHAT_MODEL = "gpt-4o";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const chatParamsPath = path.join(
  __dirname,
  "..",
  "aws",
  "aiAgentGeneration",
  "openaiChatParams.mjs"
);
const envCandidates = [
  path.join(__dirname, "..", "aws", "aiAgentGeneration", ".env"),
  path.join(__dirname, "..", ".env"),
];

function loadEnvFiles() {
  for (const envPath of envCandidates) {
    if (!fs.existsSync(envPath)) continue;
    const text = fs.readFileSync(envPath, "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] == null || process.env[key] === "") {
        process.env[key] = value;
      }
    }
  }
}

function collectModels(data) {
  const models = new Set([DEFAULT_CHAT_MODEL]);
  if (!Array.isArray(data)) {
    throw new Error("Expected coursePlans.json to contain an array at top level");
  }
  for (const course of data) {
    const courseModel = String(course?.chat_model || "").trim();
    if (courseModel) models.add(courseModel);
    if (Array.isArray(course?.lessons)) {
      for (const lesson of course.lessons) {
        const lessonModel = String(lesson?.chat_model || "").trim();
        if (lessonModel) models.add(lessonModel);
      }
    }
  }
  return [...models].sort();
}

async function postCompletion(apiKey, params) {
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

async function testModel(apiKey, model, chatParams) {
  const spec = {
    model,
    messages: [{ role: "user", content: "Reply with OK" }],
    maxTokens: chatParams.smokeTestMaxTokens(model),
  };
  let params = chatParams.buildChatCompletionParams(spec);
  let { response, body } = await postCompletion(apiKey, params);

  if (!response.ok) {
    const remapped = chatParams.remapParamsFromApiError(params, body?.error || body);
    if (remapped) {
      ({ response, body } = await postCompletion(apiKey, remapped));
    }
  }

  const choice = body?.choices?.[0];
  const content = choice?.message?.content;
  if (!response.ok) {
    const detail = body?.error?.message || response.statusText || `HTTP ${response.status}`;
    throw new Error(detail);
  }
  if (content && String(content).trim()) {
    return String(content).trim();
  }
  // o1/o3/o4 may spend the budget on hidden reasoning and return blank text.
  if (chatParams.isReasoningModel(model) && choice) {
    return `[reasoning:${choice.finish_reason || "ok"}]`;
  }
  throw new Error("empty content");
}

async function main() {
  loadEnvFiles();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY not found. Put it in aws/aiAgentGeneration/.env (or repo-root .env)."
    );
  }

  const data = JSON.parse(fs.readFileSync(coursePlansPath, "utf8"));
  const models = collectModels(data);
  const chatParams = await import(pathToFileURL(chatParamsPath).href);
  console.log(`Testing ${models.length} unique model(s): ${models.join(", ")}`);

  let failed = 0;
  for (const model of models) {
    try {
      const preview = await testModel(apiKey, model, chatParams);
      console.log(`OK  ${model}  (${preview.slice(0, 40)})`);
    } catch (err) {
      failed += 1;
      console.error(`FAIL  ${model}  ${err.message}`);
    }
  }

  if (failed > 0) {
    console.error(`${failed} model(s) failed validation.`);
    process.exit(1);
  }
  console.log("All chat models responded.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
