#!/usr/bin/env node
/**
 * Offline course-document compiler:
 *   raw PDF → (temp S3 + BDA) → semantic compiler → compiled JSON + assets → validate
 *
 * Usage:
 *   node scripts/compile-documents.mjs [--doc data8-disc04] [--skip-bda] [--provider openai|bedrock] [--no-validate] [--keep-s3]
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
        skipBda: false,
        provider: null,
        validate: true,
        keepS3: false,
        dryRun: false,
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--doc') args.doc = argv[++i];
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

Options:
  --doc <id>              Compile one manifest document_id
  --skip-bda              Reuse documents/bda-raw/<id>/ (no Bedrock call)
  --provider openai|bedrock
  --dry-run               Skip LLM; rule-based structure only (COMPILER_DRY_RUN)
  --no-validate           Skip schema/relationship validation
  --keep-s3               Do not delete temp S3 prefix after BDA
  --help
`);
}

async function compileOne(documentId, entry, args) {
    const pdfPath = join(DOCS_ROOT, entry.source);
    const bdaRawDir = join(DOCS_ROOT, 'bda-raw', documentId);

    console.log(`\n=== ${documentId} ===`);

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
    const ids = args.doc ? [args.doc] : Object.keys(manifest);

    if (args.doc && !manifest[args.doc]) {
        throw new Error(`document_id not in manifest: ${args.doc}`);
    }

    const summary = [];
    for (const id of ids) {
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
                    result.compiled.compiled?.metadata?.detected_sections ?? null,
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
    console.log(`\nCompile report: ${reportPath}`);

    if (summary.some((r) => !r.ok)) process.exitCode = 1;
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
