import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const DEFAULT_CHAT_PROMPT = 'PROMPTv2.txt';

// Temporarily disabled for prompt A/B testing (seminar demos).
// Re-enable before production to restrict Lambda to known prompt files.
// const ALLOWED_CHAT_PROMPTS = new Set([
//     'PROMPTv1.txt',
//     'PROMPTv2.txt',
// ]);

const promptTemplateCache = new Map();

function resolveChatPromptFile(chatPrompt) {
    const name = String(chatPrompt || DEFAULT_CHAT_PROMPT).trim();
    // if (!ALLOWED_CHAT_PROMPTS.has(name)) {
    //     return DEFAULT_CHAT_PROMPT;
    // }
    return name;
}

export function loadPromptTemplate(chatPrompt) {
    const file = resolveChatPromptFile(chatPrompt);
    if (promptTemplateCache.has(file)) {
        return { template: promptTemplateCache.get(file), file };
    }
    const template = readFileSync(join(__dirname, file), 'utf-8');
    promptTemplateCache.set(file, template);
    return { template, file };
}

export function buildAgentPrompt({ userMessage, problemContext, studentState, conversationHistory, extracted = {}, chatPrompt }) {
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

    // Build message array with conversation history
    const messages = [
        { role: "system", content: systemPrompt }
    ];

    // Add conversation history if it exists
    if (conversationHistory && conversationHistory.length > 0) {
        messages.push(...conversationHistory);
    }

    // Build the last user message.
    // If the problem has figures (sent as base64 data URLs from the browser), attach them
    // as multimodal image_url parts so the vision model can see them.
    const images = Array.isArray(extracted?.images) ? extracted.images : [];
    if (images.length > 0) {
        const parts = [{ type: "text", text: safeUserMessage }];
        for (const img of images) {
            parts.push({ type: "image_url", image_url: { url: img, detail: "auto" } });
        }
        messages.push({ role: "user", content: parts });
    } else {
        messages.push({ role: "user", content: safeUserMessage });
    }

    return messages;
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

    const completion = await openai.chat.completions.create({
        model,
        messages: prompt,
        stream: false,
        temperature,
        max_tokens,
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

export async function generateAgentResponse(openai, prompt, responseStream = null, config = {}) {
    const {
        model = "gpt-4o",
        temperature = 0.7,
        max_tokens = 800  
    } = config;

    const stream = await openai.chat.completions.create({
        model,
        messages: prompt,
        stream: true,
        temperature,
        max_tokens
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
