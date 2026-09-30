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

const DEFAULT_CHAT_MODEL = "gpt-4o";

function main() {
  const targetModel = (process.argv[2] || DEFAULT_CHAT_MODEL).trim();
  if (!targetModel) {
    throw new Error("chat_model must be a non-empty OpenAI model name.");
  }

  const raw = fs.readFileSync(coursePlansPath, "utf8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error("Expected coursePlans.json to contain an array at top level");
  }

  for (const course of data) {
    if (course && typeof course === "object") {
      course.chat_model = targetModel;

      if (Array.isArray(course.lessons)) {
        for (const lesson of course.lessons) {
          if (lesson && typeof lesson === "object") {
            lesson.chat_model = targetModel;
          }
        }
      }
    }
  }

  fs.writeFileSync(coursePlansPath, JSON.stringify(data, null, 4) + "\n", "utf8");
  console.log(`Set chat_model="${targetModel}" on all courses/lessons.`);
}

main();
