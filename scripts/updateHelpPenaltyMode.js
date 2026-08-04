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

const DEFAULT_HELP_PENALTY_MODE = "AnswerReveal";
const VALID_HELP_PENALTY_MODES = new Set(["Never", "AnswerReveal", "OnOpen"]);

function main() {
  const targetMode = process.argv[2] || DEFAULT_HELP_PENALTY_MODE;
  if (!VALID_HELP_PENALTY_MODES.has(targetMode)) {
    throw new Error(
      `Invalid help_penalty_mode "${targetMode}". Expected one of: ${Array.from(VALID_HELP_PENALTY_MODES).join(", ")}`
    );
  }

  const raw = fs.readFileSync(coursePlansPath, "utf8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error("Expected coursePlans.json to contain an array at top level");
  }

  for (const course of data) {
    if (course && typeof course === "object") {
      course.help_penalty_mode = targetMode;

      if (Array.isArray(course.lessons)) {
        for (const lesson of course.lessons) {
          if (lesson && typeof lesson === "object") {
            lesson.help_penalty_mode = targetMode;
          }
        }
      }
    }
  }

  fs.writeFileSync(coursePlansPath, JSON.stringify(data, null, 4) + "\n", "utf8");
  console.log(`Set help_penalty_mode="${targetMode}" on all courses/lessons.`);
}

main();
