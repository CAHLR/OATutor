/**
 * Regression fixture for physics7a textbook chunk indexing.
 *
 * Uses cached BDA at documents/bda-raw/physics7a-ch01-intro (no AWS / no LLM).
 *
 *   npm run test:physics7a
 */
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import {
    buildTextbookChunkIndex,
    compileDocument,
    getCompileMode,
} from './semantic-compiler.mjs';
import { validateCompiledDocument } from './validate-compiled.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_OUTPUT = resolve(
    __dirname,
    '../documents/bda-raw/physics7a-ch01-intro/output'
);

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function testPreamblePreserved() {
    const md = [
        'Opening prose that appears before any section heading.',
        '',
        '## Learning Objectives',
        '',
        'By the end of this section, you will be able to describe the scope of physics.',
        '',
        '## The Scope of Physics',
        '',
        'Physics describes the universe at every scale.',
    ].join('\n');

    const chunks = buildTextbookChunkIndex(
        md,
        'physics7a-demo',
        '1.1 Demo Section'
    );
    assert(chunks.length === 3, `expected 3 chunks, got ${chunks.length}`);
    assert(
        chunks[0].id === 'physics7a-demo::preamble',
        `expected preamble id, got ${chunks[0].id}`
    );
    assert(
        chunks[0].prompt.includes('Opening prose'),
        'preamble should keep lead-in text'
    );
    assert(
        chunks[1].id === 'physics7a-demo::learning-objectives',
        `unexpected second chunk ${chunks[1].id}`
    );
    assert(
        chunks[2].prompt.includes('every scale'),
        'later section body should remain'
    );
}

function collectProblems(doc) {
    const problems = [];
    for (const section of doc.sections || []) {
        for (const problem of section.problems || []) {
            problems.push(problem);
        }
    }
    return problems;
}

async function main() {
    testPreamblePreserved();

    const manifestEntry = {
        source: 'raw/physics/physics7a-ch01-intro.pdf',
        compiled: 'compiled/physics/physics7a-ch01-intro.json',
        course: 'physics7a',
        term: 'summer-2026',
        document_type: 'textbook',
        visibility: 'student',
        title: 'Chapter 1 Introduction',
    };

    assert(
        getCompileMode(manifestEntry) === 'textbook',
        'getCompileMode should return textbook'
    );

    process.env.COMPILER_DRY_RUN = '1';

    const tmpRoot = mkdtempSync(join(tmpdir(), 'oatutor-physics7a-reg-'));
    try {
        const result = await compileDocument({
            documentId: 'physics7a-ch01-intro',
            manifestEntry,
            documentsRoot: tmpRoot,
            bdaOutputDir: FIXTURE_OUTPUT,
            providerName: 'openai',
            bdaJobId: 'fixture-physics7a-ch01-intro',
        });

        const doc = result.compiled;
        const meta = doc.metadata || {};
        const problems = collectProblems(doc);
        const ids = problems.map((p) => p.problem_id);

        assert(result.compileMode === 'textbook', 'compileMode should be textbook');
        assert(
            (result.chunkIndex || []).length >= 1,
            `chunkIndex length >= 1, got ${(result.chunkIndex || []).length}`
        );
        assert(
            meta.document_type === 'textbook',
            `document_type=textbook, got ${meta.document_type}`
        );
        assert(
            meta.expected_problem_count >= 1,
            `expected_problem_count>=1, got ${meta.expected_problem_count}`
        );
        assert(
            problems.length === meta.expected_problem_count,
            `problem count ${problems.length} != expected ${meta.expected_problem_count}`
        );
        assert(
            new Set(ids).size === ids.length,
            'problem_id values must be unique'
        );
        for (const problem of problems) {
            assert(
                problem.prompt && problem.prompt.trim().length > 0,
                `empty prompt for ${problem.problem_id}`
            );
        }

        const validation = validateCompiledDocument(doc, tmpRoot);
        assert(
            validation.errors.length === 0,
            `validation errors: ${validation.errors.join('; ')}`
        );

        assert(
            result.compiledPath.includes('compiled/physics/physics7a-ch01-intro.json'),
            `unexpected compiled path: ${result.compiledPath}`
        );

        console.log(
            `physics7a textbook regression OK: ${problems.length} chunks, validation errors=0`
        );
    } finally {
        rmSync(tmpRoot, { recursive: true, force: true });
        delete process.env.COMPILER_DRY_RUN;
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
