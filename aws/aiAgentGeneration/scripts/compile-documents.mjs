#!/usr/bin/env node
/**
 * Offline course-document compiler:
 *   raw PDF → (temp S3 + BDA) → semantic compiler → compiled JSON + assets → validate
 *
 * Usage (from aws/aiAgentGeneration):
 *   npm run compile-docs                         # every key in documents/manifest.json
 *   npm run compile-docs -- --doc data100-disc01 # one document
 *   npm run compile-docs -- --skip-bda           # all keys, reuse bda-raw/
 *   npm run compile-docs -- --from data100-disc06
 *   npm run compile-docs -- --only-missing
 */
import dotenv from 'dotenv';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { runBdaExtraction, loadCachedBdaRaw } from './bda-client.mjs';
import { compileDocument } from './semantic-compiler.mjs';
import { validateByDocumentId } from './validate-compiled.mjs';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, '..');
const DOCS_ROOT = join(PACKAGE_ROOT, 'documents');

function parseArgs(argv) {
    const args = {
        doc: null,
        from: null,
        onlyMissing: false,
        skipBda: false,
        provider: null,
        validate: true,
        keepS3: false,
        dryRun: false,
        help: false,
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--doc') args.doc = argv[++i];
        else if (a === '--from') args.from = argv[++i];
        else if (a === '--only-missing') args.onlyMissing = true;
        else if (a === '--skip-bda') args.skipBda = true;
        else if (a === '--provider') args.provider = argv[++i];
        else if (a === '--no-validate') args.validate = false;
        else if (a === '--keep-s3') args.keepS3 = true;
        else if (a === '--dry-run') args.dryRun = true;
        else if (a === '--help' || a === '-h') args.help = true;
    }
    return args;
}

function loadManifest() {
    const path = join(DOCS_ROOT, 'manifest.json');
    return JSON.parse(readFileSync(path, 'utf8'));
}

function printHelp() {
    console.log(`compile-documents.mjs

Compiles documents listed in documents/manifest.json into:
  documents/bda-raw/<id>/
  documents/compiled/<id>.json
  documents/assets/…

Omit --doc to loop every manifest key (same pattern as validate-docs).

Options:
  --doc <id>              Compile one manifest document_id
  --from <id>             When compiling all, start at this id (inclusive)
  --only-missing          Skip ids that already have compiled JSON on disk
  --skip-bda              Reuse documents/bda-raw/<id>/ (no Bedrock call)
  --provider openai|bedrock
  --dry-run               Skip LLM; rule-based structure only (COMPILER_DRY_RUN)
  --no-validate           Skip schema/relationship validation
  --keep-s3               Do not delete temp S3 prefix after BDA
  --help

Examples:
  npm run compile-docs
  npm run compile-docs -- --skip-bda
  npm run compile-docs -- --doc data100-disc01
  npm run compile-docs -- --from data100-disc06 --skip-bda
  npm run compile-docs -- --only-missing
`);
}

function resolveCompileIds(manifest, args) {
    const allIds = Object.keys(manifest);

    if (args.doc) {
        if (!manifest[args.doc]) {
            throw new Error(`document_id not in manifest: ${args.doc}`);
        }
        return [args.doc];
    }

    let ids = allIds;
    if (args.from) {
        const idx = ids.indexOf(args.from);
        if (idx < 0) {
            throw new Error(
                `--from document_id not in manifest: ${args.from}`
            );
        }
        ids = ids.slice(idx);
    }

    if (args.onlyMissing) {
        ids = ids.filter((id) => {
            const compiledRel =
                manifest[id].compiled || `compiled/${id}.json`;
            return !existsSync(join(DOCS_ROOT, compiledRel));
        });
    }

    return ids;
}

async function compileOne(documentId, entry, args) {
    const pdfPath = join(DOCS_ROOT, entry.source);
    const bdaRawDir = join(DOCS_ROOT, 'bda-raw', documentId);

    if (!args.skipBda) {
        if (!existsSync(pdfPath)) {
            throw new Error(
                `Missing PDF: ${pdfPath}\nPlace the file under documents/raw/ (see documents/README.md).`
            );
        }
        console.log('Running Bedrock Data Automation...');
        const bdaResult = await runBdaExtraction({
            documentId,
            localPdfPath: pdfPath,
            bdaRawDir,
            cleanup: !args.keepS3,
        });
        console.log(`BDA complete: ${bdaResult.invocationArn}`);
    } else {
        console.log(`Skipping BDA; loading cache ${bdaRawDir}`);
        loadCachedBdaRaw(bdaRawDir);
    }

    if (args.dryRun) {
        process.env.COMPILER_DRY_RUN = '1';
    }

    const cached = loadCachedBdaRaw(bdaRawDir);
    const jobId = cached.meta?.invocationArn || null;

    console.log('Running semantic compiler...');
    const compiled = await compileDocument({
        documentId,
        manifestEntry: entry,
        documentsRoot: DOCS_ROOT,
        bdaOutputDir: cached.outputDir,
        providerName: args.provider,
        bdaJobId: jobId,
    });
    console.log(
        `Wrote ${compiled.compiledPath} (provider=${compiled.providerUsed}, markdownChars=${compiled.markdownChars})`
    );

    let validation = null;
    if (args.validate) {
        validation = validateByDocumentId(documentId);
        console.log(
            validation.ok
                ? 'Validation PASS'
                : `Validation FAIL (${validation.errors.length} errors)`
        );
        for (const e of validation.errors || []) console.log(`  error: ${e}`);
        for (const w of validation.warnings || []) console.log(`  warn: ${w}`);
    }

    return { documentId, compiled, validation };
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        printHelp();
        return;
    }

    const manifest = loadManifest();
    const ids = resolveCompileIds(manifest, args);

    if (ids.length === 0) {
        console.log(
            args.onlyMissing
                ? 'Nothing to do: every selected manifest id already has compiled JSON.'
                : 'Nothing to do: no document ids selected.'
        );
        return;
    }

    const mode = args.doc
        ? `single doc ${args.doc}`
        : `all selected manifest keys (${ids.length})`;
    console.log(
        `Compiling ${ids.length} document(s) — ${mode}` +
            (args.skipBda ? ' [skip-bda]' : '') +
            (args.dryRun ? ' [dry-run]' : '') +
            (args.onlyMissing ? ' [only-missing]' : '')
    );
    console.log(`Queue: ${ids.join(', ')}`);

    const summary = [];
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        console.log(`\n=== [${i + 1}/${ids.length}] ${id} ===`);
        try {
            const result = await compileOne(id, manifest[id], args);
            summary.push({
                document_id: id,
                ok: result.validation ? result.validation.ok : true,
                compiled: result.compiled.compiledPath,
                expected_problem_count:
                    result.compiled.compiled?.metadata?.expected_problem_count ??
                    result.compiled.questionIndex?.length ??
                    null,
                detected_sections:
                    result.compiled.compiled?.metadata?.detected_sections ??
                    null,
                unresolved_assets: result.compiled.unresolvedAssets || [],
                errors: result.validation?.errors || [],
                warnings: result.validation?.warnings || [],
            });
        } catch (err) {
            console.error(`[FAIL] ${id}:`, err.message || err);
            summary.push({
                document_id: id,
                ok: false,
                error: String(err.message || err),
            });
        }
    }

    const reportPath = join(DOCS_ROOT, 'compiled', '_compile-report.json');
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(
        reportPath,
        JSON.stringify(
            {
                generated_at: new Date().toISOString(),
                results: summary,
            },
            null,
            2
        ) + '\n'
    );

    const passed = summary.filter((r) => r.ok).length;
    const failed = summary.length - passed;
    console.log(`\nCompile report: ${reportPath}`);
    console.log(`Summary: ${passed} ok, ${failed} failed (of ${summary.length})`);
    for (const r of summary) {
        console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.document_id}`);
    }

    if (summary.some((r) => !r.ok)) process.exitCode = 1;
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
