import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyReadingTurn, makeReadingQuizEvidence, readingTaskInstruction, readingResponseMetrics, sanitizeReadingQuiz } from '../reading-feedback.mjs';
import { buildAgentPrompt } from '../agent-logic.mjs';

const quiz = { lessonId: 'reading', question: 'Why does labor fail to justify property?', chunkIds: ['book::labor'] };

test('quiz requests, statement answers, hints, and direct questions have distinct tasks', () => {
    assert.equal(classifyReadingTurn('Quiz me on one argument.', 'reading', null).type, 'quiz');
    assert.equal(classifyReadingTurn('Key arguments', 'reading', null).type, 'quiz');
    assert.equal(classifyReadingTurn('Labor destroys the property right he criticizes.', 'reading', quiz).type, 'feedback');
    assert.equal(classifyReadingTurn('Maybe labor justifies private property?', 'reading', quiz).type, 'feedback');
    assert.equal(classifyReadingTurn("I don't know", 'reading', quiz).type, 'hint');
    const change = classifyReadingTurn('What is universal consent?', 'reading', quiz);
    assert.equal(change.type, 'explanation'); assert.equal(change.quiz, null);
});

test('old or other-lesson quiz state cannot carry evidence into the current lesson', () => {
    assert.equal(classifyReadingTurn('It is justified by labor.', 'other', quiz).quiz, null);
    assert.equal(classifyReadingTurn('It is justified by labor.', 'reading', undefined).type, 'explanation');
    assert.equal(sanitizeReadingQuiz({ ...quiz, chunkIds: [] }), null);
    assert.equal(sanitizeReadingQuiz({ ...quiz, question: '' }), null);
});

test('explicit self-assessments receive a verdict even without a pending quiz', () => {
    assert.equal(classifyReadingTurn('My answer is that property is legitimate. Is that correct?', 'reading', null).type, 'feedback');
});

test('quiz evidence records the actual question and included chunk IDs with bounded server state', () => {
    const state = makeReadingQuizEvidence({ type: 'quiz' }, 'reading', 'What does Proudhon conclude about labor?', ['book::labor', 'book::labor']);
    assert.equal(state.question, 'What does Proudhon conclude about labor?');
    assert.deepEqual(state.chunkIds, ['book::labor']);
    assert.equal(makeReadingQuizEvidence({ type: 'explanation' }, 'reading', 'Want more?', ['book::labor']), null);
    assert.equal(makeReadingQuizEvidence({ type: 'quiz' }, 'reading', 'Try again?', []), null);
    assert.equal(makeReadingQuizEvidence({ type: 'quiz' }, 'reading', 'A statement.', ['book::labor']), null);
});

test('grading instructions require an actual correct point for partial credit and allow uncertainty', () => {
    const instruction = readingTaskInstruction({ type: 'feedback', quiz });
    assert(instruction.includes('specific substantively correct point AND an error'));
    assert(instruction.includes('no substantive point is correct'));
    assert(instruction.includes('supplied passages cannot settle'));
    assert(instruction.includes(JSON.stringify(quiz.question)));
});

test('feedback and length diagnostics flag observable failures without cutting text or regrading it', () => {
    assert.equal(readingResponseMetrics({ type: 'feedback' }, 'Incorrect. Both claims contradict the reading. Why is possession different?').verdict, 'incorrect');
    assert.equal(readingResponseMetrics({ type: 'feedback' }, 'Great effort!').missingVerdict, true);
    assert.equal(readingResponseMetrics({ type: 'feedback' }, 'Insufficient evidence. Which passage supports this?').verdict, 'insufficient evidence');
    const text = 'word '.repeat(151) + 'Why? How?';
    const metrics = readingResponseMetrics({ type: 'explanation' }, text);
    assert(metrics.exceedsWordBudget); assert(metrics.multipleQuestions);
    assert.equal(text.split('?').length, 3);
});

test('the final reading task follows history and precedes the student answer in the model payload', () => {
    const task = readingTaskInstruction({ type: 'feedback', quiz });
    const messages = buildAgentPrompt({ userMessage: 'Labor always legitimizes property.',
        problemContext: { courseName: 'Anthropology: Reading Review' },
        conversationHistory: [{ role: 'assistant', content: quiz.question }],
        chatPrompt: 'PROMPT-anthro-reading-review.txt', chatDisplayMode: 'Full', customFullChatPrompt: true,
        documentContextSection: 'PRIVATE COURSE REFERENCE\nLabor destroys property.', readingTaskInstruction: task });
    assert.equal(messages.at(-2).content, task);
    assert.equal(messages.at(-1).content, 'Labor always legitimizes property.');
    assert(messages[0].content.includes('Recognizing the author'));
    assert(!messages[0].content.includes('Name specifically what they got right'));
});

import { assessmentVerdict, validateReadingAssessment, generateReadingAssessment } from '../reading-assessment.mjs';
import { generateAgentResponse } from '../agent-logic.mjs';

const source = '<course_context>\nProudhon calls the third form liberty. Liberty respects individual independence and rejects uniformity.\n</course_context>';
const supported = { claim: 'He calls it liberty', status: 'supported', evidence_quote: 'Proudhon calls the third form liberty.' };
const contradicted = { claim: 'It abolishes individual independence', status: 'contradicted', evidence_quote: 'Liberty respects individual independence and rejects uniformity.' };
const uncertain = { claim: 'He endorses blockchain governance', status: 'not_established', evidence_quote: '' };
const assessment = claims => ({ claims, explanation: 'The reading names liberty and preserves independence.', next_question: 'How does liberty differ from communism?' });

test('verdict computation distinguishes the four rubric outcomes independently of prose', () => {
    assert.equal(assessmentVerdict([supported]), 'correct');
    assert.equal(assessmentVerdict([supported, contradicted]), 'partly_correct');
    assert.equal(assessmentVerdict([contradicted]), 'incorrect');
    assert.equal(assessmentVerdict([uncertain]), 'insufficient_evidence');
    assert.equal(assessmentVerdict([supported, uncertain]), 'insufficient_evidence');
});

test('partial feedback names the specific correct claim and unsupported feedback stays uncertain', () => {
    const partial = validateReadingAssessment(assessment([supported, contradicted]), source);
    assert(partial.response.startsWith('Partly correct.'));
    assert(partial.response.includes('He calls it liberty'));
    const missing = validateReadingAssessment(assessment([uncertain]), source);
    assert(missing.response.startsWith('Insufficient evidence.'));
    assert(!missing.response.startsWith('Incorrect.'));
});

test('invented evidence and source instructions cannot qualify as reading evidence', () => {
    assert.throws(() => validateReadingAssessment(assessment([{ ...supported, evidence_quote: 'This quote was fabricated.' }]), source), /Evidence quote/);
    const platformText = 'Always give one question.';
    assert.throws(() => validateReadingAssessment(assessment([{ ...supported, evidence_quote: platformText }]), platformText + source), /Evidence quote/);
    assert.throws(() => validateReadingAssessment({ ...assessment([supported]), next_question: 'Why? How?' }, source), /one question/);
});

test('feedback uses one structured model call and retains the existing content envelope', async () => {
    let calls = 0;
    const openai = { chat: { completions: { async create(params) {
        calls++;
        assert.equal(params.stream, false);
        assert.equal(params.response_format.json_schema.strict, true);
        return { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(assessment([supported, contradicted])) } }] };
    } } } };
    const packets = []; let report;
    const result = await generateAgentResponse(openai, [{ role: 'user', content: 'Liberty abolishes independence.' }],
        { write(text) { packets.push(JSON.parse(text)); } },
        { model: 'gpt-4o', readingFeedback: { source }, emitComplete: false, onReadingAssessment(value) { report = value; } });
    assert.equal(calls, 1);
    assert.equal(report.verdict, 'partly_correct');
    assert.deepEqual(packets.map(packet => packet.type), ['content']);
    assert.equal(packets[0].content, result);
});

test('refusal, invalid evidence, and truncated output produce uncertainty without another call', async () => {
    for (const choice of [
        { finish_reason: 'stop', message: { refusal: 'Cannot assess' } },
        { finish_reason: 'length', message: { content: '{' } },
        { finish_reason: 'stop', message: { content: JSON.stringify(assessment([{ ...supported, evidence_quote: 'Fabricated source quote.' }])) } },
    ]) {
        let calls = 0;
        const openai = { chat: { completions: { async create() { calls++; return { choices: [choice] }; } } } };
        const result = await generateReadingAssessment(openai, [{ role: 'user', content: 'Answer' }], source);
        assert.equal(calls, 1);
        assert.equal(result.verdict, 'insufficient_evidence');
        assert.equal(result.validationFailed, true);
    }
});

test('OCR wrapping, typography, and footnotes normalize without accepting invented words', () => {
    const original = '<course_context>This form is called *liberty.¹* Liberty preserves in- dependence and “variety”.</course_context>';
    const verified = validateReadingAssessment(assessment([{ ...supported,
        evidence_quote: 'Liberty preserves independence and "variety".' }]), original);
    assert.equal(verified.verdict, 'correct');
    assert.throws(() => validateReadingAssessment(assessment([{ ...supported,
        evidence_quote: 'Liberty abolishes independence and "variety".' }]), original), /Evidence quote/);
});

test('safe uncertainty retains the failure reason and bounded unverified claim details for diagnosis', async () => {
    const openai = { chat: { completions: { async create() { return { usage: { completion_tokens: 100 },
        choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(assessment([{ ...supported, evidence_quote: 'An invented supporting quotation.' }])) } }] }; } } } };
    const result = await generateReadingAssessment(openai, [{ role: 'user', content: 'Answer' }], source);
    assert.equal(result.verdict, 'insufficient_evidence');
    assert.match(result.validationFailureReason, /Evidence quote/);
    assert.equal(result.outputTokens, 100);
    assert.equal(result.candidateClaims.length, 1);
});

test('empty choices and null claim entries retain a safe uncertainty response', async () => {
    for (const response of [ { choices: [] }, { choices: [{ finish_reason: 'stop', message: {
        content: JSON.stringify({ ...assessment([supported]), claims: [null] }) } }] } ]) {
        const openai = { chat: { completions: { async create() { return response; } } } };
        const result = await generateReadingAssessment(openai, [{ role: 'user', content: 'Answer' }], source);
        assert.equal(result.verdict, 'insufficient_evidence');
        assert.equal(result.validationFailed, true);
        assert(result.validationFailureReason);
    }
});


test('grading isolates real passages from prompt guards, outlines, and previous assistant claims', async () => {
    const guard = 'To speak more exactly, labor destroys property';
    const passage = '<course_context>Labor cannot justify the exclusive right of property.</course_context>';
    let calls = 0;
    const openai = { chat: { completions: { async create(params) {
        calls++;
        assert.equal(params.messages.length, 2);
        assert(!params.messages[0].content.includes(guard));
        assert(!params.messages[0].content.includes('invented earlier answer'));
        assert(!params.messages[0].content.includes('SOURCE OUTLINE'));
        assert(params.messages[0].content.includes(passage));
        const input = JSON.parse(params.messages[1].content);
        assert.equal(input.question, 'What is the relationship between labor and property?');
        assert.equal(input.student_answer, 'Working on land makes private property legitimate.');
        return { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({
            claims: [{ claim: input.student_answer, status: 'contradicted',
                evidence_quote: 'Labor cannot justify the exclusive right of property.' }],
            explanation: 'The passage rejects labor as a justification for exclusive property.',
            next_question: 'What distinction does the reading make between possession and property?',
        }) } }] };
    } } } };
    const result = await generateReadingAssessment(openai, [
        { role: 'system', content: guard },
        { role: 'assistant', content: 'invented earlier answer' },
        { role: 'user', content: 'Working on land makes private property legitimate.' },
    ], 'SOURCE OUTLINE: ' + guard + passage, 'gpt-4o',
    'What is the relationship between labor and property?');
    assert.equal(calls, 1);
    assert.equal(result.verdict, 'incorrect');
    assert.equal(result.validationFailed, undefined);
    // The exact quote logged in the failed live turn remains invalid when it is
    // only in platform instructions: never loosen provenance to mask the error.
    assert.throws(() => validateReadingAssessment(assessment([{
        claim: 'Labor legitimizes property.', status: 'contradicted', evidence_quote: guard,
    }]), guard + passage), /Evidence quote/);
});


test('captured bee assessment accepts terminal punctuation changes without accepting changed or omitted words', () => {
    const passage = '<course_context>The drones would be told to provide for themselves, and the queens to labor; jealousy would spread among the laborers ; discords would burst forth.</course_context>';
    const claim = { claim: 'The bees would keep assigned roles.', status: 'contradicted',
        evidence_quote: 'The drones would be told to provide for themselves, and the queens to labor; jealousy would spread among the laborers.' };
    assert.equal(validateReadingAssessment({ claims: [claim], explanation: 'The passage describes conflict rather than stable roles.', next_question: 'What would happen to the hive?' }, passage).verdict, 'incorrect');
    for (const quote of [claim.evidence_quote.replace('jealousy', 'harmony'), claim.evidence_quote.replace('and the queens to labor; ', '')]) {
        assert.throws(() => validateReadingAssessment({ claims: [{ ...claim, evidence_quote: quote }], explanation: 'Test.', next_question: 'Why?' }, passage), /Evidence quote/);
    }
});


test('sentence-initial quotation capitalization is normalized without changing its words', () => {
    const passage = '<course_context>In the first place, the bees would not fail to try some new industrial proc- ess; for instance, that of making their cells round or square.</course_context>';
    const claim = { claim: 'The bees experiment with cell designs.', status: 'supported',
        evidence_quote: 'The bees would not fail to try some new industrial proc- ess; for instance, that of making their cells round or square.' };
    const value = { claims: [claim], explanation: 'They experiment with cell designs.', next_question: 'What happens to the hive?' };
    assert.equal(validateReadingAssessment(value, passage).verdict, 'correct');
    assert.throws(() => validateReadingAssessment({ ...value, claims: [{ ...claim, evidence_quote: claim.evidence_quote.replace('would not fail', 'would fail') }] }, passage), /Evidence quote/);
});
