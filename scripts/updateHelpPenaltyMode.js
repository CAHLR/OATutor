const fs = require("fs");
const path = require("path");

const coursePlansPath = path.join(
  __dirname,
  "..",
  "src",
  "content-sources",
  "oatutor",
  "coursePlans.json"
);

const VALID_HELP_PENALTY_MODES = new Set(["Never", "AnswerReveal", "OnOpen"]);

function assertMode(value, label) {
  if (!VALID_HELP_PENALTY_MODES.has(value)) {
    throw new Error(
      `Invalid ${label} "${value}". Expected one of: ${Array.from(VALID_HELP_PENALTY_MODES).join(", ")}`
    );
  }
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let chat = null;
  let hint = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === "--chat") {
      chat = next;
      i += 1;
    } else if (arg === "--hint") {
      hint = next;
      i += 1;
    } else if (arg === "-h" || arg === "--help") {
      console.log(`Usage:
  node scripts/updateHelpPenaltyMode.js
      Remove help_penalty_mode from all courses/lessons.
      Missing chat_penalty_mode / hint_penalty_mode fall back to code defaults
      (chat: Never, hint: OnOpen).

  node scripts/updateHelpPenaltyMode.js --chat Never --hint OnOpen
      Set chat_penalty_mode and/or hint_penalty_mode, and remove help_penalty_mode.`);
      process.exit(0);
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown argument "${arg}". Use --chat and/or --hint.`);
    } else {
      throw new Error(
        `Unexpected argument "${arg}". Use --chat and/or --hint; there is no shared help_penalty_mode.`
      );
    }
  }

  if (chat != null) assertMode(chat, "chat_penalty_mode");
  if (hint != null) assertMode(hint, "hint_penalty_mode");

  return { chat, hint };
}

function applyToNode(node, { chat, hint }) {
  if (!node || typeof node !== "object") return;
  delete node.help_penalty_mode;
  if (chat != null) node.chat_penalty_mode = chat;
  if (hint != null) node.hint_penalty_mode = hint;
}

function main() {
  const modes = parseArgs(process.argv);
  const raw = fs.readFileSync(coursePlansPath, "utf8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error("Expected coursePlans.json to contain an array at top level");
  }

  for (const course of data) {
    applyToNode(course, modes);
    if (Array.isArray(course?.lessons)) {
      for (const lesson of course.lessons) {
        applyToNode(lesson, modes);
      }
    }
  }

  fs.writeFileSync(coursePlansPath, JSON.stringify(data, null, 4) + "\n", "utf8");

  const parts = ["removed help_penalty_mode"];
  if (modes.chat != null) parts.push(`chat_penalty_mode="${modes.chat}"`);
  if (modes.hint != null) parts.push(`hint_penalty_mode="${modes.hint}"`);
  console.log(`${parts.join("; ")} on all courses/lessons.`);
}

main();
