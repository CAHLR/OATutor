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
export function findLessonById(coursePlans, lessonId) {
    if (!lessonId || !Array.isArray(coursePlans)) return null;
    for (const course of coursePlans) {
        for (const lesson of course?.lessons || []) {
            if (lesson?.id === lessonId) return lesson;
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
