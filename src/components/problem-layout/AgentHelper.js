/**
 * AgentHelper.js
 * 
 * Manages communication between frontend and AWS Lambda AI Agent
 * - Session management
 * - Request building with real component data
 * - Streaming response handling
 */

export class AgentHelper {
    constructor() {
        // AWS Lambda Function URL from environment
        this.agentEndpoint = process.env.REACT_APP_AI_AGENT_URL || "";
        this.sessionId = null;
        this.turnId = 0;
    }

    /**
     * Initialize a new agent session
     * Creates unique session ID for conversation history tracking
     */
    initializeSession() {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.turnId = 0;
        return this.sessionId;
    }

    /**
     * Initialize a session only if one does not already exist.
     * Safe to call from multiple components (Problem.js + AgentChatbox.js).
     */
    initSessionIfNeeded() {
        if (!this.sessionId) {
            return this.initializeSession();
        }
        return this.sessionId;
    }

    /**
     * Build request payload from Problem.js and ProblemCard.js
     */
    buildAgentRequest(userMessage, problemContext, studentState, extracted, chatPrompt, chatDisplayMode) {
        const safeUserMessage = typeof userMessage === 'string' ? userMessage : '';
        const request = {
            sessionId: this.sessionId,
            turnId: this.turnId,
            userMessage: safeUserMessage,
            problemContext: problemContext,
            studentState: studentState,
            extracted: extracted || {},
            chatPrompt: chatPrompt || 'PROMPTv2.txt',
            chatDisplayMode: chatDisplayMode || 'Off',
            conversationHistory: []  // Lambda loads from DynamoDB
        };

        return request;
    }

    getTurnId() {
        return this.turnId;
    }

    /**
     * Minimal client lifecycle logging. Ships a compact event payload to the
     * same Lambda URL (handled server-side as a log-only request).
     */
    async logEvent(eventType, payload = {}) {
        if (!this.agentEndpoint) return;
        if (!this.sessionId) this.initializeSession();
        try {
            await fetch(this.agentEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType,
                    sessionId: this.sessionId,
                    turnId: this.turnId,
                    ...payload,
                }),
            });
        } catch (_e) {
            // Logging should never break the UX.
        }
    }

    /**
     * Send message to AI Agent and handle streaming response
     * 
     * @param {string} userMessage - Student's question
     * @param {object} problemContext - Problem data from Problem.js
     * @param {object} studentState - Student state from Problem.js
     * @param {object} extracted - Optional extracted input (e.g., { text, images }) for vision
     * @param {object} callbacks - { onChunkReceived, onSuccessfulCompletion, onError }
     */
    async sendMessage(userMessage, problemContext, studentState, extracted = {}, chatPrompt = 'PROMPTv2.txt', chatDisplayMode = 'Off', callbacks = {}) {
        const {
            onTurnStarted = () => {},
            onChunkReceived = () => {},
            onSuccessfulCompletion = () => {},
            onError = () => {}
        } = callbacks;

        try {
            // Initialize session if needed
            if (!this.sessionId) {
                this.initializeSession();
            }
            this.turnId += 1;
            onTurnStarted(this.turnId);

            // Validate endpoint
            if (!this.agentEndpoint) {
                throw new Error("AI Agent endpoint not configured. Set REACT_APP_AI_AGENT_URL in .env");
            }

            // Build request
            const agentRequest = this.buildAgentRequest(userMessage, problemContext, studentState, extracted, chatPrompt, chatDisplayMode);

            // Send POST request with streaming
            const response = await fetch(this.agentEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(agentRequest)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            let lineBuffer = '';

            const processStreamLine = (line) => {
                const trimmed = line.trim();
                if (!trimmed) {
                    return;
                }

                const data = JSON.parse(trimmed);

                if (data.type === 'content' && data.content) {
                    fullResponse += data.content;
                    onChunkReceived(fullResponse);
                } else if (data.type === 'complete') {
                    if (!fullResponse && typeof data.fullResponse === 'string' && data.fullResponse) {
                        fullResponse = data.fullResponse;
                        onChunkReceived(fullResponse);
                    }
                } else if (data.type === 'error') {
                    throw new Error(data.error || 'Unknown error from agent');
                }
            };

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }

                lineBuffer += decoder.decode(value, { stream: true });
                const lines = lineBuffer.split('\n');
                lineBuffer = lines.pop() || '';

                for (const line of lines) {
                    try {
                        processStreamLine(line);
                    } catch (parseError) {
                        if (parseError instanceof SyntaxError) {
                            continue;
                        }
                        throw parseError;
                    }
                }
            }

            lineBuffer += decoder.decode();
            if (lineBuffer.trim()) {
                try {
                    processStreamLine(lineBuffer);
                } catch (parseError) {
                    if (!(parseError instanceof SyntaxError)) {
                        throw parseError;
                    }
                }
            }

            // Call completion callback
            onSuccessfulCompletion(fullResponse);
            return fullResponse;

        } catch (error) {
            onError(error);
            throw error;
        }
    }

    /**
     * Fetch short suggested questions for the current problem context.
     * This is intentionally separate from chat turns so it does not mutate
     * conversation history or advance the visible chat transcript.
     */
    async fetchSuggestedQuestions(problemContext, studentState, extracted = {}, chatPrompt = 'PROMPTv2.txt', chatDisplayMode = 'Off') {
        if (!this.sessionId) {
            this.initializeSession();
        }

        if (!this.agentEndpoint) {
            throw new Error("AI Agent endpoint not configured. Set REACT_APP_AI_AGENT_URL in .env");
        }

        const response = await fetch(this.agentEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requestType: 'suggestedQuestions',
                sessionId: this.sessionId,
                problemContext,
                studentState,
                extracted,
                chatPrompt: chatPrompt || 'PROMPTv2.txt',
                chatDisplayMode: chatDisplayMode || 'Off',
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());

        for (const line of lines) {
            const data = JSON.parse(line);
            if (data.type === 'suggestions') {
                return Array.isArray(data.questions) ? data.questions : [];
            }
            if (data.type === 'error') {
                throw new Error(data.error || 'Unknown suggestions error');
            }
        }

        return [];
    }

    /**
     * Get current session ID
     */
    getSessionId() {
        return this.sessionId;
    }

    /**
     * Clear session (for starting fresh)
     */
    clearSession() {
        this.sessionId = null;
    }
}

// Export singleton instance
export const agentHelper = new AgentHelper();
