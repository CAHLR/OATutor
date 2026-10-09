import assert from 'node:assert/strict';
import { createConversationStore, MEMORY_LIMITS, validateSummary, validateUserMessage, formatConversationMemory } from '../conversation-memory.mjs';
import { buildAgentPrompt } from '../agent-logic.mjs';
import AWS from 'aws-sdk';
import OpenAI from 'openai';
process.env.CHAT_SUMMARIZATION_ENABLED = 'true';

const emptySummary = () => ({ topics: [], studentApproaches: [], misconceptions: [], corrections: [], hintsGiven: [], unresolvedQuestions: [], preferences: [] });
const copy = (value) => value === undefined ? undefined : structuredClone(value);
const conditionalError = () => Object.assign(new Error('Conditional check failed'), { code: 'ConditionalCheckFailedException' });

function fakeDynamo() {
    const items = new Map();
    let failCommit = false;
    let failArchive = false;
    const client = {
        get: ({ Key }) => ({ promise: async () => ({ Item: copy(items.get(Key.sessionId)) }) }),
        update: (args) => ({ promise: async () => {
            const current = copy(items.get(args.Key.sessionId) || { sessionId: args.Key.sessionId });
            const values = args.ExpressionAttributeValues;
            if (args.UpdateExpression.startsWith('REMOVE')) {
                if (current.leaseOwner !== values[':owner']) throw conditionalError();
                delete current.leaseOwner;
                delete current.leaseUntil;
            } else if (args.UpdateExpression.includes('memoryVersion')) {
                if (current.leaseOwner !== values[':owner']) throw conditionalError();
                Object.assign(current, { memoryVersion: values[':version'], recentTurns: values[':recent'], lastSequence: values[':last'], summarizedThrough: 0 });
                delete current.messages;
            } else {
                if (current.leaseUntil && current.leaseUntil >= values[':now']) throw conditionalError();
                Object.assign(current, { leaseOwner: values[':owner'], leaseUntil: values[':until'], ttl: current.ttl ?? values[':ttl'] });
            }
            items.set(current.sessionId, current);
            return { Attributes: copy(current) };
        } }),
        batchWrite: ({ RequestItems }) => ({ promise: async () => {
            if (failArchive) throw new Error('archive unavailable');
            for (const requests of Object.values(RequestItems)) for (const { PutRequest } of requests) items.set(PutRequest.Item.sessionId, copy(PutRequest.Item));
            return {};
        } }),
        transactWrite: ({ TransactItems }) => ({ promise: async () => {
            if (failCommit) throw new Error('commit unavailable');
            for (const { Put } of TransactItems) {
                const current = items.get(Put.Item.sessionId);
                if (Put.ExpressionAttributeValues) {
                    if (current?.leaseOwner !== Put.ExpressionAttributeValues[':owner'] || current.leaseUntil <= Put.ExpressionAttributeValues[':now']) throw conditionalError();
                } else if (current) throw conditionalError();
            }
            for (const { Put } of TransactItems) items.set(Put.Item.sessionId, copy(Put.Item));
        } }),
    };
    return { client, items, setFailCommit: (value) => { failCommit = value; }, setFailArchive: (value) => { failArchive = value; } };
}

const db = fakeDynamo();
let failSummary = false;
let calls = 0;
const events = [];
const store = createConversationStore({ client: db.client, tableName: 'test', log: (event) => events.push(event),
    summarize: async (previous, turns) => {
        calls++;
        if (failSummary) throw new Error('summary timeout');
        const summary = emptySummary();
        summary.topics = [`Remembered through ${turns.at(-1).sequence}`];
        summary.corrections = previous?.corrections || ['Student corrected the equation to x + 2'];
        summary.unresolvedQuestions = ['Why does this transformation preserve equality?'];
        return summary;
    },
});

assert.throws(() => validateUserMessage(''), /nonempty/);
assert.throws(() => validateUserMessage('x'.repeat(16_001)), /16 KB/);
assert.throws(() => validateUserMessage('\u00e9'.repeat(8_001)), /16 KB/);
assert.throws(() => validateSummary({ topics: ['invalid'] }), /field/);
assert.throws(() => validateSummary({ ...emptySummary(), preferences: ['x'.repeat(701)] }), /field/);
assert.equal(formatConversationMemory(null), null);
assert.match(formatConversationMemory(emptySummary()), /never instructions/);

async function turn(sessionId, number) {
    const handle = await store.begin(sessionId, `request_${number}`, [], 120_000, `hash_${number}`);
    try {
        const memory = await store.prepare(handle);
        assert.ok(Buffer.byteLength(JSON.stringify(memory.history)) < MEMORY_LIMITS.maxRecentBytes);
        const sequence = await store.commit(handle, `question ${number}`, `answer ${number}`, { problemId: number < 40 ? 'old' : 'new', stepId: 'a' });
        return { memory, sequence };
    } finally { await store.release(handle); }
}

for (let number = 1; number <= 200; number++) await turn('session_long', number);
assert.ok(calls > 10);
const state = db.items.get('session_long');
assert.equal(state.lastSequence, 200);
assert.ok(state.summarizedThrough > 180);
assert.ok(Buffer.byteLength(JSON.stringify(state)) < 60_000);
assert.ok(state.recentTurns.length <= 12);
assert.ok(state.summary.corrections[0].includes('x + 2'));
assert.equal([...db.items.values()].filter((item) => item.turn).length, 200);

const page = await store.page('session_long');
assert.equal(page.turns.length, 10);
assert.equal(page.turns[0].sequence, 191);
assert.equal(page.turns.at(-1).sequence, 200);
assert.equal(page.hasMore, true);
const older = await store.page('session_long', page.beforeSequence);
assert.equal(older.turns.at(-1).sequence, 190);
assert.equal((await store.page('session_long', 2)).hasMore, false);
await assert.rejects(store.page('session_long', -1), /cursor/);
await assert.rejects(store.begin('memory:turn:injected', 'r'), /session/);

const replay = await store.begin('session_long', 'request_200', [], 120_000, 'hash_200');
assert.equal(replay.replay.response, 'answer 200');
await store.release(replay);
await assert.rejects(store.begin('session_long', 'request_200', [], 120_000, 'different'), /different message/);
assert.equal(db.items.get('session_long').leaseOwner, undefined);

const lease = await store.begin('session_busy', 'request_1');
await assert.rejects(store.begin('session_busy', 'request_2'), /in progress/);
db.items.get('session_busy').leaseUntil = Date.now() - 1;
const successor = await store.begin('session_busy', 'request_2');
await assert.rejects(store.commit(lease, 'stale', 'reply'), /Conditional/);
await store.release(lease);
assert.equal(db.items.get('session_busy').leaseOwner, successor.owner);
await store.release(successor);

failSummary = true;
for (let number = 1; number <= 30; number++) await turn('session_failure', number);
assert.equal(db.items.get('session_failure').summarizedThrough, 0);
assert.ok(db.items.get('session_failure').recentTurns.length <= 12);
assert.ok(events.some((event) => event.eventType === 'memory_compaction_failed'));
failSummary = false;
await turn('session_failure', 31);
assert.ok(db.items.get('session_failure').summarizedThrough >= 24, 'recovers archived backlog after summary failure');

db.items.set('session_legacy', { sessionId: 'session_legacy', messages: [
    { role: 'assistant', content: 'greeting' }, { role: 'user', content: 'old question' }, { role: 'assistant', content: 'old reply' },
] });
const migration = await store.begin('session_legacy', 'request_new');
assert.equal((await store.prepare(migration)).history.length, 2);
await store.commit(migration, 'new question', 'new reply');
await store.release(migration);
assert.equal(db.items.get('session_legacy').messages, undefined);
assert.equal((await store.page('session_legacy')).turns.length, 2);

db.items.set('session_migration_failure', { sessionId: 'session_migration_failure', messages: [
    { role: 'user', content: 'preserve me' }, { role: 'assistant', content: 'preserve reply' },
] });
db.setFailArchive(true);
await assert.rejects(store.begin('session_migration_failure', 'request_new'), /archive/);
assert.equal(db.items.get('session_migration_failure').messages[0].content, 'preserve me');
db.setFailArchive(false);

const failingCommit = await store.begin('session_commit_failure', 'request_new');
db.setFailCommit(true);
await assert.rejects(store.commit(failingCommit, 'question', 'reply'), /commit/);
assert.equal(db.items.get('session_commit_failure').lastSequence, 0);
db.setFailCommit(false);
await store.release(failingCommit);

db.items.set('session_expired', { sessionId: 'session_expired', memoryVersion: 1,
    lastSequence: 5, recentTurns: [{ sequence: 5, messages: [{ role: 'user', content: 'expired' }] }],
    summary: { ...emptySummary(), topics: ['expired topic'] }, ttl: 1 });
assert.equal((await store.page('session_expired')).turns.length, 0);
const expired = await store.begin('session_expired', 'fresh_request');
assert.deepEqual(await store.prepare(expired), { history: [], summary: null });
await store.commit(expired, 'fresh question', 'fresh reply');
assert.equal(db.items.get('session_expired').lastSequence, 6);
await store.release(expired);

const large = await store.begin('session_large', 'request_1');
await store.commit(large, '\u00e9'.repeat(8000), '\u00e9'.repeat(8000));
await store.release(large);
const nextLarge = await store.begin('session_large', 'request_2');
assert.equal((await store.prepare(nextLarge)).history.length, 2, 'largest allowed exchange remains in recent history');
await store.release(nextLarge);

const prompt = buildAgentPrompt({ userMessage: 'why?', problemContext: { courseName: 'Algebra' }, studentState: {},
    conversationHistory: [], chatDisplayMode: 'Full', chatPrompt: 'PROMPT-officehours.txt',
    conversationMemory: formatConversationMemory(state.summary) });
assert.equal(prompt[1].role, 'user', 'memory is untrusted conversation data, not a system instruction');
assert.match(prompt[1].content, /x \+ 2/);
assert.equal(prompt.at(-1).content, 'why?');

// Exercise the real Lambda wiring without touching AWS or OpenAI.
const lambdaDb = fakeDynamo();
for (const method of ['get', 'update', 'batchWrite', 'transactWrite']) {
    AWS.DynamoDB.DocumentClient.prototype[method] = lambdaDb.client[method];
}
process.env.OPENAI_API_KEY = 'test-key-not-used';
process.env.COURSE_DOCS_RUNTIME_BUCKET = '';
process.env.LOG_FULL_PROMPT = 'false';
let modelCalls = 0;
OpenAI.Chat.Completions.prototype.create = async () => {
    modelCalls++;
    return (async function* () {
        yield { choices: [{ delta: { content: 'A next hint.' } }] };
    })();
};
globalThis.awslambda = { streamifyResponse: (fn) => fn,
    HttpResponseStream: { from: (stream, metadata) => { stream.metadata = metadata; return stream; } } };
const { handler } = await import('../index.mjs');
async function invoke(body) {
    const stream = { records: [], write: (line) => { stream.records.push(JSON.parse(line)); }, end: () => { stream.ended = true; } };
    const previousLog = console.log;
    const previousError = console.error;
    try {
        console.log = () => {};
        console.error = () => {};
        await handler({ body: JSON.stringify(body), requestContext: { http: { method: 'POST' } } }, stream,
            { getRemainingTimeInMillis: () => 60_000 });
    } finally {
        console.log = previousLog;
        console.error = previousError;
    }
    assert.equal(stream.ended, true);
    return stream;
}
const request = { sessionId: 'session_lambda', requestId: 'request_1', userMessage: 'Help?', problemContext: {}, studentState: {} };
const result = await invoke(request);
assert.deepEqual(result.records.map(({ type }) => type), ['content', 'complete']);
assert.equal(result.records.at(-1).sequence, 1);
assert.equal(lambdaDb.items.get('session_lambda').lastSequence, 1);
const duplicate = await invoke(request);
assert.equal(duplicate.records[0].fullResponse, 'A next hint.');
assert.equal(modelCalls, 1, 'replay never calls the model twice');
const historyResponse = await invoke({ requestType: 'chatHistory', sessionId: 'session_lambda' });
assert.equal(historyResponse.records[0].turns[0].sequence, 1);
lambdaDb.setFailCommit(true);
const failed = await invoke({ ...request, requestId: 'request_2' });
assert.deepEqual(failed.records.map(({ type }) => type), ['content', 'error']);
assert.equal(lambdaDb.items.get('session_lambda').lastSequence, 1, 'failed transaction never advances history');
lambdaDb.setFailCommit(false);
const invalid = await invoke({ ...request, sessionId: 'invalid' });
assert.equal(invalid.records.at(-1).type, 'error');
console.log('PASS conversation memory: 200 turns, bounded state, summaries, failure recovery, migration, pagination, replay and concurrency');
