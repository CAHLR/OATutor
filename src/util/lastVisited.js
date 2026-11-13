// "Pick up where you left off": remembers the last lesson a student opened in each course
// and works out what the Resume button should open.

import { MASTERY_THRESHOLD, PROGRESS_STORAGE_KEY } from "../config/config.js";
import { isFullChatLesson } from "./officeHours.js";

// Prefixed with PROGRESS_STORAGE_KEY so Reset Progress clears it too.
export const LAST_VISITED_KEY = `${PROGRESS_STORAGE_KEY}-last-visited`;

// Below this raw mastery a lesson counts as untouched (the default BKT prior is 0.1).
const STARTED_THRESHOLD = 0.11;

// Writes are queued so two quick visits can't land out of order.
let pendingWrite = Promise.resolve();

/**
 * @param browserStorage context.browserStorage
 * @param entry {{lessonId: string, courseName: string}}
 */
export const recordLastVisited = (browserStorage, entry) => {
    pendingWrite = pendingWrite.then(() => writeLastVisited(browserStorage, entry));
    return pendingWrite;
};

const writeLastVisited = async (browserStorage, entry) => {
    if (!browserStorage || !entry?.lessonId || !entry?.courseName) return;
    const existing = (await getLastVisited(browserStorage)) || { byCourse: {} };
    const visit = { lessonId: entry.lessonId, courseName: entry.courseName, at: Date.now() };
    try {
        await browserStorage.setByKey(LAST_VISITED_KEY, {
            byCourse: { ...(existing.byCourse || {}), [entry.courseName]: visit },
        });
    } catch (e) {
        // Not critical: the resume card just won't show.
    }
};

export const getLastVisited = async (browserStorage) => {
    if (!browserStorage) return null;
    try {
        const value = await browserStorage.getByKey(LAST_VISITED_KEY);
        return value && typeof value === "object" ? value : null;
    } catch (e) {
        return null;
    }
};

/** The course a meta-lesson belongs to (meta-lessons don't carry their courseName). */
export const courseNameForMetaLesson = (coursePlans, metaLessonId) =>
    coursePlans.find((course) => (course.metaLessons || []).some((m) => m.id === metaLessonId))?.courseName ||
    null;

const lessonMasteryThreshold = (lesson) =>
    Object.values(lesson?.learningObjectives || {}).find((value) => typeof value === "number" && value > 0) ||
    MASTERY_THRESHOLD;

/** Average mastery across the lesson's learning objectives (same inputs as the lesson mastery bar). */
export const lessonRawMastery = (lesson, bktParams = {}) => {
    const kcs = Object.keys(lesson?.learningObjectives || {});
    let sum = 0;
    let count = 0;
    kcs.forEach((kc) => {
        const m = bktParams?.[kc]?.probMastery;
        if (typeof m === "number" && !Number.isNaN(m)) {
            sum += m;
            count += 1;
        }
    });
    return count ? sum / count : 0;
};

/** @returns {"mastered"|"in-progress"|"not-started"} */
export const lessonStatus = (lesson, bktParams) => {
    const raw = lessonRawMastery(lesson, bktParams);
    if (raw >= lessonMasteryThreshold(lesson)) return "mastered";
    if (raw >= STARTED_THRESHOLD) return "in-progress";
    return "not-started";
};

/**
 * What Resume opens: the most recently visited lesson that still exists, or, when that lesson
 * is already mastered, the next unmastered lesson after it in the same course. Courses with
 * nothing left fall through to the next most recent visit.
 * @returns {null | {kind: "resume"|"up-next", course, courseIndex, lesson, finished?, at}}
 */
export const resolveResume = (lastVisited, coursePlans, bktParams) => {
    const visits = Object.values(lastVisited?.byCourse || {})
        .filter((visit) => visit?.lessonId && visit?.courseName)
        .sort((a, b) => (b.at || 0) - (a.at || 0));

    for (const visit of visits) {
        const courseIndex = coursePlans.findIndex((course) => course.courseName === visit.courseName);
        if (courseIndex < 0) continue;
        const course = coursePlans[courseIndex];
        const lessons = course.lessons || [];
        const base = { course, courseIndex, at: visit.at };

        const metaLesson = (course.metaLessons || []).find((m) => m.id === visit.lessonId);
        if (metaLesson) return { ...base, kind: "resume", lesson: metaLesson };

        const index = lessons.findIndex((lesson) => lesson.id === visit.lessonId);
        if (index < 0) continue;
        if (lessonStatus(lessons[index], bktParams) !== "mastered") {
            return { ...base, kind: "resume", lesson: lessons[index] };
        }
        // Skip what the course page hides or that has no mastery to finish: A/B variants
        // (reached only through their meta-lesson) and chat-only lessons like Office Hours.
        const variantIds = new Set((course.metaLessons || []).flatMap((m) => m.lessons || []));
        const next = lessons.find(
            (lesson, i) =>
                i > index &&
                !variantIds.has(lesson.id) &&
                !variantIds.has(lesson.metaId) &&
                !isFullChatLesson(lesson) &&
                lessonStatus(lesson, bktParams) !== "mastered"
        );
        if (next) return { ...base, kind: "up-next", lesson: next, finished: lessons[index] };
    }
    return null;
};
