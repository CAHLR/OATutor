/**
 * Publish validated compiled course documents to the us-west-1 runtime S3 bucket.
 *
 *   npm run publish-docs
 *   npm run publish-docs -- --dry-run
 *
 * Env:
 *   COURSE_DOCS_RUNTIME_BUCKET
 *   COURSE_DOCS_RUNTIME_REGION (default us-west-1)
 *   COURSE_DOCS_RUNTIME_PREFIX (default documents)
 */
import { spawnSync } from 'child_process';
import {
    existsSync,
    readFileSync,
    readdirSync,
    statSync,
} from 'fs';
import { dirname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import {
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { validateCompiledDocument } from './validate-compiled.mjs';
import { preflightPublish } from './publish-preflight.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');
const DOCS_ROOT = join(PKG_ROOT, 'documents');
const COURSE_PLANS_PATH = resolve(
    PKG_ROOT,
    '../../src/content-sources/oatutor/coursePlans.json'
);

function parseArgs(argv) {
    const args = { dryRun: false, skipTests: false };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--dry-run') args.dryRun = true;
        else if (a === '--skip-tests') args.skipTests = true;
    }
    return args;
}

function runTests() {
    const result = spawnSync('npm', ['test'], {
        cwd: PKG_ROOT,
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });
    if (result.status !== 0) {
        throw new Error('npm test failed; refusing to publish');
    }
}

function contentTypeFor(path) {
    if (path.endsWith('.json')) return 'application/json';
    if (path.endsWith('.png')) return 'image/png';
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
    if (path.endsWith('.gif')) return 'image/gif';
    if (path.endsWith('.webp')) return 'image/webp';
    if (path.endsWith('.csv')) return 'text/csv';
    return 'application/octet-stream';
}

function walkFiles(dir, excludeNames = new Set()) {
    const out = [];
    if (!existsSync(dir)) return out;
    for (const name of readdirSync(dir)) {
        if (excludeNames.has(name)) continue;
        const p = join(dir, name);
        const st = statSync(p);
        if (st.isDirectory()) out.push(...walkFiles(p, excludeNames));
        else out.push(p);
    }
    return out;
}

async function putFile(s3, bucket, key, localPath) {
    const body = readFileSync(localPath);
    await s3.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentTypeFor(localPath),
        })
    );
}

async function syncDir({
    s3,
    bucket,
    prefix,
    localDir,
    remoteSubdir,
    excludeNames = new Set(),
    dryRun,
}) {
    const files = walkFiles(localDir, excludeNames);
    let uploaded = 0;
    for (const abs of files) {
        const rel = relative(localDir, abs).replace(/\\/g, '/');
        const key = `${prefix}/${remoteSubdir}/${rel}`.replace(/\/+/g, '/');
        if (dryRun) {
            console.log(`[dry-run] put s3://${bucket}/${key}`);
        } else {
            await putFile(s3, bucket, key, abs);
            console.log(`Uploaded s3://${bucket}/${key}`);
        }
        uploaded += 1;
    }
    return uploaded;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const bucket = process.env.COURSE_DOCS_RUNTIME_BUCKET;
    const region =
        process.env.COURSE_DOCS_RUNTIME_REGION || 'us-west-1';
    const prefix = (
        process.env.COURSE_DOCS_RUNTIME_PREFIX || 'documents'
    ).replace(/^\/+|\/+$/g, '');

    if (!args.skipTests) {
        console.log('Running tests…');
        runTests();
    } else {
        console.warn('Skipping tests (--skip-tests)');
    }

    if (!existsSync(COURSE_PLANS_PATH)) {
        throw new Error(`coursePlans.json not found: ${COURSE_PLANS_PATH}`);
    }
    const manifest = JSON.parse(
        readFileSync(join(DOCS_ROOT, 'manifest.json'), 'utf8')
    );
    const coursePlans = JSON.parse(readFileSync(COURSE_PLANS_PATH, 'utf8'));

    console.log('Validating all compiled documents…');
    for (const [id, entry] of Object.entries(manifest)) {
        const compiledRel = entry.compiled || `compiled/${id}.json`;
        const abs = join(DOCS_ROOT, compiledRel);
        if (!existsSync(abs)) {
            throw new Error(`Missing compiled file for ${id}: ${compiledRel}`);
        }
        const doc = JSON.parse(readFileSync(abs, 'utf8'));
        const result = validateCompiledDocument(doc, DOCS_ROOT);
        if (!result.ok) {
            throw new Error(
                `Validation failed for ${id}: ${(result.errors || []).join('; ')}`
            );
        }
    }

    console.log('Preflight chat_documents bindings…');
    const preflight = preflightPublish({
        manifest,
        coursePlans,
        documentsRoot: DOCS_ROOT,
        validateCompiled: validateCompiledDocument,
    });
    if (!preflight.ok) {
        for (const e of preflight.errors) console.error(`  error: ${e}`);
        throw new Error(`Publish preflight failed (${preflight.errors.length} errors)`);
    }
    console.log(
        `Preflight OK: ${preflight.referencedDocIds.length} document(s) referenced by chat_documents`
    );

    if (!bucket) {
        if (args.dryRun) {
            console.log(
                '[dry-run] COURSE_DOCS_RUNTIME_BUCKET unset; preflight only'
            );
            return;
        }
        throw new Error(
            'COURSE_DOCS_RUNTIME_BUCKET is required to publish (or use --dry-run for preflight only)'
        );
    }

    const s3 = new S3Client({ region });

    console.log(`Syncing assets → s3://${bucket}/${prefix}/assets/`);
    await syncDir({
        s3,
        bucket,
        prefix,
        localDir: join(DOCS_ROOT, 'assets'),
        remoteSubdir: 'assets',
        dryRun: args.dryRun,
    });

    console.log(`Syncing compiled → s3://${bucket}/${prefix}/compiled/`);
    await syncDir({
        s3,
        bucket,
        prefix,
        localDir: join(DOCS_ROOT, 'compiled'),
        remoteSubdir: 'compiled',
        excludeNames: new Set([
            '_compile-report.json',
            '_validation-report.json',
        ]),
        dryRun: args.dryRun,
    });

    const manifestKey = `${prefix}/manifest.json`;
    if (args.dryRun) {
        console.log(`[dry-run] put s3://${bucket}/${manifestKey}`);
    } else {
        await putFile(s3, bucket, manifestKey, join(DOCS_ROOT, 'manifest.json'));
        console.log(`Uploaded s3://${bucket}/${manifestKey}`);
    }

    // Upload coursePlans last so lessons never reference unfinished content.
    const plansKey = `${prefix}/coursePlans.json`;
    if (args.dryRun) {
        console.log(`[dry-run] put s3://${bucket}/${plansKey}`);
    } else {
        await putFile(s3, bucket, plansKey, COURSE_PLANS_PATH);
        console.log(`Uploaded s3://${bucket}/${plansKey}`);
    }

    console.log(args.dryRun ? 'Dry-run publish complete.' : 'Publish complete.');
}

main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
});
