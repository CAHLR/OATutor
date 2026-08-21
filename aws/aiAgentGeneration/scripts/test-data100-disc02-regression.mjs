/**
 * Regression fixture for data100-disc02 question indexing.
 *
 * Guards against reintroducing LLM-driven ID/count bugs:
 *   expected_problem_count = 10
 *   eda-practice = 6
 *   visualizations = 4
 *   unique problem IDs, nonempty prompts, validation errors = 0
 *
 * Uses documents/bda-raw/_fixtures/data100-disc02 (no AWS / no LLM).
 *
 *   npm run test:disc02
 */
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { compileDocument } from './semantic-compiler.mjs';
import { validateCompiledDocument } from './validate-compiled.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_OUTPUT = resolve(
    __dirname,
    '../documents/bda-raw/_fixtures/data100-disc02/output'
);

function assert(condition, message) {
    if (!condition) throw new Error(message);
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
    process.env.COMPILER_DRY_RUN = '1';

    const tmpRoot = mkdtempSync(join(tmpdir(), 'oatutor-disc02-reg-'));
    try {
        const result = await compileDocument({
            documentId: 'data100-disc02',
            manifestEntry: {
                source: 'raw/data100-disc02.pdf',
                compiled: 'compiled/data100-disc02.json',
                course: 'data100',
                term: 'summer-2026',
                document_type: 'discussion_solutions',
                visibility: 'private_tutor',
                title: 'Discussion #2 Solutions',
            },
            documentsRoot: tmpRoot,
            bdaOutputDir: FIXTURE_OUTPUT,
            providerName: 'openai',
            bdaJobId: 'fixture-data100-disc02',
        });

        const doc = result.compiled;
        const meta = doc.metadata || {};
        const sections = meta.detected_sections || {};
        const problems = collectProblems(doc);
        const ids = problems.map((p) => p.problem_id);

        assert(
            meta.expected_problem_count === 10,
            `expected_problem_count=10, got ${meta.expected_problem_count}`
        );
        assert(
            sections['eda-practice'] === 6,
            `eda-practice=6, got ${sections['eda-practice']}`
        );
        assert(
            sections.visualizations === 4,
            `visualizations=4, got ${sections.visualizations}`
        );
        assert(problems.length === 10, `problems.length=10, got ${problems.length}`);
        assert(
            new Set(ids).size === ids.length,
            `duplicate problem IDs: ${ids.join(', ')}`
        );
        for (const problem of problems) {
            assert(
                typeof problem.prompt === 'string' && problem.prompt.trim().length > 0,
                `empty prompt for ${problem.problem_id}`
            );
            for (const asset of [
                ...(problem.assets || []),
                ...(problem.solution?.assets || []),
            ]) {
                assert(
                    !('unresolved_source_url' in asset),
                    `unresolved_source_url leaked in ${problem.problem_id}`
                );
            }
        }

        const validation = validateCompiledDocument(doc, tmpRoot);
        assert(
            validation.errors.length === 0,
            `validation errors=${validation.errors.length}: ${validation.errors.join('; ')}`
        );

        console.log('PASS data100-disc02 regression');
        console.log(
            JSON.stringify(
                {
                    expected_problem_count: meta.expected_problem_count,
                    detected_sections: sections,
                    unique_ids: ids.length,
                    validation_errors: 0,
                },
                null,
                2
            )
        );
    } finally {
        rmSync(tmpRoot, { recursive: true, force: true });
    }
}

main().catch((err) => {
    console.error('FAIL data100-disc02 regression:', err.message || err);
    process.exit(1);
});
