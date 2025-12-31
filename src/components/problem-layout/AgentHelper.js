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
    }

    /**
     * Initialize a new agent session
     * Creates unique session ID for conversation history tracking
     */
    initializeSession() {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return this.sessionId;
    }

    /**
     * Build request payload from Problem.js and ProblemCard.js
     */
    buildAgentRequest(userMessage, problemContext, studentState) {
        const request = {
            sessionId: this.sessionId,
            userMessage: userMessage,
            problemContext: problemContext,
            studentState: studentState,
            conversationHistory: []  // Lambda loads from DynamoDB
        };

        return request;
    }

    /**
     * Send message to AI Agent and handle streaming response
     * 
     * @param {string} userMessage - Student's question
     * @param {object} problemContext - Problem data from Problem.js
     * @param {object} studentState - Student state from Problem.js
     * @param {object} callbacks - { onChunkReceived, onSuccessfulCompletion, onError }
     */
    async sendMessage(userMessage, problemContext, studentState, callbacks = {}) {
        const {
            onChunkReceived = () => {},
            onSuccessfulCompletion = () => {},
            onError = () => {}
        } = callbacks;

        try {
            // Initialize session if needed
            if (!this.sessionId) {
                this.initializeSession();
            }

            // Validate endpoint
            if (!this.agentEndpoint) {
                throw new Error("AI Agent endpoint not configured. Set REACT_APP_AI_AGENT_URL in .env");
            }

            // Build request
            const agentRequest = this.buildAgentRequest(userMessage, problemContext, studentState);

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

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }

                // Decode chunk
                const chunk = decoder.decode(value, { stream: true });
                
                // Parse JSON chunks (Lambda sends newline-delimited JSON)
                const lines = chunk.split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        
                        if (data.type === 'content' && data.content) {
                            // Accumulate response
                            fullResponse += data.content;
                            
                            // Call chunk callback for real-time UI update
                            onChunkReceived(fullResponse);
                        } else if (data.type === 'complete') {
                            // Response complete
                        } else if (data.type === 'error') {
                            throw new Error(data.error || 'Unknown error from agent');
                        }
                    } catch (parseError) {
                        // Sometimes chunks split JSON, accumulate and try again
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
