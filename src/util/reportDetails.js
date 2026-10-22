// Details attached to a "Report a problem" submission, so a report can be triaged
// (and matched to logs) without asking the student anything beyond one line of text.

const UNKNOWN = { browser: "Unknown browser", os: "Unknown OS" };

/** "Mozilla/5.0 (Macintosh; …) Chrome/140.0.0.0 …" -> { browser: "Chrome 140", os: "macOS" } */
export const describeBrowser = (userAgent) => {
    const ua = String(userAgent || "");
    if (!ua) return { ...UNKNOWN };
    const version = (re) => (ua.match(re) || [])[1] || "";

    // Order matters: Edge and Chrome UAs also say "Safari", Edge also says "Chrome".
    let browser = UNKNOWN.browser;
    if (/Edg\//.test(ua)) browser = `Edge ${version(/Edg\/(\d+)/)}`;
    else if (/Firefox\//.test(ua)) browser = `Firefox ${version(/Firefox\/(\d+)/)}`;
    else if (/(?:Chrome|CriOS)\//.test(ua)) browser = `Chrome ${version(/(?:Chrome|CriOS)\/(\d+)/)}`;
    else if (/Version\/[\d.]+.*Safari/.test(ua)) browser = `Safari ${version(/Version\/(\d+(?:\.\d+)?)/)}`;

    // iPhones say "like Mac OS X" and Android says "Linux", so check the specific ones first.
    let os = UNKNOWN.os;
    if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
    else if (/Android/.test(ua)) os = "Android";
    else if (/CrOS/.test(ua)) os = "ChromeOS";
    else if (/Macintosh|Mac OS X/.test(ua)) os = "macOS";
    else if (/Windows/.test(ua)) os = "Windows";
    else if (/Linux/.test(ua)) os = "Linux";

    return { browser: browser.trim(), os };
};

/** Display labels for buildReportDetails' fields, in the order they're shown. */
export const REPORT_DETAIL_FIELDS = [
    ["problemId", "Problem ID"],
    ["problemTitle", "Problem"],
    ["part", "Part"],
    ["lessonId", "Lesson ID"],
    ["lesson", "Lesson"],
    ["course", "Course"],
    ["url", "Page"],
    ["browser", "Browser"],
    ["os", "OS"],
    ["screen", "Screen"],
    ["time", "Time"],
    ["appVersion", "App version"],
];

const text = (value) => (value == null ? "" : String(value));

/**
 * Pure: the caller passes in what it read from the page (problem, lesson, URL, user agent…).
 * Every value is a string so the report can go straight into a form, a sheet or a Slack message.
 */
export const buildReportDetails = ({
    problem,
    lesson,
    lessonLabel,
    activePart,
    pageUrl,
    userAgent,
    viewport,
    time = new Date(),
    appVersion,
} = {}) => {
    const { browser, os } = describeBrowser(userAgent);
    const partNumber = Number(activePart?.number);
    const part = Number.isFinite(partNumber) && partNumber > 0
        ? activePart.total
            ? `${partNumber} of ${activePart.total}`
            : String(partNumber)
        : "";
    const screen = viewport?.width && viewport?.height ? `${viewport.width} × ${viewport.height}` : "";

    return {
        problemId: text(problem?.id),
        problemTitle: text(problem?.title),
        part,
        lessonId: text(lesson?.id),
        lesson: text(lessonLabel || lesson?.name),
        course: text(lesson?.courseName),
        url: text(pageUrl),
        browser,
        os,
        screen,
        time: time.toISOString(),
        appVersion: text(appVersion) || "dev",
    };
};
