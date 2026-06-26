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

const DEFAULT_CHAT_DISPLAY_MODE = "Off";
const VALID_CHAT_DISPLAY_MODES = new Set(["Off", "Window", "Full", "Avatar"]);

function main() {
  const targetMode = process.argv[2] || DEFAULT_CHAT_DISPLAY_MODE;
  if (!VALID_CHAT_DISPLAY_MODES.has(targetMode)) {
    throw new Error(
      `Invalid chat_display_mode "${targetMode}". Expected one of: ${Array.from(VALID_CHAT_DISPLAY_MODES).join(", ")}`
    );
  }

  const raw = fs.readFileSync(coursePlansPath, "utf8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error("Expected coursePlans.json to contain an array at top level");
  }

  for (const course of data) {
    if (course && typeof course === "object") {
      course.chat_display_mode = targetMode;

      if (Array.isArray(course.lessons)) {
        for (const lesson of course.lessons) {
          if (lesson && typeof lesson === "object") {
            lesson.chat_display_mode = targetMode;
          }
        }
      }
    }
  }

  fs.writeFileSync(coursePlansPath, JSON.stringify(data, null, 4) + "\n", "utf8");
}

main();
