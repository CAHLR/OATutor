/**
 * Phase 3 unit tests: document context runtime + publish preflight.
 *
 *   node scripts/test-document-context.mjs
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import {
    assertSafeDocumentId,
    findLessonById,
    collectLessonDocumentBindings,
} from '../document-id-utils.mjs';
import {
    createDocumentContextRuntime,
    createTtlCache,
    selectRelevantUnits,
    formatPrivateCourseReference,
    resolveMaterialType,
    toStudentFacingMaterialTitle,
    resetDefaultDocumentContextRuntime,
} from '../document-context.mjs';
import { preflightPublish } from './publish-preflight.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');
const REPO_ROOT = resolve(PKG_ROOT, '../..');
const DOCS_ROOT = join(PKG_ROOT, 'documents');
const COURSE_PLANS_PATH = join(
    REPO_ROOT,
    'src/content-sources/oatutor/coursePlans.json'
);
const DISC4_LESSON_ID = '0dJYDToW-hati-SjwIXGncTg';
const MULTI_DOC_LESSON_ID = 'phase3-multi-doc-test-lesson';

function assert(cond, msg) {
    if (!cond) throw new Error(msg);
}

function assertThrows(fn, msgIncludes) {
    let threw = false;
    try {
        fn();
    } catch (err) {
        threw = true;
        if (msgIncludes && !String(err.message || err).includes(msgIncludes)) {
            throw new Error(
                `expected error containing "${msgIncludes}", got: ${err.message}`
            );
        }
    }
    if (!threw) throw new Error(`expected throw (${msgIncludes || 'any'})`);
}

async function main() {
    resetDefaultDocumentContextRuntime();

    // No lesson-document-map.json required
    assert(
        !existsSync(join(DOCS_ROOT, 'lesson-document-map.json')),
        'lesson-document-map.json must not exist'
    );

    const coursePlans = JSON.parse(readFileSync(COURSE_PLANS_PATH, 'utf8'));
    const lesson = findLessonById(coursePlans, DISC4_LESSON_ID);
    assert(lesson, 'Disc4 lesson not found in coursePlans');
    assert(
        Array.isArray(lesson.chat_documents) &&
            lesson.chat_documents.includes('data100-disc04'),
        'Disc4 must bind data100-disc04 via chat_documents'
    );

    // Unknown lesson
    assert(
        findLessonById(coursePlans, 'no-such-lesson') === null,
        'unknown lesson should be null'
    );

    // Safe id checks
    assertSafeDocumentId('data100-disc04');
    assertThrows(() => assertSafeDocumentId('../etc'), 'unsafe');
    assertThrows(() => assertSafeDocumentId('a/b'), 'unsafe');
    assertThrows(() => assertSafeDocumentId(''), 'non-empty');

    // Conflicting duplicate lesson ids (same id, different chat_documents)
    const { conflicts } = collectLessonDocumentBindings(coursePlans);
    assert(
        conflicts.length === 0,
        `conflicting lesson chat_documents: ${conflicts}`
    );

    assert(
        resolveMaterialType({ document_type: 'discussion_solutions' }) ===
            'worksheet',
        'discussion_solutions → worksheet'
    );
    assert(
        resolveMaterialType({ document_type: 'syllabus' }) === 'syllabus',
        'syllabus → syllabus'
    );
    assert(
        toStudentFacingMaterialTitle('data100-syllabus', {
            course: 'data100',
            title: 'Syllabus',
            document_type: 'syllabus',
        }) === 'Data 100 Syllabus',
        'syllabus title mapping'
    );

    // Build a local runtime root that mirrors S3 layout under documents/
    const tmp = mkdtempSync(join(tmpdir(), 'oatutor-p3-'));
    try {
        mkdirSync(join(tmp, 'compiled'), { recursive: true });
        mkdirSync(join(tmp, 'assets'), { recursive: true });

        const plansWithMulti = [
            ...coursePlans,
            {
                courseName: 'Phase3 MultiDoc Test Course',
                lessons: [
                    {
                        id: MULTI_DOC_LESSON_ID,
                        name: 'Multi-doc lesson',
                        chat_documents: [
                            'data100-disc04',
                            'data100-disc05',
                            'data100-syllabus',
                        ],
                    },
                ],
            },
        ];
        writeFileSync(
            join(tmp, 'coursePlans.json'),
            JSON.stringify(plansWithMulti)
        );

        const baseManifest = JSON.parse(
            readFileSync(join(DOCS_ROOT, 'manifest.json'), 'utf8')
        );
        baseManifest['data100-syllabus'] = {
            source: 'raw/data100-syllabus.pdf',
            compiled: 'compiled/data100-syllabus.json',
            course: 'data100',
            term: 'summer-2026',
            document_type: 'syllabus',
            visibility: 'private_tutor',
            title: 'Syllabus',
        };
        writeFileSync(join(tmp, 'manifest.json'), JSON.stringify(baseManifest));
        writeFileSync(
            join(tmp, 'compiled/data100-disc04.json'),
            readFileSync(join(DOCS_ROOT, 'compiled/data100-disc04.json'))
        );
        writeFileSync(
            join(tmp, 'compiled/data100-disc05.json'),
            readFileSync(join(DOCS_ROOT, 'compiled/data100-disc05.json'))
        );
        writeFileSync(
            join(tmp, 'compiled/data100-syllabus.json'),
            JSON.stringify({
                document_id: 'data100-syllabus',
                metadata: {
                    course: 'data100',
                    document_type: 'syllabus',
                    visibility: 'private_tutor',
                    parser_version: 'test',
                    content_hash: 'syllabus-hash',
                    source_pdf: 'raw/data100-syllabus.pdf',
                    expected_problem_count: 0,
                    title: 'Syllabus',
                },
                sections: [
                    {
                        section_id: 'late-work',
                        title: 'Late Work Policy',
                        concepts: [],
                        content:
                            'Late work may be accepted with a penalty unless prior arrangements are made.',
                        problems: [],
                    },
                ],
                question_inventory: [],
            })
        );

        // Extra compiled doc NOT bound to disc4 lesson — must not load for that lesson
        writeFileSync(
            join(tmp, 'compiled/data100-disc99.json'),
            JSON.stringify({
                document_id: 'data100-disc99',
                metadata: {
                    course: 'data100',
                    document_type: 'discussion_solutions',
                    visibility: 'private_tutor',
                    parser_version: 'test',
                    content_hash: 'x',
                    source_pdf: 'raw/x.pdf',
                    expected_problem_count: 1,
                },
                sections: [
                    {
                        section_id: 'sec',
                        title: 'Secret joins elsewhere',
                        concepts: [],
                        problems: [
                            {
                                problem_id: 'data100-disc99-secret-q1',
                                number: '1',
                                prompt: 'CROSS JOIN secret m times n',
                                choices: [],
                                solution: { text: 'SECRET_SOLUTION_TEXT_XYZ' },
                            },
                        ],
                    },
                ],
                question_inventory: [],
            })
        );

        let now = 1_000_000;
        const runtime = createDocumentContextRuntime({
            documentsRoot: tmp,
            ttlMs: 1000,
            nowFn: () => now,
        });

        // Client spoof ignored: even if clientHints list disc99, only chat_documents used
        const ctx1 = await runtime.buildDocumentContext({
            lessonId: DISC4_LESSON_ID,
            userMessage:
                'Why is a bar chart appropriate for comparing the number of Bigfoot sightings across seasons?',
            problemContext: {
                problemTitle: 'Bigfoot visualizations',
                problemBody: 'season categorical frequencies',
            },
            clientHints: {
                chat_documents: ['data100-disc99'],
                documentId: 'data100-disc99',
                s3Key: 'documents/compiled/data100-disc99.json',
            },
        });
        assert(ctx1?.documentIds?.includes('data100-disc04'), 'must load disc04');
        assert(
            !ctx1?.documentIds?.includes('data100-disc99'),
            'must not load client-spoofed disc99'
        );
        assert(
            ctx1.selectedObjectIds.some((id) => /document-q1|q1/i.test(id)),
            `bar chart query should prefer viz/bigfoot problem, got ${ctx1.selectedObjectIds}`
        );
        assert(
            Array.isArray(ctx1.selectedContexts) &&
                ctx1.selectedContexts.length > 0,
            'selectedContexts required for logging'
        );
        assert(
            ctx1.selectedContexts.every(
                (c) =>
                    typeof c.documentId === 'string' &&
                    typeof c.problemId === 'string' &&
                    typeof c.score === 'number'
            ),
            'selectedContexts must include documentId/problemId/score only'
        );
        assert(
            ctx1.selectedContexts.length <= 5,
            `expected at most top-5 contexts, got ${ctx1.selectedContexts.length}`
        );
        assert(
            ctx1.privatePromptSection?.includes('PRIVATE COURSE REFERENCE'),
            'private reference section missing'
        );
        assert(
            ctx1.privatePromptSection.includes('ACCESSIBLE COURSE MATERIALS'),
            'missing accessible materials inventory'
        );
        assert(
            ctx1.privatePromptSection.includes('<course_context>'),
            'missing course_context blocks'
        );
        assert(
            ctx1.privatePromptSection.includes('discussion worksheet') ||
                ctx1.privatePromptSection.includes('course materials'),
            'should describe material as worksheet/course materials'
        );
        assert(
            ctx1.privatePromptSection.includes('material_type: worksheet'),
            'missing material_type metadata'
        );
        assert(
            ctx1.privatePromptSection.includes(
                'material_title: Data 100 Discussion 4'
            ),
            `expected student-facing title, got snippet: ${ctx1.privatePromptSection.slice(0, 500)}`
        );
        assert(
            !/Discussion #4 Solutions/i.test(
                ctx1.privatePromptSection.split('<course_context>')[0]
            ),
            'must not call material "Discussion 4 Solutions" in header metadata'
        );
        assert(
            ctx1.privatePromptSection.includes(
                'Do not claim that you lack access'
            ),
            'should instruct model not to deny access'
        );
        assert(
            ctx1.privatePromptSection.includes(
                'Do not mention an answer key'
            ),
            'should forbid mentioning retrieval internals'
        );

        const ctx2 = await runtime.buildDocumentContext({
            lessonId: DISC4_LESSON_ID,
            userMessage:
                'What is the maximum number of rows from a cross join of tables with m and n rows?',
            problemContext: { problemTitle: 'SQL joins', problemBody: 'cross join' },
        });
        assert(
            ctx2.selectedObjectIds.some((id) => /joins/i.test(id)),
            `cross join query should prefer joins object, got ${ctx2.selectedObjectIds}`
        );

        // Multi-document lesson: global rank + per-block source identity + full inventory
        const multi = await runtime.buildDocumentContext({
            lessonId: MULTI_DOC_LESSON_ID,
            userMessage:
                'What is the late work policy and also how does cross join row count work with regression?',
            problemContext: {
                problemTitle: 'Policies and regression',
                problemBody: 'late work syllabus cross join regression',
            },
        });
        assert(
            multi.allowedDocumentIds?.join(',') ===
                'data100-disc04,data100-disc05,data100-syllabus',
            `allowedDocumentIds mismatch: ${multi.allowedDocumentIds}`
        );
        assert(
            multi.privatePromptSection.includes('data100-disc04') &&
                multi.privatePromptSection.includes('data100-disc05') &&
                multi.privatePromptSection.includes('data100-syllabus'),
            'inventory must list all allowed documents'
        );
        assert(
            multi.privatePromptSection.includes(
                'material_title: Data 100 Syllabus'
            ),
            'syllabus title missing from inventory'
        );
        assert(
            multi.privatePromptSection.includes('material_type: syllabus'),
            'syllabus material_type missing'
        );
        // Retrieved blocks must each carry their own document identity
        const blocks = multi.privatePromptSection
            .split(/<course_context>\n/)
            .slice(1);
        assert(blocks.length >= 1, 'expected at least one course_context');
        for (const block of blocks) {
            assert(
                /document_id:\s*data100-/.test(block),
                'each course_context needs document_id'
            );
            assert(
                /material_type:\s*\w+/.test(block),
                'each course_context needs material_type'
            );
            assert(
                /material_title:/.test(block),
                'each course_context needs material_title'
            );
        }
        assert(
            multi.selectedContexts.every((c) =>
                multi.allowedDocumentIds.includes(c.documentId)
            ),
            'selectedContexts must stay within allowlist'
        );
        assert(
            multi.selectedContexts.length <= 5,
            'multi-doc selection capped at ~5'
        );

        // Unknown lesson → empty docs
        const ctx3 = await runtime.buildDocumentContext({
            lessonId: 'unknown-lesson-xyz',
            userMessage: 'hello',
            problemContext: {},
        });
        assert(
            Array.isArray(ctx3.documentIds) && ctx3.documentIds.length === 0,
            'unknown lesson should retrieve no documents'
        );

        // Cache hit
        const a = await runtime.buildDocumentContext({
            lessonId: DISC4_LESSON_ID,
            userMessage: 'joins',
            problemContext: {},
        });
        assert(a.meta.cacheHits.coursePlans === true, 'coursePlans should be cached');
        assert(a.meta.cacheHits.manifest === true, 'manifest should be cached');

        // Cache expiry
        now += 5000;
        const b = await runtime.buildDocumentContext({
            lessonId: DISC4_LESSON_ID,
            userMessage: 'joins again',
            problemContext: {},
        });
        assert(
            b.meta.cacheHits.coursePlans === false,
            'coursePlans cache should expire'
        );

        // Missing loader soft path via buildDocumentContext wrapper
        resetDefaultDocumentContextRuntime();
        const { buildDocumentContext } = await import('../document-context.mjs');
        // No bucket / no local root on default runtime → null
        delete process.env.COURSE_DOCS_RUNTIME_BUCKET;
        const soft = await buildDocumentContext({
            lessonId: DISC4_LESSON_ID,
            userMessage: 'x',
            problemContext: {},
        });
        assert(soft === null, 'missing bucket should return null, not throw');

        // Off-allowlist: selecting units only from loaded docs (already checked)
        const disc04 = JSON.parse(
            readFileSync(join(tmp, 'compiled/data100-disc04.json'), 'utf8')
        );
        const units = [];
        for (const section of disc04.sections || []) {
            for (const problem of section.problems || []) {
                units.push({
                    unit_id: problem.problem_id,
                    corpus: `${section.title} ${problem.prompt} ${(problem.solution?.text) || ''}`,
                    document_id: 'data100-disc04',
                    material_type: 'worksheet',
                    material_title: 'Data 100 Discussion 4',
                    section_title: section.title,
                    problem_id: problem.problem_id,
                    prompt: problem.prompt,
                    choices: problem.choices || [],
                    concepts: section.concepts || [],
                    knowledge_components: [],
                    solution_guidance: problem.solution?.text || '',
                    analysis_plan: [],
                    code_blocks: [],
                    assets: [],
                    pages: [],
                });
            }
        }
        const picked = selectRelevantUnits(
            units,
            'cross join maximum rows m n'
        );
        assert(
            picked[0]?.unit?.unit_id?.includes('joins'),
            `expected joins first, got ${picked[0]?.unit?.unit_id}`
        );
        assert(
            typeof picked[0]?.score === 'number' && picked[0].score > 0,
            'selectRelevantUnits must return integer scores'
        );
        const none = selectRelevantUnits(units, 'zzzznonmatchingtokenqqq');
        assert(
            none.length === 0,
            'zero positive matches should yield 0 contexts (no min padding)'
        );

        // Privacy: formatter may include guidance; test logger must not be fed solution
        const formatted = formatPrivateCourseReference(
            picked.slice(0, 1).map((p) => p.unit),
            {
                materials: [
                    {
                        document_id: 'data100-disc04',
                        material_type: 'worksheet',
                        material_title: 'Data 100 Discussion 4',
                    },
                ],
            }
        );
        assert(formatted.includes('PRIVATE COURSE REFERENCE'));
        assert(formatted.includes('<course_context>'));
        assert(formatted.includes('document_id: data100-disc04'));
        assert(formatted.includes('material_title: Data 100 Discussion 4'));
        const logFn = (evt) => {
            const blob = JSON.stringify(evt);
            assert(
                !blob.includes('SECRET_SOLUTION_TEXT_XYZ'),
                'logs must not contain secret solution text'
            );
            assert(
                !blob.includes('solution_guidance'),
                'logs must not dump private context fields'
            );
        };
        logFn({
            eventType: 'document_context_loaded',
            allowedDocumentIds: ctx1.allowedDocumentIds,
            selectedContexts: ctx1.selectedContexts,
        });

        // TTL cache unit
        let t = 0;
        const cache = createTtlCache(10, () => t);
        cache.set('k', 1);
        assert(cache.get('k') === 1);
        t = 20;
        assert(cache.get('k') === undefined, 'ttl expired');

        // publish preflight dry checks
        const manifest = JSON.parse(
            readFileSync(join(DOCS_ROOT, 'manifest.json'), 'utf8')
        );
        const ok = preflightPublish({
            manifest,
            coursePlans,
            documentsRoot: DOCS_ROOT,
        });
        // May fail if some chat_documents assets missing on disk — report clearly
        if (!ok.ok) {
            console.warn(
                'publish preflight warnings (may need assets locally):',
                ok.errors.slice(0, 5)
            );
        }

        // Bad id rejected by preflight
        const badPlans = [
            {
                courseName: 'X',
                lessons: [
                    {
                        id: 'lesson-bad',
                        chat_documents: ['../evil'],
                    },
                ],
            },
        ];
        const bad = preflightPublish({
            manifest,
            coursePlans: badPlans,
            documentsRoot: DOCS_ROOT,
        });
        assert(!bad.ok, 'preflight must reject path-traversal document ids');

        // Missing compiled
        const missingPlans = [
            {
                courseName: 'X',
                lessons: [
                    {
                        id: 'lesson-missing',
                        chat_documents: ['data100-disc04'],
                    },
                ],
            },
        ];
        const emptyRoot = mkdtempSync(join(tmpdir(), 'oatutor-empty-'));
        try {
            writeFileSync(join(emptyRoot, 'noop'), '');
            const miss = preflightPublish({
                manifest: {
                    'data100-disc04': { compiled: 'compiled/data100-disc04.json' },
                },
                coursePlans: missingPlans,
                documentsRoot: emptyRoot,
            });
            assert(!miss.ok, 'preflight must reject missing compiled JSON');
        } finally {
            rmSync(emptyRoot, { recursive: true, force: true });
        }

        console.log('PASS phase3 document-context tests');
    } finally {
        rmSync(tmp, { recursive: true, force: true });
        resetDefaultDocumentContextRuntime();
    }
}

main().catch((err) => {
    console.error('FAIL phase3 document-context tests:', err.message || err);
    process.exit(1);
});
