export const OFFICE_HOURS_CHAT_PROMPT = "PROMPT-officehours.txt";

export const OFFICE_HOURS_ID_PREFIX = "office-hours--";

export function slugCourseName(courseName) {
    return String(courseName || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "course";
}

export function makeOfficeHoursLessonId(courseName) {
    return `${OFFICE_HOURS_ID_PREFIX}${slugCourseName(courseName)}`;
}

export function isOfficeHoursLessonId(id) {
    return typeof id === "string" && id.startsWith(OFFICE_HOURS_ID_PREFIX);
}

export function isOfficeHoursLesson(lesson) {
    return lesson?.officeHours === true || isOfficeHoursLessonId(lesson?.id);
}

/** Full-page chat: synthetic Office Hours or an authored lesson with chat_display_mode Full. */
export function isFullChatLesson(lesson) {
    return isOfficeHoursLesson(lesson) || lesson?.chat_display_mode === "Full";
}

export function collectLessonTopics(lesson) {
    const topics = new Set();
    const topic = String(lesson?.topics || "").trim();
    if (topic) topics.add(topic);
    for (const key of Object.keys(lesson?.learningObjectives || {})) {
        if (key) topics.add(key);
    }
    if (topics.size === 0) {
        const name = String(lesson?.name || "").replace(/##/g, "").trim();
        if (name) topics.add(name);
    }
    return [...topics];
}

export function isEditorCourse(course) {
    return Boolean(course?.editor) || String(course?.courseName || "").startsWith("!!");
}

/**
 * Per-course toggle in coursePlans.json (`office_hours: true|false`).
 * Missing / false → no synthetic Office Hours lesson. Editor courses never get one.
 */
export function courseHasOfficeHours(course) {
    return course?.office_hours === true && !isEditorCourse(course);
}

export function collectCourseTopics(course) {
    const topics = new Set();
    let anyLessonTopic = false;
    for (const lesson of course?.lessons || []) {
        if (isOfficeHoursLesson(lesson)) continue;
        const topic = String(lesson.topics || "").trim();
        if (topic) {
            topics.add(topic);
            anyLessonTopic = true;
        }
        for (const key of Object.keys(lesson.learningObjectives || {})) {
            if (key) topics.add(key);
        }
    }
    if (!anyLessonTopic) {
        for (const lesson of course?.lessons || []) {
            if (isOfficeHoursLesson(lesson)) continue;
            const name = String(lesson.name || "").replace(/##/g, "").trim();
            if (name) topics.add(name);
        }
    }
    return [...topics];
}

export function collectCourseDocuments(course) {
    const ids = new Set();
    for (const lesson of course?.lessons || []) {
        if (isOfficeHoursLesson(lesson)) continue;
        for (const id of lesson.chat_documents || []) {
            if (typeof id === "string" && id.trim()) {
                ids.add(id.trim());
            }
        }
    }
    return [...ids];
}

export function buildOfficeHoursLesson(course) {
    const courseName = course?.courseName;
    return {
        id: makeOfficeHoursLessonId(courseName),
        name: "Office Hours",
        topics: "Ask about any topic in this course",
        officeHours: true,
        chat_display_mode: "Full",
        chat_prompt: OFFICE_HOURS_CHAT_PROMPT,
        chat_penalty_mode: "Never",
        hint_penalty_mode: "Never",
        learningObjectives: {},
        allowRecycle: false,
        chat_model: course?.chat_model,
        courseTopics: collectCourseTopics(course),
        chat_documents: collectCourseDocuments(course),
    };
}

export function findCourseByOfficeHoursLessonId(coursePlans, lessonId) {
    if (!isOfficeHoursLessonId(lessonId) || !Array.isArray(coursePlans)) {
        return null;
    }
    return coursePlans.find(
        (course) => makeOfficeHoursLessonId(course?.courseName) === lessonId
    ) || null;
}
