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

const DEFAULT_OFFICE_HOURS = false;

function parseOfficeHoursFlag(raw) {
  const value = String(raw ?? DEFAULT_OFFICE_HOURS).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(value)) return true;
  if (["false", "0", "no", "off"].includes(value)) return false;
  throw new Error(
    `Invalid office_hours "${raw}". Expected true or false (default: false).`
  );
}

/**
 * Ensure each course object has office_hours immediately after courseName
 * so the field stays visible at the top of the course block.
 */
function withOfficeHours(course, officeHours) {
  const next = {};
  let inserted = false;
  for (const [key, value] of Object.entries(course)) {
    if (key === "office_hours") continue;
    next[key] = value;
    if (key === "courseName") {
      next.office_hours = officeHours;
      inserted = true;
    }
  }
  if (!inserted) {
    next.office_hours = officeHours;
  }
  return next;
}

function main() {
  const officeHours = parseOfficeHoursFlag(process.argv[2]);

  const raw = fs.readFileSync(coursePlansPath, "utf8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error("Expected coursePlans.json to contain an array at top level");
  }

  let updated = 0;
  let unchanged = 0;
  for (let i = 0; i < data.length; i++) {
    const course = data[i];
    if (!course || typeof course !== "object") continue;
    if (course.office_hours === officeHours) {
      // Still rewrite order so office_hours sits after courseName.
      data[i] = withOfficeHours(course, officeHours);
      unchanged++;
      continue;
    }
    data[i] = withOfficeHours(course, officeHours);
    updated++;
  }

  fs.writeFileSync(coursePlansPath, JSON.stringify(data, null, 4) + "\n", "utf8");
  console.log(
    `Set course-level office_hours=${officeHours} on ${data.length} courses ` +
      `(changed ${updated}, already ${unchanged}).`
  );
}

main();
