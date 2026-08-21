/**
 * Bedrock Data Automation client: upload PDF → async BDA → download outputs.
 * No unpdf / plain-text PDF parsing.
 */
import {
    createReadStream,
    existsSync,
    mkdirSync,
    writeFileSync,
    readFileSync,
    readdirSync,
    statSync,
} from 'fs';
import { basename, dirname, join } from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import {
    BedrockDataAutomationRuntimeClient,
    InvokeDataAutomationAsyncCommand,
    GetDataAutomationStatusCommand,
} from '@aws-sdk/client-bedrock-data-automation-runtime';

const DEFAULT_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-west-2';
const PUBLIC_BDA_PROJECT =
    process.env.BDA_PROJECT_ARN ||
    'arn:aws:bedrock::aws:data-automation-project/public-default';

function requireBucket() {
    const bucket = process.env.COURSE_DOCS_S3_BUCKET;
    if (!bucket) {
        throw new Error(
            'COURSE_DOCS_S3_BUCKET is required for Bedrock Data Automation (private temp upload).'
        );
    }
    return bucket;
}

function resolveProfileArn(region, accountId) {
    if (process.env.BDA_PROFILE_ARN) {
        return process.env.BDA_PROFILE_ARN;
    }
    if (!accountId) {
        throw new Error(
            'Set BDA_PROFILE_ARN or AWS_ACCOUNT_ID so the data automation profile ARN can be built.'
        );
    }
    return `arn:aws:bedrock:${region}:${accountId}:data-automation-profile/us.data-automation-v1`;
}

async function streamToBuffer(body) {
    if (!body) return Buffer.alloc(0);
    if (Buffer.isBuffer(body)) return body;
    if (typeof body.transformToByteArray === 'function') {
        return Buffer.from(await body.transformToByteArray());
    }
    const chunks = [];
    for await (const chunk of body) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

export function createBdaClients(region = DEFAULT_REGION) {
    return {
        s3: new S3Client({ region }),
        bda: new BedrockDataAutomationRuntimeClient({ region }),
        region,
    };
}

/**
 * Upload a local PDF to a unique temp prefix under the course-docs bucket.
 */
export async function uploadPdfToTempS3({
    s3,
    bucket,
    localPdfPath,
    documentId,
}) {
    const runId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const key = `bda-temp/${documentId}/${runId}/${basename(localPdfPath)}`;
    const body = createReadStream(localPdfPath);
    await s3.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: 'application/pdf',
        })
    );
    return {
        bucket,
        key,
        inputS3Uri: `s3://${bucket}/${key}`,
        outputPrefix: `bda-temp/${documentId}/${runId}/output/`,
        outputS3Uri: `s3://${bucket}/bda-temp/${documentId}/${runId}/output/`,
        runId,
    };
}

export async function invokeBdaAsync({
    bda,
    region,
    inputS3Uri,
    outputS3Uri,
    accountId = process.env.AWS_ACCOUNT_ID,
}) {
    const profileArn = resolveProfileArn(region, accountId);
    const command = new InvokeDataAutomationAsyncCommand({
        inputConfiguration: { s3Uri: inputS3Uri },
        outputConfiguration: { s3Uri: outputS3Uri },
        dataAutomationConfiguration: {
            dataAutomationProjectArn: PUBLIC_BDA_PROJECT,
        },
        dataAutomationProfileArn: profileArn,
    });
    const response = await bda.send(command);
    if (!response.invocationArn) {
        throw new Error('InvokeDataAutomationAsync did not return invocationArn');
    }
    return response.invocationArn;
}

export async function waitForBdaJob({
    bda,
    invocationArn,
    pollMs = Number(process.env.BDA_POLL_MS || 5000),
    timeoutMs = Number(process.env.BDA_TIMEOUT_MS || 15 * 60 * 1000),
}) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        const status = await bda.send(
            new GetDataAutomationStatusCommand({ invocationArn })
        );
        const state = status.status || status.Status;
        if (state === 'Success' || state === 'COMPLETED' || state === 'Complete') {
            return status;
        }
        if (
            state === 'ClientError' ||
            state === 'ServiceError' ||
            state === 'Failed' ||
            state === 'FAILED'
        ) {
            throw new Error(
                `BDA job failed (${state}): ${status.errorMessage || status.message || JSON.stringify(status)}`
            );
        }
        await new Promise((r) => setTimeout(r, pollMs));
    }
    throw new Error(`BDA job timed out after ${timeoutMs}ms: ${invocationArn}`);
}

async function downloadS3Prefix({ s3, bucket, prefix, localDir }) {
    mkdirSync(localDir, { recursive: true });
    let continuationToken;
    const downloaded = [];
    do {
        const listed = await s3.send(
            new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            })
        );
        for (const obj of listed.Contents || []) {
            if (!obj.Key || obj.Key.endsWith('/')) continue;
            const rel = obj.Key.slice(prefix.length).replace(/^\//, '');
            const dest = join(localDir, rel);
            mkdirSync(dirname(dest), { recursive: true });
            const got = await s3.send(
                new GetObjectCommand({ Bucket: bucket, Key: obj.Key })
            );
            const buf = await streamToBuffer(got.Body);
            writeFileSync(dest, buf);
            downloaded.push(dest);
        }
        continuationToken = listed.IsTruncated
            ? listed.NextContinuationToken
            : undefined;
    } while (continuationToken);
    return downloaded;
}

export async function cleanupTempS3Prefix({ s3, bucket, prefix }) {
    let continuationToken;
    do {
        const listed = await s3.send(
            new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            })
        );
        const keys = (listed.Contents || [])
            .map((o) => o.Key)
            .filter(Boolean)
            .map((Key) => ({ Key }));
        if (keys.length) {
            await s3.send(
                new DeleteObjectsCommand({
                    Bucket: bucket,
                    Delete: { Objects: keys },
                })
            );
        }
        continuationToken = listed.IsTruncated
            ? listed.NextContinuationToken
            : undefined;
    } while (continuationToken);
}

/**
 * Full BDA extract: upload → invoke → poll → download into bda-raw/<docId>/
 */
export async function runBdaExtraction({
    documentId,
    localPdfPath,
    bdaRawDir,
    cleanup = true,
}) {
    const bucket = requireBucket();
    const { s3, bda, region } = createBdaClients();
    if (!existsSync(localPdfPath)) {
        throw new Error(`PDF not found: ${localPdfPath}`);
    }

    const upload = await uploadPdfToTempS3({
        s3,
        bucket,
        localPdfPath,
        documentId,
    });

    let invocationArn;
    try {
        invocationArn = await invokeBdaAsync({
            bda,
            region,
            inputS3Uri: upload.inputS3Uri,
            outputS3Uri: upload.outputS3Uri,
        });
        const status = await waitForBdaJob({ bda, invocationArn });
        mkdirSync(bdaRawDir, { recursive: true });
        writeFileSync(
            join(bdaRawDir, 'job-meta.json'),
            JSON.stringify(
                {
                    documentId,
                    invocationArn,
                    inputS3Uri: upload.inputS3Uri,
                    outputS3Uri: upload.outputS3Uri,
                    completedAt: new Date().toISOString(),
                    status,
                },
                null,
                2
            )
        );
        await downloadS3Prefix({
            s3,
            bucket,
            prefix: upload.outputPrefix,
            localDir: join(bdaRawDir, 'output'),
        });
        return {
            invocationArn,
            bdaRawDir,
            outputLocalDir: join(bdaRawDir, 'output'),
        };
    } finally {
        if (cleanup) {
            const tempPrefix = `bda-temp/${documentId}/${upload.runId}/`;
            try {
                await cleanupTempS3Prefix({ s3, bucket, prefix: tempPrefix });
            } catch (err) {
                console.warn('Temp S3 cleanup failed:', err?.message || err);
            }
        }
    }
}

/**
 * Load previously cached BDA output from documents/bda-raw/<id>/
 */
export function loadCachedBdaRaw(bdaRawDir) {
    if (!existsSync(bdaRawDir)) {
        throw new Error(
            `No BDA cache at ${bdaRawDir}. Run without --skip-bda first.`
        );
    }
    const metaPath = join(bdaRawDir, 'job-meta.json');
    const outputDir = join(bdaRawDir, 'output');
    return {
        meta: existsSync(metaPath)
            ? JSON.parse(readFileSync(metaPath, 'utf8'))
            : null,
        outputDir,
        bdaRawDir,
    };
}

/**
 * Prefer finding standard_output JSON under a BDA output tree.
 */
export function findBdaResultJsonFiles(outputDir) {
    const results = [];
    function walk(dir) {
        if (!existsSync(dir)) return;
        for (const name of readdirSync(dir)) {
            const p = join(dir, name);
            const st = statSync(p);
            if (st.isDirectory()) walk(p);
            else if (name.endsWith('.json')) results.push(p);
        }
    }
    walk(outputDir);
    return results;
}
