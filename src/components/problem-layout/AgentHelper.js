/**
 * Helper class for integrating with the AI Agent
 * Handles data collection, API calls, and response processing
 */
export class AgentHelper {
    constructor() {
        // Replace with your actual Lambda Function URL
        this.agentEndpoint = process.env.REACT_APP_AI_AGENT_URL || "https://your-lambda-function-url.lambda-url.us-west-1.on.aws/";
        this.sessionId = null;
        this.conversationHistory = [];
        
        // Enable detailed logging
        console.log("🤖 AgentHelper initialized with endpoint:", this.agentEndpoint);
        console.log("🤖 Environment check - REACT_APP_AI_AGENT_URL:", process.env.REACT_APP_AI_AGENT_URL);
    }

    /**
     * Initialize a new agent session
     */
    initializeSession() {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.conversationHistory = [];
        console.log("🤖 Agent session initialized:", this.sessionId);
    }

    /**
     * Build rich context data for the agent
     */
    buildAgentRequest(userMessage, problemContext, studentState) {
        return {
            sessionId: this.sessionId,
            messageType: "chat",
            userMessage: userMessage,

            problemContext: {
                problemID: problemContext.problemID,
                lessonID: problemContext.lessonID,
                courseName: problemContext.courseName,
                problemTitle: problemContext.problemTitle,
                problemBody: problemContext.problemBody,

                currentStep: {
                    id: problemContext.currentStep?.id,
                    title: problemContext.currentStep?.title,
                    body: problemContext.currentStep?.body,
                    answerType: problemContext.currentStep?.answerType,
                    problemType: problemContext.currentStep?.problemType,
                    correctAnswer: problemContext.currentStep?.correctAnswer,
                    precision: problemContext.currentStep?.precision,
                    choices: problemContext.currentStep?.choices,
                    knowledgeComponents: problemContext.currentStep?.knowledgeComponents
                },

                variables: problemContext.variables || {},
                seed: problemContext.seed
            },

            studentState: {
                currentAnswer: studentState.currentAnswer || "",
                isCorrect: studentState.isCorrect,
                attemptCount: studentState.attemptCount || 0,
                hintsUsed: studentState.hintsUsed || [],
                timeOnStep: studentState.timeOnStep || 0,
                stepsCompleted: studentState.stepsCompleted || [],
                problemsCompleted: studentState.problemsCompleted || [],

                skillMastery: studentState.skillMastery || {},

                user: {
                    user_id: studentState.user?.user_id,
                    full_name: studentState.user?.full_name,
                    course_name: studentState.user?.course_name,
                    course_id: studentState.user?.course_id
                }
            },

            conversationHistory: this.conversationHistory,

            agentConfig: {
                teachingStyle: "socratic",
                personalityMode: "encouraging",
                maxHintLevel: 4,
                allowBottomOut: true
            },

            timestamp: Date.now(),
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }

    /**
     * Send message to AI Agent and handle streaming response
     */
    async sendMessage(userMessage, problemContext, studentState, callbacks = {}) {
        const {
            onChunkReceived = () => { },
            onSuccessfulCompletion = () => { },
            onError = () => { }
        } = callbacks;

        try {
            // Initialize session if needed
            if (!this.sessionId) {
                this.initializeSession();
            }

            // Build request
            const agentRequest = this.buildAgentRequest(userMessage, problemContext, studentState);

            console.log("🤖 Sending request to AI Agent:", this.agentEndpoint);
            console.log("🤖 Request payload:", JSON.stringify(agentRequest, null, 2));

            // Send request to Lambda Function URL
            console.log("🤖 Making fetch request...");
            const response = await fetch(this.agentEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify(agentRequest),
            });

            console.log("🤖 Response status:", response.status);
            console.log("🤖 Response headers:", Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error("🤖 Response error text:", errorText);
                throw new Error(`Agent request failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            // Handle streaming response
            console.log("🤖 Starting to read streaming response...");
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log("🤖 Stream reading complete");
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                console.log("🤖 Received chunk:", chunk);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    console.log("🤖 Processing line:", line);
                    try {
                        const data = JSON.parse(line);
                        console.log("🤖 Parsed data:", data);

                        if (data.type === "content") {
                            fullResponse += data.content;
                            onChunkReceived(fullResponse);
                        } else if (data.type === "complete") {
                            console.log("🤖 Response complete:", data.fullResponse);
                            // Update conversation history
                            this.conversationHistory.push({
                                role: "user",
                                content: userMessage,
                                timestamp: Date.now()
                            });
                            this.conversationHistory.push({
                                role: "assistant",
                                content: data.fullResponse,
                                timestamp: Date.now()
                            });

                            onSuccessfulCompletion(data.fullResponse);
                        } else if (data.type === "error") {
                            console.error("🤖 Agent returned error:", data.error);
                            throw new Error(data.error);
                        }
                    } catch (parseError) {
                        console.warn("🤖 Failed to parse agent response chunk:", parseError, "Raw line:", line);
                    }
                }
            }

        } catch (error) {
            console.error("🤖 Agent communication error:", error);
            console.error("🤖 Error stack:", error.stack);
            onError(error);
        }
    }

    /**
     * Get conversation history
     */
    getConversationHistory() {
        return this.conversationHistory;
    }

    /**
     * Clear conversation history
     */
    clearConversation() {
        this.conversationHistory = [];
        this.sessionId = null;
    }

    /**
     * Get current session ID
     */
    getSessionId() {
        return this.sessionId;
    }
}

// Export singleton instance
export const agentHelper = new AgentHelper();
