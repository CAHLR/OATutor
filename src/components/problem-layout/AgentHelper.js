/**
 * AgentHelper.js
 * 
 * Manages communication between frontend and AWS Lambda AI Agent
 * - Session management
 * - Request building with real component data
 * - Streaming response handling
 */

import {
    DEFAULT_CHAT_PENALTY_MODE,
    DEFAULT_HINT_PENALTY_MODE,
} from '../../util/helpPenaltyMode.js';
import { DEFAULT_CHAT_MODEL, resolveChatModel } from '../../util/chatModel.js';
import { isFullChatLesson, resolveFullChatPrompt } from '../../util/officeHours.js';
import { boundedLegacyHistory } from '../../util/chatHistory.js';

export class AgentHelper {
    constructor() {
        // AWS Lambda Function URL from environment
        this.agentEndpoint = process.env.REACT_APP_AI_AGENT_URL || "";
        this.sessionId = null;
        this.turnId = 0;
        // True until Problem/AgentChatbox writes the chatSessions create payload once.
        // Prevents remounts from merge-writing messageCount*: 0 over live counters.
        this._needsSessionMetaWrite = false;
    }

    /**
     * Initialize a new agent session
     * Creates unique session ID for conversation history tracking
     */
    initializeSession() {
        this.cancelMessage();
        const random = new Uint32Array(4);
        window.crypto.getRandomValues(random);
        this.sessionId = `session_${Array.from(random, (value) => value.toString(16).padStart(8, '0')).join('')}`;
        this.turnId = 0;
        this._needsSessionMetaWrite = true;
        this.serverOwnsHistory = false;
        this.pendingRequest = null;
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

    /** Whether chatSessions create metadata still needs to be written for this sessionId. */
    needsSessionMetaWrite() {
        return Boolean(this.sessionId && this._needsSessionMetaWrite);
    }

    markSessionMetaWritten() {
        this._needsSessionMetaWrite = false;
    }

    /**
     * Shared chatSessions create payload (lesson config + counters).
     * Callers supply app/context fields (user ids, treatment, etc.).
     */
    buildChatSessionCreatePayload({
        sessionId,
        lesson = null,
        oats_user_id = null,
        lms_user_id = null,
        course_id = null,
        course_name = null,
        course_code = null,
        semester = null,
        treatment = null,
        siteVersion = null,
        siteCommitHash = null,
        hintPenaltyMode = null,
        chatPenaltyMode = null,
    } = {}) {
        const chatDisplayMode = lesson?.chat_display_mode || 'Off';
        const condition =
            chatDisplayMode === 'Window' ? 'window'
            : chatDisplayMode === 'Avatar' ? 'avatar'
            : chatDisplayMode === 'Full' ? 'full'
            : 'off';
        const now = Date.now();
        return {
            sessionId: sessionId || this.sessionId,
            oats_user_id,
            lms_user_id,
            course_id,
            course_name: course_name ?? lesson?.courseName ?? null,
            course_code,
            semester,
            treatment,
            siteVersion,
            siteCommitHash,
            lessonId: lesson?.id || null,
            chatDisplayMode,
            condition,
            chatPrompt: isFullChatLesson(lesson)
                ? resolveFullChatPrompt(lesson)
                : (lesson?.chat_prompt || 'PROMPTv2b.txt'),
            chatModel: resolveChatModel(lesson),
            hintPenaltyMode: hintPenaltyMode || DEFAULT_HINT_PENALTY_MODE,
            chatPenaltyMode: chatPenaltyMode || DEFAULT_CHAT_PENALTY_MODE,
            startedAt: now,
            lastActivityAt: now,
            greetingShown: false,
            firstActionType: null,
            firstActionTimestampMs: null,
            chatOpenCount: 0,
            chatCloseCount: 0,
            hintOpenCount: 0,
            hintCloseCount: 0,
            messageCountUser: 0,
            messageCountAssistant: 0,
            errorCount: 0,
            clearedCount: 0,
        };
    }

    /**
     * Build request payload from Problem.js and ProblemCard.js
     * @param {Array<{role: string, content: string}>} conversationHistory
     *   Prior turns only (exclude the current userMessage — Lambda appends it).
     */
    buildAgentRequest(userMessage, problemContext, studentState, extracted, chatPrompt, chatDisplayMode, conversationHistory = [], chatPenaltyMode = DEFAULT_CHAT_PENALTY_MODE, chatModel = DEFAULT_CHAT_MODEL) {
        const safeUserMessage = typeof userMessage === 'string' ? userMessage : '';
        const request = {
            sessionId: this.sessionId,
            turnId: this.turnId,
            userMessage: safeUserMessage,
            lessonId: extracted?.lessonId || null,
            problemContext: problemContext,
            studentState: studentState,
            extracted: extracted || {},
            chatPrompt: chatPrompt || 'PROMPTv2b.txt',
            chatDisplayMode: chatDisplayMode || 'Off',
            chatPenaltyMode: chatPenaltyMode || DEFAULT_CHAT_PENALTY_MODE,
            chatModel: chatModel || DEFAULT_CHAT_MODEL,
            memoryVersion: 1,
            requestId: `${this.sessionId}_${this.turnId}`,
            // Bounded bootstrap for deployment compatibility; stop sending after acknowledgment.
            conversationHistory: this.serverOwnsHistory ? [] : boundedLegacyHistory(conversationHistory),
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
    async sendMessage(userMessage, problemContext, studentState, extracted = {}, chatPrompt = 'PROMPTv2b.txt', chatDisplayMode = 'Off', chatPenaltyMode = DEFAULT_CHAT_PENALTY_MODE, callbacks = {}, conversationHistory = [], chatModel = DEFAULT_CHAT_MODEL) {
        const {
            onTurnStarted = () => {},
            onChunkReceived = () => {},
            onSuccessfulCompletion = () => {},
            onHistoryCommitted = () => {},
            onError = () => {}
        } = callbacks;
        let controller;
        let reader;

        try {
            // Initialize session if needed
            if (!this.sessionId) {
                this.initializeSession();
            }
            this.turnId += 1;

            // Validate endpoint
            if (!this.agentEndpoint) {
                throw new Error("AI Agent endpoint not configured. Set REACT_APP_AI_AGENT_URL in .env");
            }

            // Build request
            const agentRequest = this.buildAgentRequest(
                userMessage,
                problemContext,
                studentState,
                extracted,
                chatPrompt,
                chatDisplayMode,
                conversationHistory,
                chatPenaltyMode,
                chatModel
            );
            const requestSessionId = this.sessionId;
            const identity = JSON.stringify([userMessage, extracted?.lessonId,
                problemContext?.problemID, problemContext?.currentStep?.id]);
            if (this.pendingRequest?.identity === identity) {
                agentRequest.requestId = this.pendingRequest.requestId;
            }
            this.pendingRequest = { identity, requestId: agentRequest.requestId };
            onTurnStarted(this.turnId);
            controller = new AbortController();
            this.controller = controller;

            // Send POST request with streaming
            const response = await fetch(this.agentEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(agentRequest),
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Handle streaming response
            reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            let lineBuffer = '';
            let completion = null;
            let lastPaint = 0;

            const processStreamLine = (line) => {
                const trimmed = line.trim();
                if (!trimmed) {
                    return;
                }

                const data = JSON.parse(trimmed);

                if (data.type === 'content' && data.content) {
                    fullResponse += data.content;
                    if (fullResponse.length > 16_000) throw new Error('Reply exceeds the size limit');
                    if (Date.now() - lastPaint >= 50) {
                        lastPaint = Date.now();
                        onChunkReceived(fullResponse);
                    }
                } else if (data.type === 'complete') {
                    completion = data;
                    if (!fullResponse && typeof data.fullResponse === 'string' && data.fullResponse) {
                        if (data.fullResponse.length > 16_000) throw new Error('Reply exceeds the size limit');
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
                if (lineBuffer.length > 100_000) throw new Error('Invalid oversized stream record');
                const lines = lineBuffer.split('\n');
                lineBuffer = lines.pop() || '';

                for (const line of lines) {
                    processStreamLine(line);
                }
            }

            lineBuffer += decoder.decode();
            if (lineBuffer.trim()) {
                processStreamLine(lineBuffer);
            }

            if (!completion) throw new Error('Reply was interrupted. Please try again.');
            if (requestSessionId !== this.sessionId) throw new Error('Chat session changed');
            this.pendingRequest = null;
            if (completion.memoryVersion === 1) {
                this.serverOwnsHistory = true;
                onHistoryCommitted(completion);
            }
            onSuccessfulCompletion(fullResponse);
            return fullResponse;

        } catch (error) {
            onError(error);
            throw error;
        } finally {
            controller?.abort();
            reader?.releaseLock?.();
            if (this.controller === controller) this.controller = null;
        }
    }

    /**
     * Fetch short suggested questions for the current problem context.
     * This is intentionally separate from chat turns so it does not mutate
     * conversation history or advance the visible chat transcript.
     */
    async fetchSuggestedQuestions(problemContext, studentState, extracted = {}, chatPrompt = 'PROMPTv2b.txt', chatDisplayMode = 'Off', chatPenaltyMode = DEFAULT_CHAT_PENALTY_MODE, chatModel = DEFAULT_CHAT_MODEL) {
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
                chatPrompt: chatPrompt || 'PROMPTv2b.txt',
                chatDisplayMode: chatDisplayMode || 'Off',
                chatPenaltyMode: chatPenaltyMode || DEFAULT_CHAT_PENALTY_MODE,
                chatModel: chatModel || DEFAULT_CHAT_MODEL,
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
     * Ask an SLM whether an assistant message revealed the step answer.
     * Used for chat_penalty_mode === "AnswerReveal".
     */
    async judgeAnswerReveal({
        assistantMessage,
        stepAnswers = [],
        problemContext = {},
        stepId = null,
        chatPrompt = 'PROMPTv2b.txt',
        chatDisplayMode = 'Off',
        chatPenaltyMode = DEFAULT_CHAT_PENALTY_MODE,
        chatModel = DEFAULT_CHAT_MODEL,
        lessonId = null,
        condition = null,
    } = {}) {
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
                requestType: 'judgeAnswerReveal',
                sessionId: this.sessionId,
                assistantMessage,
                stepAnswers,
                problemContext,
                stepId,
                chatPrompt: chatPrompt || 'PROMPTv2b.txt',
                chatDisplayMode: chatDisplayMode || 'Off',
                chatPenaltyMode: chatPenaltyMode || DEFAULT_CHAT_PENALTY_MODE,
                chatModel: chatModel || DEFAULT_CHAT_MODEL,
                lessonId,
                condition,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());

        for (const line of lines) {
            const data = JSON.parse(line);
            if (data.type === 'judgeAnswerReveal') {
                return {
                    answerRevealed: Boolean(data.answerRevealed),
                    reason: data.reason || '',
                };
            }
            if (data.type === 'error') {
                throw new Error(data.error || 'Unknown answer-reveal judge error');
            }
        }

        return { answerRevealed: false, reason: 'no_judge_result' };
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
        this.cancelMessage();
        this.sessionId = null;
        this.serverOwnsHistory = false;
        this.pendingRequest = null;
        this._needsSessionMetaWrite = false;
    }

    cancelMessage() {
        this.controller?.abort();
        this.controller = null;
    }

    async fetchHistory(beforeSequence = null, signal = undefined) {
        const response = await fetch(this.agentEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestType: 'chatHistory', sessionId: this.sessionId, beforeSequence }),
            signal,
        });
        if (!response.ok) throw new Error('Unable to load chat history');
        const result = JSON.parse(await response.text());
        if (result.type !== 'chatHistory') throw new Error(result.error || 'Unable to load chat history');
        return result;
    }
}

// Export singleton instance
export const agentHelper = new AgentHelper();
