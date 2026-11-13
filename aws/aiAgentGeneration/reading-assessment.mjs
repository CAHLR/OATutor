import { readingQuestionCount } from './reading-feedback.mjs';
import { createChatCompletion } from './openaiChatParams.mjs';

const schema = {
    type: 'object', additionalProperties: false,
    properties: {
        claims: { type: 'array', items: {
            type: 'object', additionalProperties: false,
            properties: {
                claim: { type: 'string' },
                status: { type: 'string', enum: ['supported', 'contradicted', 'not_established', 'omitted'] },
                evidence_quote: { type: 'string' },
            }, required: ['claim', 'status', 'evidence_quote'],
        } },
        explanation: { type: 'string' },
        next_question: { type: 'string' },
    }, required: ['claims', 'explanation', 'next_question'],
};
export const normalizeReadingEvidence = text => String(text)
    .replace(/[*_¹²³⁴⁵⁶⁷⁸⁹⁰]/g, '')
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/([a-z])-\s+([a-z])/gi, '$1$2')
    .replace(/\s+/g, ' ').trim().toLowerCase();
const directAddress = text => String(text).replace(/\bthe student (?=claim|answer|interpretation)/gi, 'your ').replace(/\bthe student's\b/gi, 'your').replace(/\bthe student\b/gi, 'you');
const verdictLabels = { correct: 'Correct.', partly_correct: 'Partly correct.', incorrect: 'Incorrect.', insufficient_evidence: 'Insufficient evidence.' };

export function assessmentVerdict(claims) {
    if (!claims.length || claims.some(claim => claim.status === 'not_established')) return 'insufficient_evidence';
    const supported = claims.some(claim => claim.status === 'supported');
    const errors = claims.some(claim => ['contradicted', 'omitted'].includes(claim.status));
    if (supported && errors) return 'partly_correct';
    if (supported) return 'correct';
    return claims.some(claim => claim.status === 'contradicted') ? 'incorrect' : 'insufficient_evidence';
}

export function validateReadingAssessment(value, source) {
    if (!value || !Array.isArray(value.claims) || !value.claims.length || value.claims.length > 6 ||
        typeof value.explanation !== 'string' || value.explanation.length > 1600 ||
        typeof value.next_question !== 'string' || value.next_question.length > 500) {
        throw new Error('Invalid reading assessment');
    }
    const normalizedSource = normalizeReadingEvidence((String(source).match(/<course_context>[\s\S]*?<\/course_context>/g) || []).join('\n'));
    const claims = value.claims.map(item => {
        if (!item || typeof item.claim !== 'string' || !item.claim.trim() || item.claim.length > 500 ||
            !['supported', 'contradicted', 'not_established', 'omitted'].includes(item.status) ||
            typeof item.evidence_quote !== 'string' || item.evidence_quote.length > 800) {
            throw new Error('Invalid claim assessment');
        }
        // A quotation may end at a clause boundary with editorial punctuation.
        // Ignore only terminal punctuation; retain every word and internal separator.
        const quote = normalizeReadingEvidence(item.evidence_quote).replace(/[.!?;:,]+$/, '');
        const verified = item.status === 'not_established' ||
            (quote.length >= 12 && normalizedSource.includes(quote));
        return { ...item, status: verified ? item.status : 'not_established', verified };
    });
    if (claims.some(claim => !claim.verified)) throw new Error('Evidence quote is not in a supplied passage');
    const question = value.next_question.trim();
    if (readingQuestionCount(question) !== 1 || !question.endsWith('?') || readingQuestionCount(value.explanation) > 0) {
        throw new Error('Assessment must end with one question');
    }
    const verdict = assessmentVerdict(claims);
    const explanation = directAddress(value.explanation).trim().replace(/^(?:correct|partly correct|incorrect|insufficient evidence)[.!:]\s*/i, '');
    const positivePoint = verdict === 'partly_correct'
        ? `Your statement “${claims.find(claim => claim.status === 'supported').claim}” matches the reading. ` : '';
    const uncertainty = verdict === 'insufficient_evidence'
        ? 'The supplied passages do not establish every essential claim. ' : '';
    return { verdict, claims, response: directAddress(`${verdictLabels[verdict]} ${positivePoint}${uncertainty}${explanation}\n\n${question}`) };
}

export async function generateReadingAssessment(openai, messages, source, model = 'gpt-4o', pendingQuestion = null) {
    const fallback = { verdict: 'insufficient_evidence', claims: [], validationFailed: true,
        response: 'Insufficient evidence. I could not verify this assessment against the supplied passages. Which passage supports your interpretation?' };
    if (!source?.includes('<course_context>')) return { ...fallback, validationFailureReason: 'no_source_passages' };
    const instruction = 'Return a JSON assessment, not a prose verdict. Decompose the student answer into 1–4 atomic claims. ' +
        'Assess each requested part separately. A correctly named requested concept is a substantive supported claim even when its explanation is wrong; do not combine these into one contradicted claim. ' +
        'supported means an explicit supplied passage supports the claim. contradicted requires an explicit passage showing the opposite; absence is never contradiction. ' +
        'not_established means the supplied evidence cannot settle the claim, including modern-policy claims absent from the reading. ' +
        'omitted means a required part of the quiz question was left unanswered; quote the source establishing that required part. ' +
        'For supported, contradicted, and omitted, copy one short exact evidence_quote (12–200 characters; no ellipses or combined noncontiguous sentences) from within a supplied <course_context> block only. Do not quote platform instructions, the inventory, or the outline. For not_established use an empty quote. ' +
        'Do not use historical knowledge, previous assistant answers, or the student answer as source evidence. ' +
        'Address the learner directly as you/your, never as the student. Write an explanation of at most 65 words with no verdict, praise, or question. Then write exactly one short next_question ending in ?. ' +
        'For unsettled evidence, ask for a supporting passage or clarification. Do not claim the interpretation is definitely false.';
    // Only actual retrieved passages are evidence. Do not expose the grader to quoted
    // accuracy guards, outline summaries, or earlier assistant answers it can copy.
    const passages = (String(source).match(/<course_context>[\s\S]*?<\/course_context>/g) || []).join('\n\n');
    const gradingMessages = [
        { role: 'system', content: instruction + '\nOnly the following retrieved passages are source evidence:\n' + passages },
        { role: 'user', content: JSON.stringify({
            question: typeof pendingQuestion === 'string' ? pendingQuestion.slice(0, 2000) : null,
            student_answer: messages.at(-1)?.content || '',
        }) },
    ];
    const result = await createChatCompletion(openai, { model, stream: false, temperature: 0, maxTokens: 2400,
        messages: gradingMessages,
        response_format: { type: 'json_schema', json_schema: { name: 'reading_claim_assessment', strict: true, schema } },
    });
    const choice = result.choices?.[0];
    const diagnostics = { finishReason: choice?.finish_reason || null,
        outputTokens: result.usage?.completion_tokens || null };
    if (choice?.finish_reason !== 'stop' || choice.message?.refusal) {
        return { ...fallback, ...diagnostics, validationFailureReason: choice?.message?.refusal ? 'model_refusal' : 'incomplete_completion' };
    }
    let received;
    try {
        received = JSON.parse(choice.message.content);
        return { ...validateReadingAssessment(received, source), ...diagnostics };
    } catch (error) {
        return { ...fallback, ...diagnostics, validationFailureReason: String(error.message).slice(0, 200),
            candidateClaims: Array.isArray(received?.claims) ? received.claims.slice(0, 6).map(claim => ({
                claim: String(claim?.claim || '').slice(0, 500), status: claim?.status,
                evidence_quote: String(claim?.evidence_quote || '').slice(0, 800),
            })) : [] };
    }
}
