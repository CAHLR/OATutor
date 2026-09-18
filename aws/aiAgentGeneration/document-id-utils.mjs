/**
 * Shared safety helpers for course-document IDs and S3/object keys.
 * Used by publish-docs and the Lambda document-context runtime.
 */

const SAFE_DOCUMENT_ID_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;

/**
 * Reject path traversal and unsafe document IDs.
 * @param {unknown} documentId
 * @returns {string} normalized id
 */
export function assertSafeDocumentId(documentId) {
    if (typeof documentId !== 'string' || !documentId.trim()) {
        throw new Error('document id must be a non-empty string');
    }
    const id = documentId.trim();
    if (
        id.includes('/') ||
        id.includes('\\') ||
        id.includes('..') ||
        id.includes('\0') ||
        !SAFE_DOCUMENT_ID_RE.test(id)
    ) {
        throw new Error(`unsafe document id: ${id}`);
    }
    return id;
}

/**
 * Ensure a relative key stays under the runtime prefix (no traversal).
 * @param {string} prefix e.g. "documents"
 * @param {string} relativeKey e.g. "compiled/data100-disc04.json"
 */
export function assertSafeObjectKey(prefix, relativeKey) {
    const p = String(prefix || 'documents').replace(/^\/+|\/+$/g, '');
    const rel = String(relativeKey || '')
        .replace(/^\/+/, '')
        .replace(/\\/g, '/');
    if (!rel || rel.includes('..') || rel.startsWith('/')) {
        throw new Error(`unsafe object key: ${relativeKey}`);
    }
    const full = `${p}/${rel}`;
    if (!full.startsWith(`${p}/`) || full.includes('..')) {
        throw new Error(`object key escapes prefix: ${relativeKey}`);
    }
    return full;
}

/**
 * Find a lesson by stable id in coursePlans.json (array of courses).
 */
export const OFFICE_HOURS_ID_PREFIX = 'office-hours--';

export function slugCourseName(courseName) {
    return String(courseName || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'course';
}

export function makeOfficeHoursLessonId(courseName) {
    return `${OFFICE_HOURS_ID_PREFIX}${slugCourseName(courseName)}`;
}

export function isOfficeHoursLessonId(id) {
    return typeof id === 'string' && id.startsWith(OFFICE_HOURS_ID_PREFIX);
}

export function isOfficeHoursLesson(lesson) {
    return lesson?.officeHours === true || isOfficeHoursLessonId(lesson?.id);
}

/** Max topics pasted into the system prompt (large courses have hundreds of LO keys). */
export const MAX_PROMPT_TOPICS = 40;

/** LO keys are machine ids (graph_of_linear_functions) — make them readable. */
export function humanizeTopic(value) {
    return String(value || '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Case-insensitive dedupe, preserves first-seen casing, caps length. */
function finalizeTopics(values, max = MAX_PROMPT_TOPICS) {
    const seen = new Set();
    const out = [];
    for (const raw of values) {
        const v = String(raw || '').trim();
        if (!v) continue;
        const k = v.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(v);
        if (out.length >= max) break;
    }
    return out;
}

export function collectLessonTopics(lesson) {
    const topics = [];
    const topic = String(lesson?.topics || '').trim();
    if (topic) topics.push(topic);
    for (const key of Object.keys(lesson?.learningObjectives || {})) {
        if (key) topics.push(humanizeTopic(key));
    }
    if (topics.length === 0) {
        const name = String(lesson?.name || '').replace(/##/g, '').trim();
        if (name) topics.push(name);
    }
    return finalizeTopics(topics);
}

export function collectCourseDocuments(course) {
    const ids = new Set();
    for (const lesson of course?.lessons || []) {
        if (isOfficeHoursLesson(lesson)) continue;
        for (const id of lesson.chat_documents || []) {
            if (typeof id === 'string' && id.trim()) {
                ids.add(id.trim());
            }
        }
    }
    return [...ids];
}

export function collectCourseTopics(course) {
    // Lesson-level `topics` first (curated), then humanized LO keys, so the
    // cap keeps the most meaningful entries.
    const primary = [];
    const secondary = [];
    let anyLessonTopic = false;
    for (const lesson of course?.lessons || []) {
        if (isOfficeHoursLesson(lesson)) continue;
        const topic = String(lesson.topics || '').trim();
        if (topic) {
            primary.push(topic);
            anyLessonTopic = true;
        }
        for (const key of Object.keys(lesson.learningObjectives || {})) {
            if (key) secondary.push(humanizeTopic(key));
        }
    }
    if (!anyLessonTopic) {
        for (const lesson of course?.lessons || []) {
            if (isOfficeHoursLesson(lesson)) continue;
            const name = String(lesson.name || '').replace(/##/g, '').trim();
            if (name) primary.push(name);
        }
    }
    return finalizeTopics([...primary, ...secondary]);
}

export function findCourseByOfficeHoursLessonId(coursePlans, lessonId) {
    if (!isOfficeHoursLessonId(lessonId) || !Array.isArray(coursePlans)) {
        return null;
    }
    return (
        coursePlans.find(
            (course) => makeOfficeHoursLessonId(course?.courseName) === lessonId
        ) || null
    );
}

export function findLessonById(coursePlans, lessonId) {
    if (!lessonId || !Array.isArray(coursePlans)) return null;
    for (const course of coursePlans) {
        for (const lesson of course?.lessons || []) {
            if (lesson?.id === lessonId) return lesson;
        }
    }
    return null;
}

/** Course that contains a regular (non-office-hours) lesson id. */
export function findCourseByLessonId(coursePlans, lessonId) {
    if (!lessonId || !Array.isArray(coursePlans)) return null;
    for (const course of coursePlans) {
        for (const lesson of course?.lessons || []) {
            if (lesson?.id === lessonId) return course;
        }
    }
    return null;
}

/**
 * Collect all lesson ids and chat_documents bindings from coursePlans.
 * Duplicate lesson ids are allowed when chat_documents agree; conflicts are errors.
 */
export function collectLessonDocumentBindings(coursePlans) {
    const bindings = [];
    const byLessonId = new Map();
    const conflicts = [];

    if (!Array.isArray(coursePlans)) {
        throw new Error('coursePlans.json must be an array of courses');
    }

    for (const course of coursePlans) {
        for (const lesson of course?.lessons || []) {
            const id = lesson?.id;
            if (!id) continue;
            const docs = Array.isArray(lesson.chat_documents)
                ? [...lesson.chat_documents]
                : [];
            const key = JSON.stringify(docs);
            if (!byLessonId.has(id)) {
                byLessonId.set(id, key);
            } else if (byLessonId.get(id) !== key) {
                conflicts.push(id);
            }
            bindings.push({
                lessonId: id,
                lessonName: lesson.name || null,
                courseName: course.courseName || null,
                chat_documents: docs,
            });
        }
    }

    return {
        bindings,
        duplicates: conflicts,
        conflicts,
        seenLessonIds: new Set(byLessonId.keys()),
    };
}
