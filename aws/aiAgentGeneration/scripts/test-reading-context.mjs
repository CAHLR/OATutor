import test from 'node:test';
import { buildAgentPrompt } from '../agent-logic.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    flattenLearningObjects, splitReadingUnit, buildMaterialDescriptor,
    assemblePrivateCourseReference, selectRelevantUnits, buildQueryText,
    createDocumentContextRuntime, READING_CHUNK_CHARS,
} from '../document-context.mjs';
import { makeOfficeHoursLessonId } from '../document-id-utils.mjs';

const entry = { document_type: 'textbook', title: 'What Is Property?', compiled: 'compiled/reading.json' };
const compiled = {
    document_id: 'reading',
    metadata: { document_type: 'textbook', title: entry.title },
    sections: [{
        section_id: 'book', title: entry.title, problems: [
            { problem_id: 'reading::method', title: 'Method and property',
                prompt: 'Property is theft. Proudhon examines the justification for exclusive ownership. '.repeat(900),
                source: { pages: [0] } },
            { problem_id: 'reading::consent', title: 'Universal Consent',
                prompt: 'Universal consent does not justify property. Consent cannot alienate the rights of later generations.',
                source: { pages: [0] } },
            { problem_id: 'reading::conclusion', title: 'Third Form of Society',
                prompt: 'The conclusion examines liberty, equality, property, and communism.',
                source: { pages: [0] } },
        ],
    }],
};
const material = buildMaterialDescriptor('reading', entry, compiled);
const units = flattenLearningObjects('reading', compiled, material);

test('long textbook sections become bounded, deterministic child units with source provenance', () => {
    const children = units.filter(unit => unit.parent_unit_id === 'reading::method');
    assert(children.length > 10);
    assert(children.every(unit => unit.prompt.length <= READING_CHUNK_CHARS));
    assert.deepEqual(children.map(unit => unit.unit_id),
        flattenLearningObjects('reading', compiled, material).filter(unit => unit.parent_unit_id).map(unit => unit.unit_id));
    const source = compiled.sections[0].problems[0].prompt;
    let covered = 0;
    for (const unit of children) {
        assert(unit.source_char_start <= covered);
        assert.equal(unit.prompt, source.slice(unit.source_char_start, unit.source_char_end));
        assert.deepEqual(unit.pages, [0]);
        assert(unit.embed_text.includes(unit.prompt.trim()));
        covered = unit.source_char_end;
    }
    assert.equal(covered, source.length);
});

test('OCR without spaces terminates and preserves complete source coverage', () => {
    const parts = splitReadingUnit({ unit_id: 'ocr', material_type: 'textbook', prompt: 'x'.repeat(18000) });
    assert(parts.length > 1);
    assert(parts.every(unit => unit.prompt.length <= READING_CHUNK_CHARS));
    assert.equal(parts.at(-1).source_char_end, 18000);
});

test('worksheet questions retain their IDs and complete solutions', () => {
    const worksheet = { ...compiled, metadata: { document_type: 'worksheet' } };
    const result = flattenLearningObjects('reading', worksheet, { material_type: 'worksheet' });
    assert.equal(result.length, 3);
    assert.equal(result[0].unit_id, 'reading::method');
    assert.equal(result[0].prompt, compiled.sections[0].problems[0].prompt);
});

test('unchanged short sections retain existing IDs', () => {
    assert(units.some(unit => unit.unit_id === 'reading::consent'));
});

test('an oversized first match cannot erase every excerpt or suppress a later match', () => {
    const result = assemblePrivateCourseReference([
        { ...units[0], unit_id: 'legacy-oversized', prompt: 'Property is theft. '.repeat(10000) },
        units.find(unit => unit.unit_id === 'reading::consent'),
    ], { materials: [material], officeHours: true, customFullChatPrompt: true });
    assert.deepEqual(result.includedChunkIds, ['legacy-oversized', 'reading::consent']);
    assert.deepEqual(result.truncatedChunkIds, ['legacy-oversized']);
    assert.equal((result.text.match(/<course_context>/g) || []).length, 2);
    assert.equal((result.text.match(/<\/course_context>/g) || []).length, 2);
    assert(result.text.includes('Universal consent does not justify property'));
    assert(result.referenceChars <= 12000);
});

test('the source outline preserves heading order and is explicitly unreviewed', () => {
    const result = assemblePrivateCourseReference([units[0]], { materials: [material], officeHours: true });
    assert(result.text.includes('not an instructor-reviewed study guide'));
    assert(result.text.indexOf('1. Method and property') < result.text.indexOf('2. Universal Consent'));
    assert(result.text.indexOf('2. Universal Consent') < result.text.indexOf('3. Third Form of Society'));
});

test('specific-section retrieval and short follow-ups retain relevant source text', () => {
    const selected = selectRelevantUnits(units, 'Universal consent and future generations');
    assert(selected.some(row => row.unit.unit_id === 'reading::consent'));
    const query = buildQueryText({ userMessage: 'Why?', recentHistory: [
        { role: 'assistant', content: 'Universal consent cannot alienate the rights of later generations.' },
    ] });
    assert(selectRelevantUnits(units, query).some(row => row.unit.unit_id === 'reading::consent'));
});

function runtimeWith(vectors) {
    const values = {
        'coursePlans.json': [
            { courseName: 'Reading course', lessons: [{ id: 'reading-lesson', chat_documents: ['reading'] }] },
            { courseName: 'Other course', lessons: [{ id: 'other-lesson', chat_documents: [] }] },
        ],
        'manifest.json': { reading: entry },
        'compiled/reading.json': compiled,
        'compiled/reading.embeddings.json': vectors,
    };
    return createDocumentContextRuntime({ loader: {
        async getJson(key) {
            if (values[key]) return values[key];
            const error = new Error('not found'); error.code = 'NoSuchKey'; throw error;
        },
    } });
}

test('runtime exposes actual prompt inclusion and safely falls back from old parent embeddings', async () => {
    const runtime = runtimeWith({ units: { 'reading::method': [1, 0] } });
    let embeddingCalls = 0;
    const result = await runtime.buildDocumentContext({
        lessonId: 'reading-lesson', userMessage: 'Why is property theft?',
        openai: { embeddings: { async create() { embeddingCalls++; throw new Error('must not call'); } } },
    });
    assert(result.meta.includedChunkIds.length > 0);
    assert.equal(embeddingCalls, 0);
    assert.deepEqual(result.meta.staleEmbeddingDocumentIds, ['reading']);
    assert(result.privatePromptSection.includes('Property is theft'));
    assert.equal(result.meta.referenceChars, result.privatePromptSection.length);
    assert.equal((result.privatePromptSection.match(/<course_context>/g) || []).length,
        result.meta.includedChunkIds.length);
    assert(result.selectedContexts.every(item => item.chunkId));
});

test('matching child embeddings use the hybrid path', async () => {
    const runtime = runtimeWith({ units: Object.fromEntries(units.map(unit => [unit.unit_id, [1, 0]])) });
    let calls = 0;
    const result = await runtime.buildDocumentContext({
        lessonId: 'reading-lesson', userMessage: 'Universal consent',
        openai: { embeddings: { async create() { calls++; return { data: [{ embedding: [1, 0] }] }; } } },
    });
    assert.equal(calls, 1);
    assert(result.selectedContexts.some(item => item.embedScore !== null));
    assert(result.meta.includedChunkIds.length > 0);
    assert.equal(result.meta.staleEmbeddingDocumentIds, undefined);
});

test('Office Hours inherits lesson references, unrelated courses and spoofed hints do not', async () => {
    const runtime = runtimeWith(null);
    const office = await runtime.buildDocumentContext({
        lessonId: makeOfficeHoursLessonId('Reading course'), officeHours: true,
        userMessage: 'Universal consent',
    });
    assert.deepEqual(office.allowedDocumentIds, ['reading']);
    assert(office.meta.includedChunkIds.length);
    for (const lessonId of ['other-lesson', 'unknown', makeOfficeHoursLessonId('Other course')]) {
        const other = await runtime.buildDocumentContext({
            lessonId, userMessage: 'Property is theft', chat_documents: ['reading'],
            clientHints: { chat_documents: ['reading'] },
        });
        assert.deepEqual(other.allowedDocumentIds, []);
        assert.equal(other.privatePromptSection, null);
    }
});

test('included and omitted IDs account for every selected match at budget exhaustion', () => {
    const selected = Array.from({ length: 40 }, (_, index) => ({
        ...units[0], unit_id: 'passage-' + index,
    }));
    const report = assemblePrivateCourseReference(selected, { materials: [material] });
    assert(report.referenceChars <= 12000);
    assert(report.omittedChunkIds.length > 0);
    assert.equal(report.includedChunkIds.length + report.omittedChunkIds.length, selected.length);
});

// Optional local regression against the actual published artifact; no cloud/model calls.
if (process.env.READING_REGRESSION_ARTIFACT) {
    test('published Anthropology artifact includes real passages for property and whole-reading questions', () => {
        const actual = JSON.parse(readFileSync(process.env.READING_REGRESSION_ARTIFACT, 'utf8'));
        const descriptor = buildMaterialDescriptor(actual.document_id, {}, actual);
        const passages = flattenLearningObjects(actual.document_id, actual, descriptor);
        assert(passages.length > 26);
        for (const query of ['Why does Proudhon say property is theft?',
            'What is the overall structure of the text?',
            'Universal consent and property', 'Third form of society']) {
            const selected = selectRelevantUnits(passages, query).map(row => row.unit);
            const report = assemblePrivateCourseReference(selected, {
                materials: [descriptor], officeHours: true, customFullChatPrompt: true,
            });
            assert(report.includedChunkIds.length > 0, query);
            assert(report.text.includes('<course_context>'), query);
            assert(report.referenceChars <= 12000);
            assert(report.text.includes('SOURCE OUTLINE'));
        }
    });
}


test('the final model payload retains source passages and has no study-guide placeholder', () => {
    const reference = assemblePrivateCourseReference([units[0]], { materials: [material], officeHours: true });
    const messages = buildAgentPrompt({
        userMessage: 'Why is property theft?', problemContext: { courseName: 'Anthropology: Reading Review' },
        chatPrompt: 'PROMPT-anthro-reading-review.txt', chatDisplayMode: 'Full',
        customFullChatPrompt: true, documentContextSection: reference.text,
    });
    assert(messages.some(message => message.role === 'system' && message.content.includes('<course_context>')));
    assert(messages[0].content.includes('Pierre-Joseph Proudhon'));
    assert(!messages[0].content.includes('TO BE FILLED IN'));
    assert.match(messages[0].content, /Never invent[^\n]*historical label/);
    assert(messages[0].content.includes('labor destroys property'));
    assert(messages[0].content.includes('Earlier assistant messages may be wrong'));
    assert.equal(messages.at(-1).content, 'Why is property theft?');
});


test('a new explicit question excludes previous answer text, while Why retains it', () => {
    const history = [{ role: 'assistant', content: 'Property and possession differ in legal power and physical use.' }];
    const question = 'What third form of society does Proudhon propose, and how does it differ from property and communism?';
    assert.equal(buildQueryText({ userMessage: question, recentHistory: history }), question);
    assert.equal(buildQueryText({ userMessage: 'Universal consent', recentHistory: history }), 'Universal consent');
    assert.equal(buildQueryText({ userMessage: 'Why does universal consent fail to justify property?', recentHistory: history }), 'Why does universal consent fail to justify property?');
    assert(buildQueryText({ userMessage: 'Why?', recentHistory: history }).includes('Property and possession'));
});

test('the highest-ranked passage keeps its definition beyond the old equal-share cutoff', () => {
    const leading = { ...units[0], prompt: 'Background. '.repeat(160) + 'The third form of society is called liberty.' };
    const report = assemblePrivateCourseReference([leading, ...units.slice(1, 5)], { materials: [material], officeHours: true });
    assert(report.text.includes('The third form of society is called liberty.'));
    assert(!report.truncatedChunkIds.includes(leading.unit_id));
    assert(report.referenceChars <= 12000);
});

if (process.env.READING_REGRESSION_ARTIFACT) {
    test('the reported conclusion query includes the named definition despite misleading history and vectors', () => {
        const actual = JSON.parse(readFileSync(process.env.READING_REGRESSION_ARTIFACT, 'utf8'));
        const descriptor = buildMaterialDescriptor(actual.document_id, {}, actual);
        const passages = flattenLearningObjects(actual.document_id, actual, descriptor);
        for (const passage of passages) passage.embedding = [1, 0];
        const query = buildQueryText({
            userMessage: 'What third form of society does Proudhon propose, and how does it differ from property and communism?',
            recentHistory: [{ role: 'assistant', content: 'Property is a legal right. Possession is a matter of fact. '.repeat(15) }],
        });
        // Even give the section opening a worse embedding similarity.
        const opening = passages.find(passage => passage.parent_unit_id?.endsWith('conclusion') && passage.source_char_start === 0);
        opening.embedding = [0.2, 0.98];
        const ranked = selectRelevantUnits(passages, query, { queryEmbedding: [1, 0] });
        assert.equal(ranked[0].unit.unit_id, opening.unit_id);
        const report = assemblePrivateCourseReference(ranked.map(row => row.unit), { materials: [descriptor], officeHours: true });
        assert(report.text.includes('we will call *liberty'));
        assert(!report.truncatedChunkIds.includes(opening.unit_id));
        assert(report.referenceChars <= 12000);
    });
}


test('quiz-answer evidence is retained only while its document remains allowed', async () => {
    const runtime = runtimeWith(null);
    const answer = await runtime.buildDocumentContext({ lessonId: 'reading-lesson', userMessage: 'Yes.',
        retainedChunkIds: ['reading::consent', 'unrelated::private'] });
    assert.deepEqual(answer.meta.retainedChunkIds, ['reading::consent']);
    assert.deepEqual(answer.meta.missingRetainedChunkIds, ['unrelated::private']);
    assert(answer.meta.includedChunkIds.includes('reading::consent'));
    assert(answer.privatePromptSection.includes('Universal consent does not justify property'));
    const other = await runtime.buildDocumentContext({ lessonId: 'other-lesson', userMessage: 'Yes.',
        retainedChunkIds: ['reading::consent'] });
    assert.equal(other.privatePromptSection, null);
});


test('pending quiz question supplies retrieval topic and fresh matches precede stale quiz evidence', async () => {
    const query = buildQueryText({ userMessage: 'It does.', pendingQuestion: 'Why does universal consent fail?',
        recentHistory: [{ role: 'assistant', content: 'An unrelated prior answer.' }] });
    assert.equal(query, 'Why does universal consent fail? It does.');
    const runtime = runtimeWith(null);
    const retained = units.filter(unit => unit.parent_unit_id === 'reading::method').slice(0, 5).map(unit => unit.unit_id);
    const result = await runtime.buildDocumentContext({ lessonId: 'reading-lesson',
        userMessage: 'It does.', pendingQuestion: 'Why does universal consent fail?', retainedChunkIds: retained });
    assert(result.meta.includedChunkIds.includes('reading::consent'));
    assert(result.meta.includedChunkIds.indexOf('reading::consent') < result.meta.includedChunkIds.indexOf(retained[0]));
    assert(result.privatePromptSection.includes('Consent cannot alienate the rights of later generations.'));
    const unrelated = await runtime.buildDocumentContext({ lessonId: 'other-lesson',
        userMessage: 'It does.', pendingQuestion: 'Why does universal consent fail?', retainedChunkIds: retained });
    assert.equal(unrelated.privatePromptSection, null);
});


if (process.env.READING_REGRESSION_ARTIFACT) {
    test('reported labor quiz answer retrieves the named section despite stale generic quiz passages', async () => {
        const actual = JSON.parse(readFileSync(process.env.READING_REGRESSION_ARTIFACT, 'utf8'));
        const descriptor = buildMaterialDescriptor(actual.document_id, {}, actual);
        const passages = flattenLearningObjects(actual.document_id, actual, descriptor);
        const retained = passages.filter(unit => unit.parent_unit_id?.endsWith('::preamble')).slice(0, 5).map(unit => unit.unit_id);
        const values = { 'coursePlans.json': [{ courseName: 'Reading course', lessons: [
            { id: 'reading-lesson', chat_documents: [actual.document_id] },
        ] }], 'manifest.json': { [actual.document_id]: { compiled: 'compiled/actual.json' } },
            'compiled/actual.json': actual };
        const runtime = createDocumentContextRuntime({ loader: { async getJson(key) {
            return values[key.replace(/^documents\//, '')] || null;
        } } });
        const result = await runtime.buildDocumentContext({ lessonId: 'reading-lesson',
            userMessage: 'Proudhon argues that working on land makes private property legitimate',
            pendingQuestion: 'What does Proudhon argue about the relationship between labor and property in the section "Labor Destroys Property"?',
            retainedChunkIds: retained });
        assert(result.meta.includedChunkIds[0].includes('labor-destroys-property::chunk-0-'));
        assert(result.privatePromptSection.includes('Labor destroys Property. This proposition is the logical result'));
        assert(result.meta.referenceChars <= 12000);
    });
}


if (process.env.READING_REGRESSION_ARTIFACT) {
    test('whole-reading retrieval explicitly includes the real concluding liberty passage within budget', async () => {
        const actual = JSON.parse(readFileSync(process.env.READING_REGRESSION_ARTIFACT, 'utf8'));
        const values = { 'coursePlans.json': [{ courseName: 'Reading course', lessons: [
            { id: 'reading-lesson', chat_documents: [actual.document_id] },
        ] }], 'manifest.json': { [actual.document_id]: { compiled: 'compiled/actual.json' } }, 'compiled/actual.json': actual };
        const runtime = createDocumentContextRuntime({ loader: { async getJson(key) {
            return values[key.replace(/^documents\//, '')] || null;
        } } });
        for (const userMessage of ['How does the book’s argument progress from beginning to end?', 'Summarize the reading']) {
            const result = await runtime.buildDocumentContext({ lessonId: 'reading-lesson', userMessage, readingOverview: true });
            assert(result.meta.includedChunkIds[0].includes('third-form-of-society-conclusion::chunk-0-'));
            assert(result.privatePromptSection.includes('we will call *liberty'));
            assert(result.meta.referenceChars <= 12000);
        }
        const denied = await runtime.buildDocumentContext({ lessonId: 'unrelated', userMessage: 'Summarize the reading', readingOverview: true });
        assert.equal(denied.privatePromptSection, null);
    });
}
