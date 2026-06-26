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

const DEFAULT_CHAT_PROMPT = "PROMPTv2.txt";

function main() {
  const raw = fs.readFileSync(coursePlansPath, "utf8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error("Expected coursePlans.json to contain an array at top level");
  }

  for (const course of data) {
    if (course && typeof course === "object") {
      course.chat_prompt = DEFAULT_CHAT_PROMPT;

      if (Array.isArray(course.lessons)) {
        for (const lesson of course.lessons) {
          if (lesson && typeof lesson === "object") {
            lesson.chat_prompt = DEFAULT_CHAT_PROMPT;
          }
        }
      }
    }
  }

  fs.writeFileSync(coursePlansPath, JSON.stringify(data, null, 4) + "\n", "utf8");
}

main();
