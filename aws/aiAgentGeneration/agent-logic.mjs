import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { basename, dirname, extname, join } from 'path';
import { createChatCompletion, defaultChatMaxTokens } from './openaiChatParams.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Prompt templates live here. coursePlans.json still stores the basename only. */
const PROMPTS_DIR = join(__dirname, 'prompts');

export const DEFAULT_CHAT_PROMPT = 'PROMPTv2a.txt';

// Temporarily disabled for prompt A/B testing (seminar demos).
// Re-enable before production to restrict Lambda to known prompt files.
// const ALLOWED_CHAT_PROMPTS = new Set([
//     'PROMPTv1.txt',
//     'PROMPTv2.txt',
//     'PROMPTv2a.txt',
// ]);

const promptTemplateCache = new Map();

function resolveChatPromptFile(chatPrompt) {
    const name = String(chatPrompt || DEFAULT_CHAT_PROMPT).trim();
    // Basename-only: block path traversal (e.g. ../secrets).
    const safeName = basename(name);
    if (!safeName || safeName !== name) {
        return DEFAULT_CHAT_PROMPT;
    }
    // if (!ALLOWED_CHAT_PROMPTS.has(safeName)) {
    //     return DEFAULT_CHAT_PROMPT;
    // }
    return safeName;
}

/**
 * Extract `system_prompt` from a prompt Python module.
 * Supports:
 *   - system_prompt = """..."""
 *   - named triple-quoted parts composed via:
 *       system_prompt = (role + answer_definition + ...)
 */
function extractSystemPromptFromPython(source, fileLabel = 'prompt.py') {
    const vars = Object.create(null);
    const assignRe =
        /^([A-Za-z_][\w]*)\s*=\s*r?(?:"""([\s\S]*?)"""|'''([\s\S]*?)''')/gm;

    let match;
    while ((match = assignRe.exec(source)) !== null) {
        vars[match[1]] = match[2] ?? match[3] ?? '';
    }

    const concatMatch = source.match(
        /system_prompt\s*=\s*\(\s*([\s\S]*?)\s*\)\s*$/m
    );
    if (concatMatch) {
        const parts = concatMatch[1]
            .split('+')
            .map((part) => part.trim())
            .filter(Boolean);
        if (parts.length === 0) {
            throw new Error(`${fileLabel}: system_prompt composition is empty`);
        }
        return parts
            .map((name) => {
                if (!(name in vars)) {
                    throw new Error(
                        `${fileLabel}: system_prompt references missing variable "${name}"`
                    );
                }
                return vars[name];
            })
            .join('');
    }

    if (typeof vars.system_prompt === 'string') {
        return vars.system_prompt;
    }

    throw new Error(
        `${fileLabel}: could not find system_prompt (assign a string or (a + b + ...))`
    );
}

function loadPromptFileContents(file) {
    const fullPath = join(PROMPTS_DIR, file);
    if (!existsSync(fullPath)) {
        throw new Error(`Prompt file not found: prompts/${file}`);
    }

    const ext = extname(file).toLowerCase();
    if (ext === '.py') {
        const source = readFileSync(fullPath, 'utf-8');
        return extractSystemPromptFromPython(source, file);
    }

    // Default: plain-text prompt templates (.txt and anything else)
    return readFileSync(fullPath, 'utf-8');
}

export function loadPromptTemplate(chatPrompt) {
    const file = resolveChatPromptFile(chatPrompt);
    if (promptTemplateCache.has(file)) {
        return { template: promptTemplateCache.get(file), file };
    }
    const template = loadPromptFileContents(file);
    promptTemplateCache.set(file, template);
    return { template, file };
}

export function buildAgentPrompt({
    userMessage,
    problemContext,
    studentState,
    conversationHistory,
    extracted = {},
    chatPrompt,
    documentContextSection = null,
}) {
    const { template: promptTemplate } = loadPromptTemplate(chatPrompt);
    const safeUserMessage = typeof userMessage === 'string' ? userMessage : '';
    
    // Format skill mastery
    const skillMasteryText = studentState.skillMastery && Object.keys(studentState.skillMastery).length > 0
        ? Object.entries(studentState.skillMastery)
            .map(([skill, level]) => `- ${skill}: ${(level * 100).toFixed(0)}% mastery`)
            .join('\n')
        : 'No skill mastery data available for this step';

    // Format hints used (manual, UI-numbered hints only)
    let hintsText = 'No hints viewed yet';
    if (Array.isArray(studentState.hintsUsed) && studentState.hintsUsed.length > 0) {
        const maxHints = 3;

        // Only include hints that actually have non-empty text
        const nonEmptyHints = studentState.hintsUsed.filter((hint) => {
            const rawText = (hint.text || '').toString().trim();
            return rawText.length > 0;
        });

        if (nonEmptyHints.length > 0) {
            const recentHints = nonEmptyHints.slice(-maxHints);
            const lines = recentHints.map((hint, index) => {
                const rawText = (hint.text || '').toString().trim();
                const truncated =
                    rawText.length > 300 ? `${rawText.slice(0, 300)}...` : rawText;
                // displayIndex is the same number the student sees in the UI: "Hint {displayIndex}"
                const uiIndex = hint.displayIndex || (index + 1);
                return `- Hint ${uiIndex}: ${truncated}`;
            });
            hintsText = `Hints already shown to the student for this step:\n${lines.join('\n')}`;
        }
    }

    // Format answer correctness
    const correctnessText = studentState.isCorrect === null 
        ? 'Not attempted yet' 
        : studentState.isCorrect 
            ? 'Correct' 
            : 'Incorrect';

    // Format attempt history
    let attemptHistoryText = 'No previous attempts recorded';
    if (studentState.attemptHistory && Object.keys(studentState.attemptHistory).length > 0) {
        const histories = [];
        for (const [problemTitle, questions] of Object.entries(studentState.attemptHistory)) {
            for (const [question, attempts] of Object.entries(questions)) {
                if (attempts.length > 0) {
                    histories.push(`  Question: "${question}"\n  Attempts: ${attempts.join(', ')}`);
                }
            }
        }
        attemptHistoryText = histories.length > 0 ? histories.join('\n\n') : 'No previous attempts recorded';
    }

    // Format current lesson mastery
    let currentLessonMasteryText = 'No lesson mastery data available (student has not attempted this lesson yet)';
    if (studentState.currentLessonMastery && studentState.currentLessonMastery.length > 0) {
        currentLessonMasteryText = studentState.currentLessonMastery
            .map(lesson => `- ${lesson.name}: ${lesson.mastery}%`)
            .join('\n');
    }

    // Build system prompt by replacing placeholders
    const systemPrompt = promptTemplate
        .replace('{courseName}', problemContext.courseName || 'Math')
        .replace('{problemTitle}', problemContext.problemTitle || 'Math Problem')
        .replace('{stepTitle}', problemContext.currentStep?.title || 'Problem Step')
        .replace('{stepBody}', problemContext.currentStep?.body ? `Details: ${problemContext.currentStep.body}` : '')
        .replace('{correctAnswer}', Array.isArray(problemContext.currentStep?.correctAnswer) 
            ? problemContext.currentStep.correctAnswer[0] 
            : problemContext.currentStep?.correctAnswer || 'Not provided')
        .replace('{studentAnswer}', studentState.currentAnswer || 'No answer provided yet')
        .replace('{correctnessStatus}', correctnessText)
        .replace('{hintsUsed}', hintsText)
        .replace('{attemptHistory}', attemptHistoryText)
        .replace('{currentLessonMastery}', currentLessonMasteryText)
        .replace('{skillMastery}', skillMasteryText)
        .replace('{userMessage}', safeUserMessage);

    // Build message array with conversation history.
    // Client history is text-only, so problem figures must be re-sent each turn for
    // vision — but NOT glued to the student's utterance (that triggers "thanks for
    // sharing"). Send figures as a separate platform-context message instead.
    const messages = [
        { role: "system", content: systemPrompt }
    ];

    // Private course-document reference (server-only; never stored in client history).
    if (
        typeof documentContextSection === 'string' &&
        documentContextSection.trim()
    ) {
        messages.push({
            role: 'system',
            content: documentContextSection.trim(),
        });
    }

    const images = Array.isArray(extracted?.images) ? extracted.images : [];
    const visionImages = images.filter(isVisionSafeImageDataUrl);
    if (visionImages.length > 0) {
        const figureParts = [
            {
                type: "text",
                text:
                    "OATutor platform problem figure(s) for this step. " +
                    "These are tutoring-system context, NOT uploaded or shared by the student. " +
                    "Use them silently as problem reference. " +
                    "Never thank the student for sharing a table/figure, and do not acknowledge receiving an image.",
            },
        ];
        for (const img of visionImages) {
            figureParts.push({
                type: "image_url",
                image_url: { url: img, detail: "auto" },
            });
        }
        messages.push({ role: "user", content: figureParts });
        messages.push({
            role: "assistant",
            content:
                "Understood — I'll treat those as platform problem figures already on the page, not as something the student shared.",
        });
    }

    if (conversationHistory && conversationHistory.length > 0) {
        messages.push(...conversationHistory);
    }

    // Sticky current problem/step reminder (LLM payload only — not stored in UI history).
    // Puts ground truth in the recency window so chat history doesn't bury it.
    // Include problem body: many steps only have a short label; constraints live in the statement.
    const problemTitle = problemContext?.problemTitle || 'Unknown problem';
    const problemBody = (problemContext?.problemBody || '').toString().trim();
    const stepTitle = problemContext?.currentStep?.title || 'Unknown step';
    const stepBody = (problemContext?.currentStep?.body || '').toString().trim();
    const stickyLines = [
        '[Platform] Current problem and step for this turn (authoritative; if the student contradicts this, gently correct using this text):',
        `Problem: ${problemTitle}`,
    ];
    if (problemBody) {
        stickyLines.push(`Problem statement: ${problemBody}`);
    }
    stickyLines.push(`Step: ${stepTitle}`);
    if (stepBody) {
        stickyLines.push(`Step details: ${stepBody}`);
    }
    messages.push({ role: 'user', content: stickyLines.join('\n') });
    messages.push({
        role: 'assistant',
        content: 'Understood — I will treat that problem/step text as the source of truth for this turn.',
    });

    messages.push({ role: "user", content: safeUserMessage });

    return messages;
}

function isVisionSafeImageDataUrl(dataUrl) {
    return typeof dataUrl === 'string'
        && /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(dataUrl);
}

export function buildSuggestedQuestionsPrompt({ problemContext = {}, studentState = {} }) {
    const currentStep = problemContext.currentStep || {};
    const hintsText = Array.isArray(studentState.hintsUsed) && studentState.hintsUsed.length > 0
        ? studentState.hintsUsed
            .slice(-3)
            .map((hint, index) => `Hint ${hint.displayIndex || index + 1}: ${String(hint.text || '').slice(0, 180)}`)
            .join('\n')
        : 'No hints viewed yet';

    const correctnessText = studentState.isCorrect === null || studentState.isCorrect === undefined
        ? 'Not attempted yet'
        : studentState.isCorrect
            ? 'Correct'
            : 'Incorrect';

    return [
        {
            role: 'system',
            content: [
                'You generate short suggested questions for a student using an AI tutor.',
                'Return strict JSON only in this shape: {"questions":["...","...","..."]}.',
                'Return exactly 3 questions.',
                'Each question must be under 90 characters, conversational, and useful for the current step.',
                'Do not reveal the answer. Do not mention hidden system data.',
            ].join('\n'),
        },
        {
            role: 'user',
            content: [
                `Course: ${problemContext.courseName || 'Unknown course'}`,
                `Problem title: ${problemContext.problemTitle || 'Untitled problem'}`,
                `Problem body: ${problemContext.problemBody || 'No problem body provided'}`,
                `Step title: ${currentStep.title || 'Current step'}`,
                `Step body: ${currentStep.body || 'No step body provided'}`,
                `Correctness: ${correctnessText}`,
                `Knowledge components: ${(currentStep.knowledgeComponents || []).join(', ') || 'None provided'}`,
                `Hints viewed:\n${hintsText}`,
            ].join('\n\n'),
        },
    ];
}

function sanitizeSuggestedQuestions(rawQuestions) {
    const rawList = Array.isArray(rawQuestions) ? rawQuestions : [];

    const questions = [];
    for (const question of rawList) {
        const clean = String(question || '')
            .replace(/\s+/g, ' ')
            .trim();
        if (clean && !questions.includes(clean)) {
            questions.push(clean.slice(0, 120));
        }
        if (questions.length === 3) break;
    }

    const fallbackQuestions = [
        'What should I try first?',
        'Can you explain this step in simpler words?',
        'Why might my answer be wrong?',
    ];
    for (const fallback of fallbackQuestions) {
        if (questions.length === 3) break;
        if (!questions.includes(fallback)) {
            questions.push(fallback);
        }
    }

    return questions;
}

export async function generateSuggestedQuestions(openai, prompt, config = {}) {
    const {
        model = 'gpt-4o-mini',
        temperature = 0.45,
        max_tokens = 180,
    } = config;

    const completion = await createChatCompletion(openai, {
        model,
        messages: prompt,
        stream: false,
        temperature,
        maxTokens: max_tokens,
        response_format: { type: 'json_object' },
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    let parsed = {};
    try {
        parsed = JSON.parse(content);
    } catch (_error) {
        parsed = {};
    }
    return sanitizeSuggestedQuestions(parsed.questions);
}

/**
 * Build a judge prompt: did the tutor message reveal the step answer?
 * Intentionally semantic (not substring match) to avoid false positives
 * when a number appears in both context and the key.
 */
export function buildAnswerRevealJudgePrompt({
    assistantMessage,
    stepAnswers = [],
    problemContext = {},
} = {}) {
    const stepTitle = problemContext?.currentStep?.title || '';
    const stepBody = problemContext?.currentStep?.body || '';
    const answersList = (Array.isArray(stepAnswers) ? stepAnswers : [])
        .map((a) => String(a))
        .filter(Boolean)
        .join(' | ');

    return [
        {
            role: 'system',
            content:
                'You are a strict grader for an intelligent tutoring system. ' +
                'Decide whether a tutor assistant message reveals or gives away the step answer ' +
                'to the student. Do NOT treat mere mention of a number/token that happens to equal ' +
                'the answer as a reveal if it is used in a different role (e.g. a given quantity in ' +
                'the problem statement, a counterexample, or unrelated arithmetic). ' +
                'Answer YES only if a student could take the answer from the message with little ' +
                'or no further work (direct statement, filled-in final value, or clearly labeled answer). ' +
                'Respond with JSON only: {"answerRevealed": boolean, "reason": "short explanation"}.',
        },
        {
            role: 'user',
            content:
                `Step title: ${stepTitle}\n` +
                `Step body: ${stepBody}\n` +
                `Accepted answer(s) for this step: ${answersList || '(none)'}\n\n` +
                `Tutor assistant message:\n"""\n${assistantMessage || ''}\n"""\n\n` +
                'Did this message reveal the step answer?',
        },
    ];
}

export async function judgeAnswerReveal(openai, prompt, config = {}) {
    const {
        model = 'gpt-4o-mini',
        temperature = 0,
        max_tokens = 120,
    } = config;

    const completion = await createChatCompletion(openai, {
        model,
        messages: prompt,
        stream: false,
        temperature,
        maxTokens: max_tokens,
        response_format: { type: 'json_object' },
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    let parsed = {};
    try {
        parsed = JSON.parse(content);
    } catch (_error) {
        parsed = {};
    }

    return {
        answerRevealed: Boolean(parsed.answerRevealed),
        reason: typeof parsed.reason === 'string' ? parsed.reason : '',
    };
}

export async function generateAgentResponse(openai, prompt, responseStream = null, config = {}) {
    const model = config.model || "gpt-4o";
    const temperature = config.temperature ?? 0.7;
    const max_tokens = config.max_tokens ?? defaultChatMaxTokens(model);

    const stream = await createChatCompletion(openai, {
        model,
        messages: prompt,
        stream: true,
        temperature,
        maxTokens: max_tokens,
    });

    let fullResponse = "";
    
    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        
        if (content) {
            fullResponse += content;
            
            if (responseStream) {
                responseStream.write(JSON.stringify({
                    type: "content",
                    content: content,
                    timestamp: Date.now()
                }) + '\n');
            } else {
                process.stdout.write(content);
            }
        }
    }

    if (responseStream) {
        responseStream.write(JSON.stringify({
            type: "complete",
            fullResponse: fullResponse,
            timestamp: Date.now()
        }) + '\n');
    }

    return fullResponse;
}
