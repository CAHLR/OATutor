/**
 * Validate compiled learning-object JSON against schema + relationship rules.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { looksTruncatedPrompt } from './semantic-compiler.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = resolve(__dirname, '../documents');
const SCHEMA_PATH = resolve(__dirname, '../schemas/learning-object.schema.json');

const require = createRequire(import.meta.url);

function loadAjv() {
    try {
        const Ajv2020 = require('ajv/dist/2020.js');
        const addFormats = require('ajv-formats');
        const ajv = new Ajv2020({ allErrors: true, strict: false });
        addFormats(ajv);
        return ajv;
    } catch {
        return null;
    }
}

function parseArgs(argv) {
    const args = { doc: null, all: true, report: null };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--doc') {
            args.doc = argv[++i];
            args.all = false;
        } else if (a === '--report') {
            args.report = argv[++i];
        }
    }
    return args;
}

function loadManifest() {
    return JSON.parse(readFileSync(join(DOCS_ROOT, 'manifest.json'), 'utf8'));
}

function collectProblems(doc) {
    const problems = [];
    for (const section of doc.sections || []) {
        for (const problem of section.problems || []) {
            problems.push({ section_id: section.section_id, problem });
        }
    }
    return problems;
}

function validateRelationships(doc, documentsRoot) {
    const errors = [];
    const warnings = [];
    const problems = collectProblems(doc);
    const problemIds = new Set();
    const seenProblemIds = new Set();

    for (const { problem } of problems) {
        const pid = problem.problem_id;
        if (!pid) {
            errors.push('Problem missing problem_id');
            continue;
        }
        if (seenProblemIds.has(pid)) {
            errors.push(`Duplicate problem ID: ${pid}`);
        }
        seenProblemIds.add(pid);
        problemIds.add(pid);

        if (!problem.number) {
            errors.push(`Problem ${pid} missing number`);
        }
        if (
            !problem.prompt?.trim() &&
            !(problem.subproblems?.length > 0)
        ) {
            errors.push(
                `Problem ${pid} has empty prompt and no subproblems`
            );
        } else if (
            problem.prompt?.trim() &&
            looksTruncatedPrompt(problem.prompt)
        ) {
            errors.push(
                `Problem ${pid} prompt looks truncated: "${problem.prompt.slice(-80)}"`
            );
        }
        for (const sub of problem.subproblems || []) {
            if (sub.parent_problem_id !== problem.problem_id) {
                errors.push(
                    `Subproblem ${sub.subproblem_id} parent_problem_id ${sub.parent_problem_id} != ${problem.problem_id}`
                );
            }
        }
        const checkAssets = (assets, ctx) => {
            for (const asset of assets || []) {
                const unresolved = asset.unresolved_source_url;
                if (unresolved && !asset.path) {
                    errors.push(
                        `Unresolved asset for ${ctx}: ${unresolved}`
                    );
                    continue;
                }
                if (!asset.path) {
                    // Caption-only asset with no file claim is allowed
                    if (unresolved) {
                        errors.push(
                            `Unresolved asset for ${ctx}: ${unresolved}`
                        );
                    }
                    continue;
                }
                const abs = join(documentsRoot, asset.path);
                if (!existsSync(abs)) {
                    errors.push(
                        `Missing asset for ${ctx}: ${asset.path}` +
                            (unresolved ? ` (from ${unresolved})` : '')
                    );
                }
            }
        };
        checkAssets(problem.assets, problem.problem_id);
        checkAssets(problem.solution?.assets, `${problem.problem_id}.solution`);
        for (const sub of problem.subproblems || []) {
            checkAssets(sub.assets, sub.subproblem_id);
            checkAssets(sub.solution?.assets, `${sub.subproblem_id}.solution`);
        }

        if (problem.solution?.visibility === 'student') {
            warnings.push(
                `Problem ${problem.problem_id} solution visibility is student (expected private_tutor)`
            );
        }

        const codeBlocks = [
            ...(problem.code_blocks || []),
            ...(problem.solution?.code_blocks || []),
            ...((problem.subproblems || []).flatMap((s) => [
                ...(s.code_blocks || []),
                ...(s.solution?.code_blocks || []),
            ])),
        ];
        for (const block of codeBlocks) {
            if (!block.code?.trim()) {
                warnings.push(`Empty code block ${block.code_id || '?'}`);
                continue;
            }
            const lang = (block.language || '').toLowerCase();
            if (lang === 'python' || lang === 'py') {
                if (/\bSyntaxError\b/i.test(block.code)) {
                    warnings.push(`Python block ${block.code_id} looks invalid`);
                }
            }
        }

        const conf = problem.source?.confidence;
        if (typeof conf === 'number' && conf < 0.5) {
            warnings.push(
                `Low confidence (${conf}) on problem ${problem.problem_id}`
            );
        }
    }

    // Inventory / expected count
    const inventory = doc.question_inventory || [];
    const expected =
        doc.metadata?.expected_problem_count ??
        (inventory.length > 0 ? inventory.length : null);
    if (typeof expected === 'number' && problems.length !== expected) {
        errors.push(
            `Expected ${expected} problems, found ${problems.length}`
        );
    }

    const inventoryIds = new Set(
        inventory.map((q) => q.problem_id).filter(Boolean)
    );
    if (inventoryIds.size) {
        for (const { problem } of problems) {
            if (!inventoryIds.has(problem.problem_id)) {
                warnings.push(
                    `Problem ${problem.problem_id} not in question_inventory (possible invented ID)`
                );
            }
        }
        for (const id of inventoryIds) {
            if (!seenProblemIds.has(id)) {
                errors.push(
                    `question_inventory entry missing from compiled problems: ${id}`
                );
            }
        }
    }

    return { errors, warnings };
}

export function validateCompiledDocument(doc, documentsRoot = DOCS_ROOT) {
    const result = {
        document_id: doc.document_id,
        schemaOk: true,
        schemaErrors: [],
        errors: [],
        warnings: [],
    };

    const ajv = loadAjv();
    if (ajv) {
        const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
        const validate = ajv.compile(schema);
        const ok = validate(doc);
        result.schemaOk = Boolean(ok);
        if (!ok) {
            result.schemaErrors = (validate.errors || []).map(
                (e) => `${e.instancePath || '/'} ${e.message}`
            );
            result.errors.push(...result.schemaErrors);
        }
    } else {
        result.warnings.push(
            'ajv not installed; skipped JSON Schema validation (npm i ajv ajv-formats)'
        );
        if (!doc.document_id || !doc.metadata || !Array.isArray(doc.sections)) {
            result.errors.push('Missing required top-level fields');
            result.schemaOk = false;
        }
    }

    const rel = validateRelationships(doc, documentsRoot);
    result.errors.push(...rel.errors);
    result.warnings.push(...rel.warnings);
    result.ok = result.errors.length === 0;
    result.expected_problem_count =
        doc.metadata?.expected_problem_count ?? null;
    result.detected_sections = doc.metadata?.detected_sections ?? null;
    return result;
}

export function validateByDocumentId(documentId, manifest = loadManifest()) {
    const entry = manifest[documentId];
    if (!entry) {
        return {
            document_id: documentId,
            ok: false,
            errors: [`Unknown document_id in manifest: ${documentId}`],
            warnings: [],
        };
    }
    const compiledPath = join(DOCS_ROOT, entry.compiled);
    if (!existsSync(compiledPath)) {
        return {
            document_id: documentId,
            ok: false,
            errors: [`Compiled JSON missing: ${compiledPath}`],
            warnings: [],
        };
    }
    const doc = JSON.parse(readFileSync(compiledPath, 'utf8'));
    return validateCompiledDocument(doc, DOCS_ROOT);
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const manifest = loadManifest();
    const ids = args.doc ? [args.doc] : Object.keys(manifest);
    const reports = [];

    for (const id of ids) {
        const report = validateByDocumentId(id, manifest);
        reports.push(report);
        const status = report.ok ? 'PASS' : 'FAIL';
        const inventoryNote =
            report.expected_problem_count != null
                ? `  expected=${report.expected_problem_count}` +
                  (report.detected_sections
                      ? `  sections=${JSON.stringify(report.detected_sections)}`
                      : '')
                : '';
        console.log(
            `[${status}] ${id}  errors=${report.errors?.length || 0}  warnings=${report.warnings?.length || 0}${inventoryNote}`
        );
        for (const e of report.errors || []) console.log(`  error: ${e}`);
        for (const w of report.warnings || []) console.log(`  warn: ${w}`);
    }

    const outPath =
        args.report ||
        join(DOCS_ROOT, 'compiled', '_validation-report.json');
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(
        outPath,
        JSON.stringify(
            {
                generated_at: new Date().toISOString(),
                results: reports,
            },
            null,
            2
        ) + '\n'
    );
    console.log(`Wrote report: ${outPath}`);

    if (reports.some((r) => !r.ok)) process.exitCode = 1;
}

const isMain =
    process.argv[1] &&
    resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
    main().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
