#!/usr/bin/env node
/**
 * Offline unit embeddings for hybrid RAG:
 *   compiled JSON → flatten units → OpenAI embeddings → *.embeddings.json sidecar
 *
 * Usage (from aws/aiAgentGeneration):
 *   npm run embed-docs
 *   npm run embed-docs -- --doc math1b-03
 *   npm run embed-docs -- --only-missing
 *   npm run embed-docs -- --from math1b-01
 */
import dotenv from 'dotenv';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import {
    buildEmbedText,
    embeddingsSidecarRel,
    flattenLearningObjects,
    getEmbeddingConfig,
    resolveMaterialType,
} from '../document-context.mjs';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, '..');
const DOCS_ROOT = join(PACKAGE_ROOT, 'documents');
const BATCH_SIZE = 64;

function parseArgs(argv) {
    const args = {
        doc: null,
        from: null,
        onlyMissing: false,
        help: false,
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--doc') args.doc = argv[++i];
        else if (a === '--from') args.from = argv[++i];
        else if (a === '--only-missing') args.onlyMissing = true;
        else if (a === '--help' || a === '-h') args.help = true;
    }
    return args;
}

function loadManifest() {
    return JSON.parse(readFileSync(join(DOCS_ROOT, 'manifest.json'), 'utf8'));
}

function printHelp() {
    console.log(`embed-documents.mjs

Embeds flattened learning-object units for hybrid RAG ranking.
Writes sidecars next to compiled JSON (synced by publish-docs):
  documents/compiled/<path>.embeddings.json

Options:
  --doc <id>         Embed one manifest document_id
  --from <id>        When embedding all, start at this id (inclusive)
  --only-missing     Skip ids that already have an embeddings sidecar
  --help

Env:
  OPENAI_API_KEY
  EMBEDDING_MODEL (default text-embedding-3-small)
  EMBEDDING_DIMENSIONS (default 512)

Examples:
  npm run embed-docs
  npm run embed-docs -- --doc math1b-03
  npm run embed-docs -- --only-missing
`);
}

function resolveEmbedIds(manifest, args) {
    const allIds = Object.keys(manifest);

    if (args.doc) {
        if (!manifest[args.doc]) {
            throw new Error(`document_id not in manifest: ${args.doc}`);
        }
        return [args.doc];
    }

    let ids = allIds;
    if (args.from) {
        const idx = allIds.indexOf(args.from);
        if (idx < 0) {
            throw new Error(`--from document_id not in manifest: ${args.from}`);
        }
        ids = allIds.slice(idx);
    }

    if (args.onlyMissing) {
        ids = ids.filter((id) => {
            const compiledRel =
                manifest[id].compiled || `compiled/${id}.json`;
            const sideRel = embeddingsSidecarRel(compiledRel);
            return !existsSync(join(DOCS_ROOT, sideRel));
        });
    }
    return ids;
}

function materialTitleFromCompiled(documentId, compiled, entry) {
    return (
        compiled?.metadata?.title ||
        compiled?.title ||
        entry?.title ||
        documentId
    );
}

async function embedBatch(openai, texts, { model, dimensions }) {
    const resp = await openai.embeddings.create({
        model,
        input: texts,
        dimensions,
    });
    const byIndex = new Map();
    for (const row of resp.data || []) {
        byIndex.set(row.index, row.embedding);
    }
    return texts.map((_, i) => byIndex.get(i) || null);
}

async function embedOne(documentId, entry, openai, config) {
    const compiledRel = entry.compiled || `compiled/${documentId}.json`;
    const compiledAbs = join(DOCS_ROOT, compiledRel);
    if (!existsSync(compiledAbs)) {
        throw new Error(`Missing compiled file: ${compiledRel}`);
    }
    const compiled = JSON.parse(readFileSync(compiledAbs, 'utf8'));
    const material = {
        material_type: resolveMaterialType(entry, compiled),
        material_title: materialTitleFromCompiled(documentId, compiled, entry),
    };
    const units = flattenLearningObjects(documentId, compiled, material);
    const unitMap = {};
    const pending = [];

    for (const u of units) {
        const text = (u.embed_text || buildEmbedText(u)).trim();
        if (!text) continue;
        pending.push({ unit_id: u.unit_id, text: text.slice(0, 8000) });
    }

    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
        const batch = pending.slice(i, i + BATCH_SIZE);
        const vectors = await embedBatch(
            openai,
            batch.map((b) => b.text),
            config
        );
        for (let j = 0; j < batch.length; j++) {
            if (Array.isArray(vectors[j])) {
                unitMap[batch[j].unit_id] = vectors[j];
            }
        }
    }

    const sidecar = {
        model: config.model,
        dimensions: config.dimensions,
        document_id: documentId,
        unit_count: Object.keys(unitMap).length,
        units: unitMap,
    };

    const sideRel = embeddingsSidecarRel(compiledRel);
    const sideAbs = join(DOCS_ROOT, sideRel);
    mkdirSync(dirname(sideAbs), { recursive: true });
    writeFileSync(sideAbs, `${JSON.stringify(sidecar)}\n`, 'utf8');
    return { sideRel, unitCount: sidecar.unit_count };
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        printHelp();
        return;
    }

    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required for embed-docs');
    }

    const config = getEmbeddingConfig();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const manifest = loadManifest();
    const ids = resolveEmbedIds(manifest, args);

    if (!ids.length) {
        console.log(
            args.onlyMissing
                ? 'Nothing to do: every selected id already has an embeddings sidecar.'
                : 'No document ids selected.'
        );
        return;
    }

    console.log(
        `Embedding ${ids.length} document(s) with ${config.model} dim=${config.dimensions}`
    );

    const results = [];
    for (const id of ids) {
        process.stdout.write(`  ${id}… `);
        const result = await embedOne(id, manifest[id], openai, config);
        console.log(`${result.unitCount} units → ${result.sideRel}`);
        results.push({ id, ...result });
    }

    console.log(`Done: ${results.length} sidecar(s) written under documents/`);
}

main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
});
