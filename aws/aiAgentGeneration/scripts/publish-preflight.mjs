/**
 * Preflight checks shared by publish-docs (and tests).
 * Validates chat_documents bindings against manifest + local compiled/assets.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
    assertSafeDocumentId,
    collectLessonDocumentBindings,
} from '../document-id-utils.mjs';

function walkAssets(node, out = []) {
    if (!node || typeof node !== 'object') return out;
    if (Array.isArray(node)) {
        for (const item of node) walkAssets(item, out);
        return out;
    }
    if (typeof node.path === 'string' && node.path.trim()) {
        out.push(node.path.trim());
    }
    if (typeof node.csv_path === 'string' && node.csv_path.trim()) {
        out.push(node.csv_path.trim());
    }
    for (const value of Object.values(node)) {
        if (value && typeof value === 'object') walkAssets(value, out);
    }
    return out;
}

/**
 * @param {object} opts
 * @param {object} opts.manifest
 * @param {array} opts.coursePlans
 * @param {string} opts.documentsRoot absolute path to documents/
 * @param {function} [opts.validateCompiled] (doc, documentsRoot) => { ok, errors }
 */
export function preflightPublish({
    manifest,
    coursePlans,
    documentsRoot,
    validateCompiled = null,
}) {
    const errors = [];
    const { bindings, duplicates } = collectLessonDocumentBindings(coursePlans);

    for (const dup of duplicates) {
        errors.push(
            `Conflicting chat_documents for duplicate lesson id: ${dup}`
        );
    }

    if (!manifest || typeof manifest !== 'object') {
        errors.push('manifest.json missing or invalid');
        return { ok: false, errors, bindings };
    }

    const referencedDocIds = new Set();
    for (const b of bindings) {
        for (const rawId of b.chat_documents) {
            let id;
            try {
                id = assertSafeDocumentId(rawId);
            } catch (err) {
                errors.push(
                    `Lesson ${b.lessonId}: ${err.message || err}`
                );
                continue;
            }
            referencedDocIds.add(id);
            if (!manifest[id]) {
                errors.push(
                    `Lesson ${b.lessonId}: chat_documents id not in manifest: ${id}`
                );
                continue;
            }
            const compiledRel =
                manifest[id].compiled || `compiled/${id}.json`;
            if (
                compiledRel.includes('..') ||
                compiledRel.startsWith('/') ||
                compiledRel.includes('\\')
            ) {
                errors.push(`Unsafe compiled path for ${id}: ${compiledRel}`);
                continue;
            }
            const compiledAbs = join(documentsRoot, compiledRel);
            if (!existsSync(compiledAbs)) {
                errors.push(`Compiled JSON missing for ${id}: ${compiledRel}`);
                continue;
            }
            let doc;
            try {
                doc = JSON.parse(readFileSync(compiledAbs, 'utf8'));
            } catch (err) {
                errors.push(`Cannot parse compiled JSON for ${id}: ${err.message}`);
                continue;
            }
            if (validateCompiled) {
                const result = validateCompiled(doc, documentsRoot);
                if (!result.ok) {
                    for (const e of result.errors || []) {
                        errors.push(`${id}: ${e}`);
                    }
                }
            }
            const assetPaths = [...new Set(walkAssets(doc))];
            for (const rel of assetPaths) {
                if (rel.includes('..') || rel.startsWith('/')) {
                    errors.push(`${id}: unsafe asset path ${rel}`);
                    continue;
                }
                const abs = join(documentsRoot, rel);
                if (!existsSync(abs)) {
                    errors.push(`${id}: missing asset ${rel}`);
                }
            }
        }
    }

    return {
        ok: errors.length === 0,
        errors,
        bindings,
        referencedDocIds: [...referencedDocIds],
    };
}
