import test from 'node:test';
import assert from 'node:assert/strict';
import { generateGroundedReading, validateReadingGeneration } from '../reading-generation.mjs';
import { readingQuestionCount, finalReadingQuestion, classifyReadingTurn } from '../reading-feedback.mjs';
import { validateReadingAssessment } from '../reading-assessment.mjs';
import { generateAgentResponse } from '../agent-logic.mjs';
const source = 'SOURCE OUTLINE — unreviewed\n1. Labor\nUse it to guide\n' +
 '<course_context>\nchunk_id: book::labor\nsection: Labor Destroys Property\nprompt: Labor depends on cooperation and does not justify exclusive property.\nconcepts: labor\n</course_context>\n' +
 '<course_context>\nchunk_id: book::conclusion\nprompt: The third form is liberty, balancing equality and independence.\nconcepts: liberty\n</course_context>';
const quiz = { question: 'Why does labor fail to justify exclusive property?', chunk_id: 'book::labor', evidence_quote: 'Labor depends on cooperation and does not justify exclusive property.' };
const point = { text: 'The argument rejects exclusive property founded on labor.', chunk_id: quiz.chunk_id, evidence_quote: quiz.evidence_quote };
const conclusion = { text: 'The conclusion proposes liberty, balancing equality and independence.', chunk_id: 'book::conclusion', evidence_quote: 'The third form is liberty, balancing equality and independence.' };
const overview = { progression: [point, { ...point, text: 'Cooperation undermines exclusive ownership.' }], conclusion };
const mock = value => ({ chat: { completions: { async create() { return { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(value) } }] }; } } } });

test('quiz evidence must belong to the cited passage, not headings or invented quotes', () => {
 assert.deepEqual(validateReadingGeneration(quiz, source, 'quiz').chunkIds, ['book::labor']);
 for (const invalid of [{ ...quiz, chunk_id: 'not-allowed' }, { ...quiz, evidence_quote: 'Labor Destroys Property' },
  { ...quiz, evidence_quote: 'An invented quotation.' }, { ...quiz, question: 'Why? How?' }]) assert.throws(() => validateReadingGeneration(invalid, source, 'quiz'));
});
test('overview requires liberty in both its conclusion and verified evidence', () => {
 assert(validateReadingGeneration(overview, source, 'overview').response.includes('liberty'));
 assert.throws(() => validateReadingGeneration({ ...overview, conclusion: { ...conclusion, text: 'He ends with equality.' } }, source, 'overview'), /liberty/);
 assert.throws(() => validateReadingGeneration({ ...overview, conclusion: { ...conclusion, chunk_id: point.chunk_id, evidence_quote: point.evidence_quote } }, source, 'overview'), /liberty/);
 assert.throws(() => validateReadingGeneration({ ...overview, progression: [{ ...point, text: 'word '.repeat(160) }, point] }, source, 'overview'));
});
test('title punctuation does not hide actual questions or corrupt saved quiz text', () => {
 assert.equal(readingQuestionCount('In "What Is Property?", he rejects ownership. Why?'), 1);
 assert.equal(readingQuestionCount('Why? How?'), 2);
 assert.equal(readingQuestionCount('He asks “Why does labor matter?” What do you think?'), 2);
 const question = 'Why does Proudhon reject labor in "What Is Property?"?';
 assert.equal(readingQuestionCount(question), 1);
 assert.equal(finalReadingQuestion('Read carefully.\n\n' + question), question);
 assert.equal(classifyReadingTurn('“How does the book’s argument progress from beginning to end?”', 'reading', null).wholeReading, true);
 assert.equal(classifyReadingTurn('Summarize the book', 'reading', { lessonId: 'reading', question: 'Why?', chunkIds: ['a'] }).type, 'explanation');
});
test('feedback addresses you directly and accepts quoted title question marks', () => {
 const result = validateReadingAssessment({ claims: [{ claim: 'Labor legitimizes property.', status: 'contradicted', evidence_quote: quiz.evidence_quote }],
  explanation: 'In "What Is Property?", the student claim contradicts the reading. The student\'s answer misses cooperation.',
  next_question: 'Why does cooperation matter in "What Is Property?"?' }, source);
 assert(!/the student/i.test(result.response)); assert(result.response.includes('your claim')); assert(result.response.includes('your answer'));
});
test('source-isolated generation uses one call and fails closed on unverified output', async () => {
 for (const kind of ['quiz', 'overview']) {
  let calls = 0;
  const openai = { chat: { completions: { async create(params) {
   calls++; assert.equal(params.messages.length, 2); assert(params.response_format.json_schema.strict);
   if (kind === 'quiz') assert(!params.messages[0].content.includes('SOURCE OUTLINE'));
   return { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(kind === 'quiz' ? quiz : overview) } }] };
  } } } };
  const result = await generateGroundedReading(openai, 'Quiz me', { kind, source });
  assert(!result.validationFailed); assert.equal(calls, 1);
 }
 const failed = await generateGroundedReading(mock({ ...quiz, evidence_quote: 'Fabricated instructions.' }), 'Quiz me', { kind: 'quiz', source });
 assert(failed.validationFailed); assert.deepEqual(failed.chunkIds, []); assert(!failed.response.endsWith('?'));
});
test('verified quiz preserves streaming envelope and reports only its evidence ID', async () => {
 const packets = []; let verified;
 const response = await generateAgentResponse(mock(quiz), [{ role: 'system', content: 'Do not copy this old answer.' }, { role: 'user', content: 'Quiz me' }],
  { write(s) { packets.push(JSON.parse(s)); } }, { readingGeneration: { kind: 'quiz', source }, onReadingGeneration(v) { verified = v; }, emitComplete: false });
 assert.equal(response, quiz.question); assert.deepEqual(packets.map(p => p.type), ['content']); assert.deepEqual(verified.chunkIds, [quiz.chunk_id]);
});


test('unavailable, refused, truncated, malformed generations do not produce quiz state or extra calls', async () => {
 let calls = 0;
 const choices = [[], [{ finish_reason: 'length', message: { content: '{' } }],
  [{ finish_reason: 'stop', message: { refusal: 'No' } }], [{ finish_reason: 'stop', message: { content: 'not JSON' } }]];
 for (const choice of choices) {
  const openai = { chat: { completions: { async create() { calls++; return { choices: choice }; } } } };
  const result = await generateGroundedReading(openai, 'Quiz me', { kind: 'quiz', source });
  assert(result.validationFailed); assert.deepEqual(result.chunkIds, []);
 }
 assert.equal(calls, choices.length);
 const noSource = await generateGroundedReading({}, 'Quiz me', { kind: 'quiz', source: '' });
 assert.equal(noSource.validationFailureReason, 'no_source_passages');
});
