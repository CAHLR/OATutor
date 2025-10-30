export function analyzeStudentState(studentState, problemContext) {
    const analysis = {
        strugglingWith: [],
        commonMistakes: [],
        suggestedApproach: "",
        confidenceLevel: "unknown"
    };

    if (studentState.attemptCount > 3) {
        analysis.strugglingWith.push("multiple_attempts");
        analysis.confidenceLevel = "low";
    }

    if (studentState.skillMastery) {
        const lowMasterySkills = Object.entries(studentState.skillMastery)
            .filter(([skill, level]) => level < 0.5)
            .map(([skill]) => skill);
        
        if (lowMasterySkills.length > 0) {
            analysis.strugglingWith.push(...lowMasterySkills);
        }
    }

    if (studentState.currentAnswer) {
        const answer = studentState.currentAnswer.toLowerCase();
        
        if (answer.includes("x + x + x") && problemContext.currentStep?.correctAnswer?.includes("x + (x+1) + (x+2)")) {
            analysis.commonMistakes.push("consecutive_integers_concept");
            analysis.suggestedApproach = "explain_consecutive_integers";
        }
        
        if (answer.includes("=") && !answer.includes("x")) {
            analysis.commonMistakes.push("missing_variable_setup");
            analysis.suggestedApproach = "guide_variable_identification";
        }
    }

    return analysis;
}

export function buildAgentPrompt({ userMessage, problemContext, studentState, studentAnalysis, conversationHistory, agentConfig }) {
    const teachingStyle = agentConfig?.teachingStyle || "socratic";
    const personalityMode = agentConfig?.personalityMode || "encouraging";
    const maxHintLevel = agentConfig?.maxHintLevel || 4;

    const systemPrompt = `You are an expert math tutor and Teaching Assistant (TA) helping a student with OATutor problems. 

STUDENT CONTEXT:
- Name: ${studentState.user?.full_name || 'Student'}
- Course: ${problemContext.courseName || 'Math'}
- Current Problem: ${problemContext.problemTitle || 'Math Problem'}
- Current Step: ${problemContext.currentStep?.title || 'Problem Step'}

PROBLEM DETAILS:
- Problem: ${problemContext.problemTitle}
- Question: ${problemContext.currentStep?.body || 'No question provided'}
- Correct Answer: ${problemContext.currentStep?.correctAnswer || 'Not provided'}
- Answer Type: ${problemContext.currentStep?.answerType || 'unknown'}

STUDENT'S CURRENT STATE:
- Their Answer: "${studentState.currentAnswer || 'No answer yet'}"
- Correctness: ${studentState.isCorrect === null ? 'Not attempted' : studentState.isCorrect ? 'Correct' : 'Incorrect'}
- Attempt #: ${studentState.attemptCount || 0}
- Time on step: ${studentState.timeOnStep || 0} seconds
- Hints used: ${studentState.hintsUsed?.length || 0}

STUDENT'S SKILL LEVELS:
${studentState.skillMastery ? Object.entries(studentState.skillMastery)
    .map(([skill, level]) => `- ${skill}: ${(level * 100).toFixed(0)}% mastery`)
    .join('\n') : 'No mastery data available'}

ANALYSIS OF STUDENT'S STRUGGLES:
${studentAnalysis.strugglingWith.length > 0 ? `- Areas of difficulty: ${studentAnalysis.strugglingWith.join(', ')}` : '- No specific struggles identified'}
${studentAnalysis.commonMistakes.length > 0 ? `- Common mistakes: ${studentAnalysis.commonMistakes.join(', ')}` : ''}
${studentAnalysis.suggestedApproach ? `- Suggested approach: ${studentAnalysis.suggestedApproach}` : ''}

YOUR TEACHING APPROACH:
- Method: ${teachingStyle} (ask guiding questions, help student discover answers)
- Personality: ${personalityMode} (be supportive and patient)
- Max hint level: ${maxHintLevel}/5 (1=very subtle, 5=direct answer)
- Role: Act like a helpful TA who walks students through problems step-by-step

CONVERSATION HISTORY:
${conversationHistory.length > 0 ? conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n') : 'This is the start of our conversation.'}

INSTRUCTIONS:
1. Respond as a helpful TA who knows the student's context
2. Use the Socratic method - ask questions to guide discovery
3. Be encouraging and patient
4. Don't give direct answers immediately - help them work through it
5. Reference their specific problem and current step
6. If they're stuck, break the problem into smaller parts
7. Acknowledge their progress and effort

Remember: You're helping them learn, not just get the answer. Guide them to understand the concepts!`;

    return [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
    ];
}

export async function generateAgentResponse(openai, prompt, responseStream = null) {
    const stream = await openai.chat.completions.create({
        model: "gpt-4",
        messages: prompt,
        stream: true,
        temperature: 0.7,
        max_tokens: 500
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