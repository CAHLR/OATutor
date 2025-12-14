
export function buildAgentPrompt({ userMessage, problemContext, studentState, conversationHistory }) {
    const skillMasteryText = studentState.skillMastery && Object.keys(studentState.skillMastery).length > 0
        ? Object.entries(studentState.skillMastery)
            .map(([skill, level]) => `- ${skill}: ${(level * 100).toFixed(0)}% mastery`)
            .join('\n')
        : 'No skill mastery data available for this step';

    // Format hints used
    const hintsText = studentState.hintsUsed?.length > 0 
        ? `${studentState.hintsUsed.length} hint(s) viewed` 
        : 'No hints viewed yet';

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

    const systemPrompt = `You are an expert math tutor helping a student with an OATutor problem.

PROBLEM CONTEXT:
Course: ${problemContext.courseName || 'Math'}
Problem: ${problemContext.problemTitle || 'Math Problem'}

CURRENT STEP:
Question: ${problemContext.currentStep?.title || 'Problem Step'}
${problemContext.currentStep?.body ? `Details: ${problemContext.currentStep.body}` : ''}

Correct Answer: ${Array.isArray(problemContext.currentStep?.correctAnswer) 
    ? problemContext.currentStep.correctAnswer[0] 
    : problemContext.currentStep?.correctAnswer || 'Not provided'}

STUDENT'S CURRENT STATE:
Their Answer: "${studentState.currentAnswer || 'No answer provided yet'}"
Status: ${correctnessText}
Hints: ${hintsText}

ATTEMPT HISTORY (all questions in this problem):
${attemptHistoryText}

RELEVANT SKILL LEVELS FOR THIS PROBLEM:
${skillMasteryText}

CRITICAL RULES - YOU MUST FOLLOW THESE:
- NEVER reveal the final answer, even if asked directly
- NEVER complete the final calculation - always ask them to do it
- Guide them to the last step, then prompt: "What do you get?" or "Can you calculate that?"
- If asked to "walk through it", break it into steps but Stop ONE step before the final answer - let THEM do the last calculation

TEACHING GUIDELINES:
- Use the Socratic method - ask guiding questions
- Help them discover the answer, don't just give it
- Be encouraging and patient
- If you know their answer, reference it and where they might have gone wrong
- If you don't know their answer, ask them what they got or what they're confused about
- Break problems into smaller steps when needed
- Acknowledge their effort and progress
- Use the attempt history to understand what mistakes they've made before

NOTE: If "Their Answer" shows "No answer provided yet", ask the student what they tried or what they're stuck on.

Student asks: "${userMessage}"

Provide helpful, step-by-step guidance.`;

    // Build message array with conversation history
    const messages = [
        { role: "system", content: systemPrompt }
    ];

    // Add conversation history if it exists
    if (conversationHistory && conversationHistory.length > 0) {
        messages.push(...conversationHistory);
    }

    // Add current user message
    messages.push({ role: "user", content: userMessage });

    return messages;
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