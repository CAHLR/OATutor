/**
 * Semantic compiler: BDA output → canonical learning-object JSON.
 *
 * Question IDs and prompts are deterministic (from BDA elements).
 * The LLM fills solutions, code, assets, concepts — then we reconcile.
 */
import { createHash } from 'crypto';
import {
    existsSync,
    mkdirSync,
    readFileSync,
    writeFileSync,
    copyFileSync,
    readdirSync,
    statSync,
} from 'fs';
import { basename, dirname, join } from 'path';
import { findBdaResultJsonFiles } from './bda-client.mjs';
import { createLlmProvider } from './providers/llm-provider.mjs';

export const PARSER_VERSION = 'course-doc-compiler-0.2.2';

const SUBPART_RE = /(?:^|\n)\s*\(([a-z])\)\s+/gi;
const SOLUTION_RE = /(?:^|\n)\s*Solution\s*:?\s*/i;
const CODE_HEADING_RE =
    /(?:^|\n)\s*(Pandas\s+Code|SQL\s+Query|SQL\s+Code|Python\s+Code|Code)\s*:?\s*/gi;

const QUESTION_START_RE =
    /(?:^|\n)\s*(?:[-*]\s*)?(?:#{1,6}\s*)?(\d+)\.\s+/g;

/** Ends a question prompt body (not including the matched boundary). */
const PROMPT_BOUNDARY_RE =
    /(?:\n|^)\s*(?:[-*]\s*)?(?:\*\*)?Solution\s*:|(?:\n|^)\s*(?:[-*]\s*)?(?:#{1,6}\s*)?\d+\.\s+|(?:\n|^)\s*#{1,3}\s+|(?:\n|^)\s*(?:Pandas\s+Code|SQL\s+Query|SQL\s+Code|Python\s+Code|Code)\s*:?|(?:\n|^)\s*(?:[-*]\s*)?[A-E]\.\s+/i;

function stripRunningHeaderNoise(text) {
    return String(text || '')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/&lt;csv_data&gt;[\s\S]*?&lt;\/csv_data&gt;/gi, ' ')
        .replace(/\[SIGNATURE\]/gi, ' ')
        .replace(/(?:^|\n)\s*\*?Discussion\s*#?\s*\d+\*?\s*/gi, '\n')
        .replace(/^\[(?:\s|x|X)\]\s*/gm, '')
        .replace(/\[\s*\]/g, ' ')
        .replace(/^\s*[-*]\s+/gm, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * True when a prompt looks cut off mid-phrase (e.g. ends with "the empty").
 */
export function looksTruncatedPrompt(prompt) {
    const p = String(prompt || '').trim();
    if (!p) return true;
    if (/[.?!]["']?$/.test(p)) return false;
    if (/\$$/.test(p)) return false; // regex / math endings
    if (/\b(the|a|an|and|or|of|with|to|for|from|by|in|on|at|empty|only|all|any)$/i.test(p)) {
        return true;
    }
    // Ends mid-hyphenation like "char-" from PDF line break without continuation
    if (/[A-Za-z]-$/.test(p)) return true;
    return false;
}

/**
 * Deterministic question index from BDA layout elements.
 * Collects multiline / cross-page prompts until the next structural boundary.
 */
export function buildQuestionIndex(bdaResult, documentId) {
    const elements = getBdaElements(bdaResult);

    const sortedElements = [...elements]
        .filter((element) => {
            return (
                element.sub_type !== 'PAGE_NUMBER' &&
                element.sub_type !== 'HEADER'
            );
        })
        .sort((a, b) => {
            const aPage =
                a.page_indices?.[0] ?? a.locations?.[0]?.page_index ?? 0;
            const bPage =
                b.page_indices?.[0] ?? b.locations?.[0]?.page_index ?? 0;
            if (aPage !== bPage) return aPage - bPage;
            return (a.reading_order ?? 0) - (b.reading_order ?? 0);
        });

    let currentSection = 'document';
    const blocks = [];

    for (const element of sortedElements) {
        const markdown = element.representation?.markdown ?? '';

        if (isHeadingElement(element, markdown)) {
            const heading = stripMarkdown(markdown.split('\n')[0] || '');
            if (heading && !isIgnoredHeading(heading)) {
                currentSection = heading;
            }
        }

        if (!markdown.trim()) continue;

        blocks.push({
            markdown,
            section: currentSection,
            pageIndices: element.page_indices ?? [],
            sourceElementId: element.id ?? null,
        });
    }

    // Offset map so each question inherits section / provenance from its start block
    const parts = [];
    let cursor = 0;
    for (const block of blocks) {
        const start = cursor;
        const text = block.markdown;
        parts.push({ start, end: start + text.length, block });
        cursor += text.length + 1; // +1 for join '\n'
    }
    const corpus = blocks.map((b) => b.markdown).join('\n');

    const blockAt = (index) => {
        for (const part of parts) {
            if (index >= part.start && index <= part.end) return part.block;
        }
        return parts[parts.length - 1]?.block || null;
    };

    const questions = [];
    const seenIds = new Set();
    const starts = [...corpus.matchAll(QUESTION_START_RE)];

    for (let i = 0; i < starts.length; i++) {
        const match = starts[i];
        const number = match[1];
        const contentStart = match.index + match[0].length;
        const hardEnd =
            i + 1 < starts.length ? starts[i + 1].index : corpus.length;
        let chunk = corpus.slice(contentStart, hardEnd);

        const boundary = chunk.search(PROMPT_BOUNDARY_RE);
        if (boundary >= 0) chunk = chunk.slice(0, boundary);

        const prompt = stripRunningHeaderNoise(stripMarkdown(chunk));

        if (!prompt || prompt.length < 8) continue;
        if (/^\[.\]$/.test(prompt)) continue;
        if (/^(solution|pandas code|sql query)\b/i.test(prompt)) continue;

        const startBlock = blockAt(match.index) || blocks[0];
        const section = startBlock?.section || 'document';
        const sectionSlug = slugify(section) || 'document';
        const id = `${documentId}-${sectionSlug}-q${number}`;

        if (seenIds.has(id)) continue;
        seenIds.add(id);

        questions.push({
            id,
            problem_id: id,
            section,
            number: String(number),
            prompt,
            pageIndices: startBlock?.pageIndices ?? [],
            sourceElementId: startBlock?.sourceElementId ?? null,
        });
    }

    return questions;
}

function loadPrimaryBdaDocument(outputDir, preferredInvocationId = null) {
    const jsonFiles = findBdaResultJsonFiles(outputDir);
    let best = null;
    let bestScore = -1;
    for (const file of jsonFiles) {
        try {
            const data = JSON.parse(readFileSync(file, 'utf8'));
            let score = 0;
            if (data.document) score += 5;
            if (Array.isArray(data.pages)) score += 3;
            if (Array.isArray(data.elements)) score += 5;
            if (Array.isArray(data.document?.elements)) score += 3;
            if (data.metadata) score += 1;
            if (file.includes('standard_output')) score += 2;
            if (
                preferredInvocationId &&
                file.includes(preferredInvocationId)
            ) {
                score += 20;
            }
            if (
                score > bestScore ||
                (score === bestScore &&
                    best &&
                    file.localeCompare(best.file) > 0)
            ) {
                bestScore = score;
                best = { file, data };
            }
        } catch {
            // skip
        }
    }
    if (!best) {
        return {
            file: null,
            data: {
                document: { representation: { markdown: '', text: '' } },
                pages: [],
                elements: [],
            },
        };
    }
    return best;
}

function preferredInvocationFromJobMeta(bdaOutputDir) {
    try {
        const metaPath = join(bdaOutputDir, '..', 'job-meta.json');
        if (!existsSync(metaPath)) return null;
        const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
        const arn = meta.invocationArn || '';
        const m = arn.match(/data-automation-invocation\/([^/]+)/);
        return m ? m[1] : null;
    } catch {
        return null;
    }
}

function getBdaElements(bdaData) {
    if (Array.isArray(bdaData?.elements)) return bdaData.elements;
    if (Array.isArray(bdaData?.document?.elements)) return bdaData.document.elements;
    return [];
}

function extractMarkdown(bdaData) {
    const doc = bdaData.document || {};
    const rep = doc.representation || {};
    if (rep.markdown) return rep.markdown;
    if (rep.text) return rep.text;
    if (Array.isArray(bdaData.pages)) {
        return bdaData.pages
            .map((p) => p.representation?.markdown || p.representation?.text || '')
            .filter(Boolean)
            .join('\n\n---\n\n');
    }
    const elements = getBdaElements(bdaData);
    if (elements.length) {
        return elements
            .map((e) => e.representation?.markdown || e.representation?.text || '')
            .filter(Boolean)
            .join('\n\n');
    }
    return '';
}

export function slugify(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function stripMarkdown(value) {
    return String(value || '')
        .replace(/^#{1,6}\s*/, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/^\[.\]\s*/, '')
        .trim();
}

function isIgnoredHeading(heading) {
    const h = heading.toLowerCase().trim();
    if (!h) return true;
    if (/^discussion\s*#?\s*\d+/.test(h)) return true;
    if (/^solution:?$/.test(h)) return true;
    if (/^(pandas code|sql query|sql code|python code|code)$/.test(h)) return true;
    // Numbered question used as a SECTION_HEADER / TITLE — not a section name
    if (/^\d+\.\s+/.test(h)) return true;
    return false;
}

function isHeadingElement(element, markdown) {
    return (
        element.sub_type === 'SECTION_HEADER' ||
        element.sub_type === 'TITLE' ||
        /^#{1,3}\s+/m.test(markdown)
    );
}

function walkFiles(dir, pred) {
    const out = [];
    if (!existsSync(dir)) return out;
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        const st = statSync(p);
        if (st.isDirectory()) out.push(...walkFiles(p, pred));
        else if (!pred || pred(p, name)) out.push(p);
    }
    return out;
}

/** @deprecated Prefer buildQuestionIndex; kept for markdown-only fallback. */
export function detectQuestionInventory(markdown, documentId) {
    return buildQuestionIndex(
        {
            elements: [
                {
                    id: 'markdown-fallback',
                    sub_type: 'PARAGRAPH',
                    reading_order: 1,
                    page_indices: [0],
                    representation: { markdown },
                },
            ],
        },
        documentId
    ).map((q) => ({
        problem_id: q.problem_id,
        number: q.number,
        title: q.prompt,
        question_type: null,
        section: q.section,
    }));
}

function detectRuleSignals(markdown) {
    const topQuestions = [...String(markdown || '').matchAll(QUESTION_START_RE)].map(
        (m) => m[1]
    );
    const subparts = [...markdown.matchAll(SUBPART_RE)].map((m) =>
        m[1].toLowerCase()
    );
    const hasSolution = SOLUTION_RE.test(markdown);
    const codeHeadings = [...markdown.matchAll(CODE_HEADING_RE)].map((m) =>
        m[1].trim()
    );
    return { topQuestions, subparts, hasSolution, codeHeadings };
}

const SCHEMA_HINT = `{
  "sections": [
    {
      "section_id": "string",
      "title": "string|null",
      "concepts": ["string"],
      "definitions": [],
      "notes": [],
      "examples": [],
      "problems": [
        {
          "problem_id": "MUST match AUTHORITATIVE QUESTION INDEX id exactly",
          "number": "string",
          "title": "string|null",
          "prompt": "MUST copy AUTHORITATIVE prompt exactly",
          "question_type": "open_response|multiple_choice|multiple_select|coding|other|null",
          "subproblems": [],
          "choices": [],
          "equations": [],
          "code_blocks": [{ "code_id": "string", "language": "python|sql|null", "code": "string" }],
          "assets": [],
          "solution": {
            "text": "string|null",
            "analysis_plan": ["string"],
            "code_blocks": [],
            "visibility": "private_tutor",
            "disclosure_policy": "never_verbatim"
          },
          "knowledge_components": ["string"],
          "visibility": "student",
          "source": { "pages": [0], "confidence": 0.9 }
        }
      ],
      "visibility": "student"
    }
  ],
  "uncertainties": ["string"]
}`;

const SYSTEM_PROMPT = `You are an educational document semantic compiler for OATutor.
You convert extracted PDF content into structured learning objects.

CRITICAL RULES:
- EXTRACT; do not rewrite, paraphrase, or "fix" source content.
- Preserve code indentation exactly.
- Mark solutions with visibility "private_tutor" and disclosure_policy "never_verbatim".
- Problem prompts / definitions / notes visible to students use visibility "student".
- NEVER invent top-level question IDs or prompts — use the AUTHORITATIVE QUESTION INDEX only.
- Produce exactly one problem object for every question-index entry.
- Questions with the same number in different sections are different questions.
- Never return an empty prompt.
- If a solution association is uncertain, still emit the problem and list the issue in uncertainties.
- Return a single JSON object only.`;

function buildUserPrompt({
    documentId,
    manifestEntry,
    markdown,
    ruleSignals,
    questionIndex,
}) {
    return [
        `document_id: ${documentId}`,
        `title: ${manifestEntry.title || ''}`,
        `course: ${manifestEntry.course || ''}`,
        `document_type: ${manifestEntry.document_type || ''}`,
        '',
        'AUTHORITATIVE QUESTION INDEX',
        'The following list was detected deterministically from the source document.',
        '',
        JSON.stringify(questionIndex, null, 2),
        '',
        'Rules for the index:',
        '1. Produce exactly one problem object for every question-index entry.',
        '2. Use the supplied id / problem_id exactly as problem_id.',
        '3. Copy the supplied prompt exactly; do not rewrite or omit it.',
        '4. Questions with the same number in different sections are different questions.',
        '5. Do not create additional top-level question IDs.',
        '6. Never return an empty prompt.',
        '7. Use the document content to populate solutions, code, assets, concepts, and provenance.',
        '8. If a solution association is uncertain, preserve the problem and mark the uncertainty.',
        '',
        'Rule-detected signals (secondary):',
        JSON.stringify(ruleSignals, null, 2),
        '',
        'Extracted document markdown/text from Bedrock Data Automation:',
        '"""',
        markdown.slice(0, 120000),
        '"""',
    ].join('\n');
}

function flattenModelProblems(llmResult) {
    const out = [];
    for (const section of llmResult.sections || []) {
        for (const problem of section.problems || []) {
            out.push({
                ...problem,
                _modelSectionTitle: section.title || null,
                _modelSectionId: section.section_id || null,
            });
        }
    }
    return out;
}

function findModelProblem(question, modelById, modelProblems) {
    // Best: exact authoritative id
    if (modelById.has(question.id)) {
        return modelById.get(question.id);
    }

    const promptKey = question.prompt.trim().toLowerCase();
    const byPrompt = (modelProblems || []).filter(
        (p) => (p.prompt || '').trim().toLowerCase() === promptKey
    );
    if (byPrompt.length === 1) return byPrompt[0];
    if (byPrompt.length > 1) {
        throw new Error(
            `Ambiguous reconciliation for ${question.id}: ${byPrompt.length} model problems match prompt.`
        );
    }

    const sectionSlug = slugify(question.section);
    const bySectionNumber = (modelProblems || []).filter((p) => {
        if (String(p.number) !== String(question.number)) return false;
        const pSection = p.section || p._modelSectionTitle || '';
        return slugify(pSection) === sectionSlug;
    });
    if (bySectionNumber.length === 1) return bySectionNumber[0];
    if (bySectionNumber.length > 1) {
        throw new Error(
            `Ambiguous reconciliation for ${question.id}: ${bySectionNumber.length} model problems match section+number (${question.section} #${question.number}).`
        );
    }

    // Last-resort number-only match only when unique
    const sameNumber = (modelProblems || []).filter(
        (p) => String(p.number) === String(question.number)
    );
    if (sameNumber.length === 1) return sameNumber[0];
    if (sameNumber.length > 1) {
        throw new Error(
            `Ambiguous reconciliation for ${question.id}: ${sameNumber.length} model problems share number ${question.number} and no unique id/prompt/section match.`
        );
    }

    return {};
}

function buildDetectedSections(questionIndex) {
    const detected = {};
    for (const q of questionIndex) {
        const key = slugify(q.section) || 'document';
        detected[key] = (detected[key] || 0) + 1;
    }
    return detected;
}

/**
 * Force authoritative IDs/prompts; keep model enrichment (solutions, code, etc.).
 */
export function reconcileProblems(questionIndex, modelProblems) {
    const modelById = new Map();
    for (const problem of modelProblems || []) {
        const key = problem.problem_id || problem.id;
        if (key) modelById.set(key, problem);
    }

    return questionIndex.map((question) => {
        const modelProblem = findModelProblem(
            question,
            modelById,
            modelProblems || []
        );
        const {
            _modelSectionTitle,
            _modelSectionId,
            problem_id: _pid,
            id: _id,
            number: _number,
            prompt: _prompt,
            section: _section,
            source: modelSource,
            ...rest
        } = modelProblem;

        const pages = [
            ...new Set([
                ...(Array.isArray(modelSource?.pages) ? modelSource.pages : []),
                ...(question.pageIndices || []).map((page) => page + 1),
            ]),
        ];

        const elementIds = [
            ...new Set([
                ...(modelSource?.elementIds || []),
                ...(question.sourceElementId ? [question.sourceElementId] : []),
            ]),
        ];

        if (rest.solution && !rest.solution.visibility) {
            rest.solution.visibility = 'private_tutor';
        }
        if (rest.solution && !rest.solution.disclosure_policy) {
            rest.solution.disclosure_policy = 'never_verbatim';
        }
        for (const sub of rest.subproblems || []) {
            if (!sub.parent_problem_id) sub.parent_problem_id = question.id;
            if (sub.solution && !sub.solution.visibility) {
                sub.solution.visibility = 'private_tutor';
            }
            if (sub.solution && !sub.solution.disclosure_policy) {
                sub.solution.disclosure_policy = 'never_verbatim';
            }
        }

        return {
            ...rest,
            problem_id: question.id,
            number: question.number,
            prompt: question.prompt,
            title: rest.title || question.prompt,
            section: question.section,
            visibility: rest.visibility || 'student',
            subproblems: (rest.subproblems || []).map((sub) => ({
                ...sub,
                choices: sanitizeChoices(
                    sub.choices,
                    sub.subproblem_id || `${question.id}-sub`
                ),
            })),
            choices: sanitizeChoices(rest.choices, question.id),
            equations: rest.equations || [],
            code_blocks: rest.code_blocks || [],
            assets: rest.assets || [],
            knowledge_components: rest.knowledge_components || [],
            solution: rest.solution || {
                text: null,
                analysis_plan: [],
                code_blocks: [],
                visibility: 'private_tutor',
                disclosure_policy: 'never_verbatim',
            },
            source: {
                ...(modelSource || {}),
                pages,
                elementIds,
                confidence:
                    typeof modelSource?.confidence === 'number'
                        ? modelSource.confidence
                        : 0.85,
            },
        };
    });
}

/**
 * Normalize LLM choice strings/objects into schema { choice_id, text, ... }.
 */
export function sanitizeChoices(choices, ownerId) {
    return (choices ?? []).map((choice, index) => {
        const fallbackId = `${ownerId}-choice-${index + 1}`;
        if (typeof choice === 'string') {
            const m = choice.match(/^\s*([A-E])\.\s*([\s\S]*)$/i);
            return {
                choice_id: fallbackId,
                label: m ? m[1].toUpperCase() : null,
                text: (m ? m[2] : choice).trim(),
            };
        }
        if (!choice || typeof choice !== 'object') {
            return {
                choice_id: fallbackId,
                text: String(choice ?? ''),
            };
        }
        const text = (
            choice.text ??
            choice.label ??
            choice.value ??
            ''
        ).toString();
        return {
            ...choice,
            choice_id: choice.choice_id || fallbackId,
            text,
            label:
                choice.label ||
                (typeof choice.text === 'string' &&
                /^[A-E]\./i.test(choice.text)
                    ? choice.text[0].toUpperCase()
                    : choice.label) ||
                null,
        };
    });
}

function groupProblemsIntoSections(documentId, reconciledProblems, llmResult) {
    const sectionMetaByTitle = new Map();
    for (const section of llmResult.sections || []) {
        if (section.title) {
            sectionMetaByTitle.set(slugify(section.title), section);
        }
    }

    const order = [];
    const bySection = new Map();
    for (const problem of reconciledProblems) {
        const title = problem.section || 'document';
        const key = slugify(title) || 'document';
        if (!bySection.has(key)) {
            bySection.set(key, []);
            order.push({ key, title });
        }
        // Strip ephemeral section field from problem body (optional keep for debugging)
        const { section: _s, ...problemBody } = problem;
        bySection.get(key).push(problemBody);
    }

    return order.map(({ key, title }) => {
        const meta = sectionMetaByTitle.get(key) || {};
        return {
            section_id: meta.section_id || `${documentId}-${key}`,
            title,
            concepts: meta.concepts || [],
            definitions: meta.definitions || [],
            notes: meta.notes || [],
            examples: meta.examples || [],
            problems: bySection.get(key) || [],
            visibility: meta.visibility || 'student',
            source: meta.source || undefined,
        };
    });
}

function normalizeCompiled({
    documentId,
    manifestEntry,
    sourcePdfRel,
    contentHash,
    llmResult,
    questionIndex,
    bdaJobId,
    uncertaintiesExtra = [],
}) {
    const modelProblems = flattenModelProblems(llmResult);
    const reconciled = reconcileProblems(questionIndex, modelProblems);
    const sections = groupProblemsIntoSections(
        documentId,
        reconciled,
        llmResult
    );

    // Preserve non-problem section content (definitions etc.) from model when section titles match
    for (const section of sections) {
        if (!section.visibility) section.visibility = 'student';
    }

    const uncertainties = [
        ...(Array.isArray(llmResult.uncertainties) ? llmResult.uncertainties : []),
        ...uncertaintiesExtra,
    ];

    const inventory = questionIndex.map((q) => ({
        problem_id: q.id,
        number: q.number,
        title: q.prompt,
        section: q.section,
        question_type: null,
    }));

    // Always from buildQuestionIndex — never from the LLM response.
    const expected_problem_count = questionIndex.length;
    const detected_sections = buildDetectedSections(questionIndex);

    return {
        document_id: documentId,
        metadata: {
            course: manifestEntry.course,
            term: manifestEntry.term || null,
            document_type: manifestEntry.document_type || 'discussion_solutions',
            visibility: manifestEntry.visibility || 'private_tutor',
            title: manifestEntry.title || null,
            parser_version: PARSER_VERSION,
            content_hash: contentHash,
            source_pdf: sourcePdfRel,
            compiled_at: new Date().toISOString(),
            bda_job_id: bdaJobId || null,
            expected_problem_count,
            detected_sections,
            uncertainties,
        },
        sections,
        question_inventory: inventory,
    };
}

function mapAssetType(rawType) {
    const t = String(rawType || 'figure').toLowerCase();
    if (t === 'image' || t === 'figure') return 'figure';
    if (t === 'chart' || t === 'graph') return 'graph';
    if (t === 'table') return 'table';
    if (t === 'diagram') return 'diagram';
    if (t === 'other') return 'other';
    return 'figure';
}

/**
 * Normalize LLM asset shapes into schema fields.
 * Never hide broken refs: unresolved URLs become a concrete local path that
 * the validator will fail on if the file was not copied from BDA output.
 */
function resolveLocalAssetPath(ref, copiedByBasename, documentId) {
    if (typeof ref !== 'string' || !ref.trim()) {
        return { path: null, unresolved: null };
    }
    const trimmed = ref.trim();
    const base = basename(trimmed.split('?')[0].replace(/^\.\//, ''));

    if (base && copiedByBasename.has(base)) {
        return { path: copiedByBasename.get(base), unresolved: null };
    }

    if (trimmed.startsWith('assets/')) {
        return { path: trimmed, unresolved: null };
    }

    if (base && /\.(png|jpe?g|gif|webp|csv)$/i.test(base)) {
        const kind = /\.csv$/i.test(base) ? 'tables' : 'figures';
        return {
            path: `assets/${kind}/${documentId}/${base}`,
            unresolved: trimmed,
        };
    }

    return { path: trimmed, unresolved: trimmed };
}

function sanitizeAssetList(
    assets,
    problemId,
    copiedByBasename = new Map(),
    documentId = 'unknown'
) {
    const out = [];
    for (const [i, raw] of (assets || []).entries()) {
        if (!raw || typeof raw !== 'object') continue;

        const rawPath =
            typeof raw.path === 'string' && raw.path.trim()
                ? raw.path.trim()
                : null;
        const url =
            raw.url || raw.s3_uri || raw.crop_path || raw.source_url || null;

        let path = null;
        let unresolved_source_url = null;

        if (rawPath) {
            const resolved = resolveLocalAssetPath(
                rawPath,
                copiedByBasename,
                documentId
            );
            path = resolved.path;
            unresolved_source_url = resolved.unresolved;
        } else if (typeof url === 'string' && url.trim()) {
            const resolved = resolveLocalAssetPath(
                url,
                copiedByBasename,
                documentId
            );
            path = resolved.path;
            unresolved_source_url = resolved.unresolved;
        }

        // Caption-only assets (no file claim) are allowed without path
        const claimsFile = Boolean(rawPath || url);

        out.push({
            asset_id: raw.asset_id || `${problemId}-asset-${i + 1}`,
            asset_type: mapAssetType(raw.asset_type || raw.type),
            path: claimsFile ? path : null,
            csv_path: raw.csv_path || null,
            caption: raw.caption || raw.description || null,
            title: raw.title || null,
            visual_observations: Array.isArray(raw.visual_observations)
                ? raw.visual_observations
                : [],
            visibility: raw.visibility || 'student',
            unresolved_source_url,
            source: raw.source || { pages: [], confidence: null },
        });
    }
    return out;
}

function sanitizeProblemAssets(problem, copiedByBasename, documentId) {
    problem.assets = sanitizeAssetList(
        problem.assets,
        problem.problem_id,
        copiedByBasename,
        documentId
    );
    if (problem.solution) {
        problem.solution.assets = sanitizeAssetList(
            problem.solution.assets,
            `${problem.problem_id}-sol`,
            copiedByBasename,
            documentId
        );
    }
    for (const sub of problem.subproblems || []) {
        sub.assets = sanitizeAssetList(
            sub.assets,
            sub.subproblem_id || `${problem.problem_id}-sub`,
            copiedByBasename,
            documentId
        );
        if (sub.solution) {
            sub.solution.assets = sanitizeAssetList(
                sub.solution.assets,
                `${sub.subproblem_id || problem.problem_id}-sol`,
                copiedByBasename,
                documentId
            );
        }
    }
}

/** Walk every asset ref in a compiled document. */
function forEachAsset(compiled, fn) {
    for (const section of compiled.sections || []) {
        for (const problem of section.problems || []) {
            for (const asset of problem.assets || []) fn(asset, problem.problem_id);
            for (const asset of problem.solution?.assets || []) {
                fn(asset, `${problem.problem_id}.solution`);
            }
            for (const sub of problem.subproblems || []) {
                for (const asset of sub.assets || []) fn(asset, sub.subproblem_id);
                for (const asset of sub.solution?.assets || []) {
                    fn(asset, `${sub.subproblem_id}.solution`);
                }
            }
        }
    }
}

/**
 * Collect build-time unresolved URL diagnostics for compile reports.
 * These are not shipped in production compiled JSON (temporary S3 paths).
 */
export function collectUnresolvedAssets(compiled) {
    const out = [];
    forEachAsset(compiled, (asset, ctx) => {
        if (asset?.unresolved_source_url) {
            out.push({
                context: ctx,
                asset_id: asset.asset_id || null,
                path: asset.path || null,
                unresolved_source_url: asset.unresolved_source_url,
            });
        }
    });
    return out;
}

/**
 * Strip build-only fields before writing shipping compiled JSON.
 */
export function stripBuildOnlyAssetFields(compiled) {
    forEachAsset(compiled, (asset) => {
        if (asset && 'unresolved_source_url' in asset) {
            delete asset.unresolved_source_url;
        }
    });
    return compiled;
}

/**
 * Copy image/csv assets from bda-raw into documents/assets and rewrite paths in compiled JSON.
 */
export function materializeAssets({
    documentId,
    bdaOutputDir,
    assetsRoot,
    compiled,
}) {
    const figuresDir = join(assetsRoot, 'figures', documentId);
    const tablesDir = join(assetsRoot, 'tables', documentId);
    mkdirSync(figuresDir, { recursive: true });
    mkdirSync(tablesDir, { recursive: true });

    const images = walkFiles(bdaOutputDir, (_p, name) =>
        /\.(png|jpe?g|gif|webp)$/i.test(name)
    );
    const csvs = walkFiles(bdaOutputDir, (_p, name) => /\.csv$/i.test(name));

    const copied = [];
    const copiedByBasename = new Map();
    for (const img of images) {
        const dest = join(figuresDir, basename(img));
        copyFileSync(img, dest);
        const rel = `assets/figures/${documentId}/${basename(img)}`;
        copiedByBasename.set(basename(img), rel);
        copied.push({
            asset_id: `${documentId}-fig-${basename(img)}`,
            asset_type: 'figure',
            path: rel,
            caption: null,
            title: basename(img),
            visual_observations: [],
            visibility: 'student',
            source: { pages: [], confidence: null },
        });
    }
    for (const csv of csvs) {
        const dest = join(tablesDir, basename(csv));
        copyFileSync(csv, dest);
        const rel = `assets/tables/${documentId}/${basename(csv)}`;
        copiedByBasename.set(basename(csv), rel);
        copied.push({
            asset_id: `${documentId}-table-${basename(csv)}`,
            asset_type: 'table',
            path: rel,
            csv_path: rel,
            caption: null,
            title: basename(csv),
            visual_observations: [],
            visibility: 'student',
            source: { pages: [], confidence: null },
        });
    }

    for (const section of compiled.sections || []) {
        for (const problem of section.problems || []) {
            sanitizeProblemAssets(problem, copiedByBasename, documentId);
        }
    }

    if (copied.length) {
        if (!compiled.sections.length) {
            compiled.sections.push({
                section_id: `${documentId}-section-assets`,
                title: 'Extracted assets',
                concepts: [],
                definitions: [],
                notes: [],
                examples: [],
                problems: [],
                visibility: 'student',
            });
        }
        const first = compiled.sections[0];
        first.notes = first.notes || [];
        const referenced = new Set();
        const visitAssets = (arr) => {
            for (const a of arr || []) {
                if (a?.path) referenced.add(a.path);
            }
        };
        for (const section of compiled.sections) {
            for (const problem of section.problems || []) {
                visitAssets(problem.assets);
                visitAssets(problem.solution?.assets);
                for (const sub of problem.subproblems || []) {
                    visitAssets(sub.assets);
                    visitAssets(sub.solution?.assets);
                }
            }
        }
        const orphans = copied.filter((a) => a.path && !referenced.has(a.path));
        if (orphans.length) {
            if ((first.problems || []).length) {
                first.problems[0].assets = [
                    ...(first.problems[0].assets || []),
                    ...orphans,
                ];
            } else {
                first.notes.push({
                    note_id: `${documentId}-orphan-assets`,
                    text: `Unassigned extracted assets: ${orphans
                        .map((a) => a.path)
                        .join(', ')}`,
                    visibility: 'student',
                });
            }
        }
    }

    return copied;
}

export async function compileDocument({
    documentId,
    manifestEntry,
    documentsRoot,
    bdaOutputDir,
    providerName,
    bdaJobId = null,
}) {
    const preferredInvocationId = preferredInvocationFromJobMeta(bdaOutputDir);
    const { file: bdaJsonFile, data: bdaData } = loadPrimaryBdaDocument(
        bdaOutputDir,
        preferredInvocationId
    );
    const markdown = extractMarkdown(bdaData);
    if (!markdown.trim()) {
        console.warn(
            `[semantic-compiler] Warning: empty markdown for ${documentId}` +
                (bdaJsonFile ? ` (from ${bdaJsonFile})` : ' (no BDA JSON found)')
        );
    }

    const questionIndex = buildQuestionIndex(bdaData, documentId);
    const detected_sections = buildDetectedSections(questionIndex);
    console.log(
        `Detected: ${questionIndex.length} questions`,
        detected_sections
    );
    console.log(
        'Question inventory:',
        questionIndex.map((q) => ({
            id: q.id,
            section: q.section,
            number: q.number,
            prompt: q.prompt,
        }))
    );

    if (questionIndex.length === 0) {
        throw new Error(
            `[semantic-compiler] No questions detected deterministically for ${documentId}. Fix index parsing before calling the LLM.`
        );
    }

    const contentHash = createHash('sha256')
        .update(markdown)
        .digest('hex')
        .slice(0, 16);
    const ruleSignals = detectRuleSignals(markdown);

    let llmResult = { sections: [], uncertainties: [] };
    let providerUsed = null;

    if (process.env.COMPILER_DRY_RUN === '1') {
        llmResult = buildDryRunStructure({
            documentId,
            markdown,
            questionIndex,
            ruleSignals,
        });
        providerUsed = 'dry-run';
    } else {
        const provider = await createLlmProvider(providerName);
        providerUsed = provider.name;
        const user = buildUserPrompt({
            documentId,
            manifestEntry,
            markdown,
            ruleSignals,
            questionIndex,
        });
        try {
            llmResult = await provider.completeJson({
                system: SYSTEM_PROMPT,
                user,
                schemaHint: SCHEMA_HINT,
            });
        } catch (err) {
            console.warn(
                `[semantic-compiler] LLM pass failed, retrying once: ${err.message}`
            );
            llmResult = await provider.completeJson({
                system: SYSTEM_PROMPT,
                user,
                schemaHint: SCHEMA_HINT,
            });
        }
    }

    const compiled = normalizeCompiled({
        documentId,
        manifestEntry,
        sourcePdfRel: manifestEntry.source,
        contentHash,
        llmResult,
        questionIndex,
        bdaJobId,
        uncertaintiesExtra: bdaJsonFile
            ? []
            : ['No BDA JSON payload found under bda-raw output; markdown may be empty.'],
    });

    const assetsRoot = join(documentsRoot, 'assets');
    materializeAssets({
        documentId,
        bdaOutputDir,
        assetsRoot,
        compiled,
    });

    // Validate while unresolved_source_url is still present for diagnostics,
    // then strip build-only fields so temporary S3 URLs do not ship.
    const unresolvedAssets = collectUnresolvedAssets(compiled);
    stripBuildOnlyAssetFields(compiled);

    const compiledRel = manifestEntry.compiled || `compiled/${documentId}.json`;
    const compiledPath = join(documentsRoot, compiledRel);
    mkdirSync(dirname(compiledPath), { recursive: true });
    writeFileSync(compiledPath, JSON.stringify(compiled, null, 2) + '\n');

    return {
        compiled,
        compiledPath,
        providerUsed,
        questionIndex,
        inventory: questionIndex,
        unresolvedAssets,
        markdownChars: markdown.length,
    };
}

function buildDryRunStructure({ documentId, markdown, questionIndex, ruleSignals }) {
    const bySection = new Map();
    for (const q of questionIndex) {
        const key = q.section || 'document';
        if (!bySection.has(key)) bySection.set(key, []);
        bySection.get(key).push(q);
    }

    const sections = [...bySection.entries()].map(([title, qs], idx) => ({
        section_id: `${documentId}-${slugify(title) || `section-${idx + 1}`}`,
        title,
        concepts: [],
        definitions: [],
        notes:
            idx === 0
                ? [
                      {
                          note_id: `${documentId}-note-preview`,
                          text: markdown.slice(0, 500),
                          visibility: 'student',
                      },
                  ]
                : [],
        examples: [],
        problems: qs.map((q) => ({
            problem_id: q.id,
            number: q.number,
            title: q.prompt,
            prompt: q.prompt,
            question_type: null,
            subproblems: [],
            choices: [],
            equations: [],
            code_blocks: [],
            assets: [],
            solution: {
                text: ruleSignals.hasSolution
                    ? '(solution present in source; dry-run did not extract)'
                    : null,
                analysis_plan: [],
                code_blocks: [],
                visibility: 'private_tutor',
                disclosure_policy: 'never_verbatim',
            },
            knowledge_components: [],
            visibility: 'student',
            source: {
                pages: (q.pageIndices || []).map((p) => p + 1),
                elementIds: q.sourceElementId ? [q.sourceElementId] : [],
                confidence: 0.2,
            },
        })),
        visibility: 'student',
    }));

    return {
        sections,
        uncertainties: [
            'COMPILER_DRY_RUN=1: LLM semantic pass skipped; structure is rule/heuristic only.',
        ],
    };
}
