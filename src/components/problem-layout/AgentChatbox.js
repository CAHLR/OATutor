import React from 'react';
import { CONTENT_SOURCE } from '@common/global-config';
import { agentHelper } from './AgentHelper';
import MessageRenderer from './MessageRenderer';
import { withStyles } from '@material-ui/core/styles';
import {
    Card,
    TextField,
    Typography,
    Paper,
    IconButton,
    CircularProgress
} from '@material-ui/core';
import {
    Close as CloseIcon,
    Delete as DeleteIcon
} from '@material-ui/icons';

// UC Berkeley brand palette — sourced from the official identity guidelines.
// Used consistently across the chat surface so the tutor visually belongs to
// the institution rather than reading as a generic SaaS chatbot.
const BERKELEY = {
    blue: '#002676',       // Berkeley Blue (primary)
    blueDark: '#010133',   // Blue Dark (gradient depth, hover states)
    gold: '#FDB515',       // California Gold (primary accent — Oski's halo)
    goldDark: '#FC9313',   // Gold Dark (hover on gold surfaces)
    white: '#FFFFFF',
    grayLight: '#F2F2F2',
};

// Public path to the Oski mascot. The image lives in /public so webpack
// serves it directly; PUBLIC_URL handles the GitHub Pages subpath in prod.
const OSKI_SRC = `${process.env.PUBLIC_URL || ''}/static/images/icons/oski1.png`;
const SEND_ICON_SRC = `${process.env.PUBLIC_URL || ''}/static/images/icons/send.png`;

const styles = (theme) => ({
    chatContainer: {
        position: 'fixed',
        bottom: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        zIndex: 1000,
        borderRadius: 12,
        overflow: 'hidden',
        minWidth: 300,
        minHeight: 400,
        maxWidth: '95vw',
        maxHeight: '90vh',
        fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    chatHeader: {
        background: 'linear-gradient(135deg, #002676 0%, #010133 100%)',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '3px solid #FDB515', // gold underline ties header to avatar
    },
    chatTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontWeight: 600
    },
    chatMessages: {
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px',
        backgroundColor: '#F2F2F2',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
    },
    message: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        width: '100%'
    },
    userMessage: {
        alignItems: 'flex-end'
    },
    assistantMessage: {
        alignItems: 'stretch',
        marginTop: 8
    },
    messageBubble: {
        padding: '10px 14px',
        borderRadius: 16,
        maxWidth: '75%',
        wordWrap: 'break-word'
    },
    userBubble: {
        backgroundColor: '#002676',
        color: 'white'
    },
    assistantBubble: {
        backgroundColor: 'white',
        color: '#333'
    },
    assistantContent: {
        width: '100%',
        maxWidth: '100%',
        wordWrap: 'break-word'
    },
    messageMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingLeft: 8,
        paddingRight: 8
    },
    chatInput: {
        padding: 16,
        backgroundColor: 'white',
        borderTop: '1px solid #e0e0e0'
    },
    inputContainer: {
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end'
    },
    messageInput: {
        flex: 1,
        '& .MuiOutlinedInput-root': {
            borderRadius: 20
        }
    },
    sendButton: {
        minWidth: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: '#E6E6E6',
        color: '#111',
        border: '1px solid rgba(0,0,0,0.10)',
        '&:hover': {
            backgroundColor: '#DADADA'
        },
        '&:disabled': {
            backgroundColor: '#F2F2F2',
            opacity: 0.6,
        }
    },
    sendIconImg: {
        width: 20,
        height: 20,
        display: 'block',
        opacity: 0.9,
    },
    toggleButton: {
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1001,
        backgroundColor: BERKELEY.white,
        color: 'white',
        '&:hover': {
            backgroundColor: BERKELEY.grayLight,
        },
        width: 60,
        height: 60,
        padding: 0,
        boxShadow: '0 4px 14px rgba(0, 38, 118, 0.28)',
        border: `2px solid ${BERKELEY.blue}`,
    },
    toggleAvatarImg: {
        width: 54,
        height: 54,
        borderRadius: '50%',
        objectFit: 'contain',
        display: 'block',
    },
    resizeHandle: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 20,
        height: 20,
        cursor: 'nwse-resize',
        zIndex: 10,
    }
});

class AgentChatbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: false,
            messages: [],
            currentMessage: '',
            isTyping: false,
            isGenerating: false,
            agentSessionId: null,
            chatWidth: 400,
            chatHeight: 600,
            isResizing: false
        };
        this.messagesEndRef = React.createRef();
        this.chatContainerRef = React.createRef();
    }

    componentDidMount() {
        agentHelper.initializeSession();
        this.setState({ agentSessionId: agentHelper.getSessionId() });
    }

    componentDidUpdate(prevProps, prevState) {
        const currentProblemID = this.props.problem?.id;
        const prevProblemID = prevProps.problem?.id;
        
        if (currentProblemID && prevProblemID && currentProblemID !== prevProblemID) {
            this.clearConversation();
        }
        
        // Only scroll when a new message is added, not when content is updated
        if (this.state.messages.length > prevState.messages.length) {
            this.scrollToBottom();
        }
    }
    
    scrollToBottom = () => {
        if (this.messagesEndRef.current) {
            const messagesContainer = this.messagesEndRef.current.parentElement;
            if (messagesContainer) {
                // Check if user is already near the bottom (within 100px threshold)
                const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100;
                
                // Only auto-scroll if user hasn't manually scrolled up
                if (isNearBottom) {
                    this.messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
                }
            }
        }
    };

    // Build a one-shot greeting from the current problem context. Returned as
    // an array so callers can splice it into `messages`. Kept agent-free
    // (purely client-side, no LLM call) — the goal is just to invite the
    // student to drive the conversation per the open-inquiry research finding,
    // not to make a contextual diagnosis.
    buildGreetingMessages = () => {
        const title = this.props.problem?.title;
        const subject = title ? `**${title}**` : 'this problem';
        return [{
            id: `greeting-${Date.now()}`,
            role: 'assistant',
            content: `Hello! I'm Oski, your AI tutor. I'm here to think through ${subject} with you — feel free to ask me anything, or tell me where you're stuck.`,
            timestamp: Date.now(),
            isGenerating: false,
        }];
    };

    toggleChat = () => {
        this.setState(prevState => {
            const opening = !prevState.isVisible;
            // Seed the greeting the first time the chat is opened for this
            // session. If the student already has a conversation going, leave
            // it alone.
            const needsGreeting = opening && prevState.messages.length === 0;
            return {
                isVisible: opening,
                messages: needsGreeting ? this.buildGreetingMessages() : prevState.messages,
            };
        });
    };

    clearConversation = () => {
        agentHelper.initializeSession();
        // Reset to a fresh greeting rather than an empty pane so the student
        // is always met with an invitation to ask, including after switching
        // problems (componentDidUpdate calls this on problem change).
        this.setState({
            messages: this.buildGreetingMessages(),
            agentSessionId: agentHelper.getSessionId()
        });
    };

    handleResizeStart = (event) => {
        event.preventDefault();
        this.setState({ isResizing: true });
        
        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = this.state.chatWidth;
        const startHeight = this.state.chatHeight;

        const handleMouseMove = (e) => {
            const deltaX = startX - e.clientX; // Reverse for left-side resize
            const deltaY = startY - e.clientY; // Reverse for top-side resize
            
            const newWidth = Math.max(300, Math.min(startWidth + deltaX, window.innerWidth * 0.95));
            const newHeight = Math.max(400, Math.min(startHeight + deltaY, window.innerHeight * 0.9));
            
            this.setState({
                chatWidth: newWidth,
                chatHeight: newHeight
            });
        };

        const handleMouseUp = () => {
            this.setState({ isResizing: false });
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    handleInputChange = (event) => {
        this.setState({ currentMessage: event.target.value });
    };

    handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.handleSendMessage();
        }
    };

    handleSendMessage = async () => {
        const { currentMessage } = this.state;
        
        if (!currentMessage.trim() || this.state.isGenerating) {
            return;
        }

        const userMessage = currentMessage.trim();
        const messageId = Date.now(); // Unique ID for tracking the assistant message
        
        // Add user message and assistant placeholder in a single setState
        this.setState(prevState => ({
            messages: [
                ...prevState.messages,
                {
                    id: `user-${messageId}`,
                    role: 'user',
                    content: userMessage,
                    timestamp: Date.now()
                },
                {
                    id: `assistant-${messageId}`,
                    role: 'assistant',
                    content: '',
                    timestamp: Date.now(),
                    isGenerating: true
                }
            ],
            currentMessage: '',
            isGenerating: true,
            isTyping: true
        }));

        // Get context from props
        const problemContext = this.getProblemContext();
        const studentState = this.getStudentState();
        const { text, figureUrls } = this.extractConceptExplorationInput(userMessage, problemContext);
        const images = await this.fetchFiguresAsBase64(figureUrls);
        const extracted = { text, images };

        const assistantMessageId = `assistant-${messageId}`;

        // Send to agent
        try {
            await agentHelper.sendMessage(
                userMessage,
                problemContext,
                studentState,
                extracted,
                {
                    onChunkReceived: (partialResponse) => {
                        this.setState(prevState => ({
                            messages: prevState.messages.map(msg =>
                                msg.id === assistantMessageId
                                    ? { ...msg, content: partialResponse }
                                    : msg
                            )
                        }));
                    },
                    onSuccessfulCompletion: (fullResponse) => {
                        this.setState(prevState => ({
                            messages: prevState.messages.map(msg =>
                                msg.id === assistantMessageId
                                    ? { ...msg, content: fullResponse, isGenerating: false }
                                    : msg
                            ),
                            isGenerating: false,
                            isTyping: false
                        }));
                    },
                    onError: (error) => {
                        this.setState(prevState => ({
                            messages: prevState.messages.map(msg =>
                                msg.id === assistantMessageId
                                    ? { 
                                        ...msg, 
                                        content: `Sorry, I encountered an error: ${error.message}`, 
                                        isGenerating: false,
                                        isError: true 
                                    }
                                    : msg
                            ),
                            isGenerating: false,
                            isTyping: false
                        }));
                    }
                }
            ,
            extracted
            );
        } catch (error) {
            // Error already handled in callbacks
        }
    };

    extractConceptExplorationInput(userMessage, problemContext) {
        const sources = [
            userMessage || '',
            problemContext?.problemTitle ? `Problem title: ${problemContext.problemTitle}` : '',
            problemContext?.problemBody ? `Problem body: ${problemContext.problemBody}` : '',
            problemContext?.currentStep?.title ? `Step title: ${problemContext.currentStep.title}` : '',
            problemContext?.currentStep?.body ? `Step body: ${problemContext.currentStep.body}` : '',
        ].filter(Boolean);

        const combined = sources.join('\n\n');

        // Collect figure filenames from ##filename tokens (same convention as RenderMedia).
        // Only figures from the current problem are collected; the path is identical to what
        // RenderMedia builds, so if the student can see the image the URL is resolvable.
        const figureUrls = [];
        const problemID = problemContext?.problemID;
        if (problemID) {
            const figTokenRegex = /##([^\s#\n]+)/g;
            let m;
            while ((m = figTokenRegex.exec(combined)) !== null) {
                const filename = (m[1] || '').trim();
                if (filename) {
                    const base = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
                    figureUrls.push(
                        `${window.location.origin}${base}/static/images/figures/${CONTENT_SOURCE}/${problemID}/${filename}`
                    );
                }
            }
        }

        return {
            label: 'Concept Exploration',
            text: combined,
            figureUrls: Array.from(new Set(figureUrls)),
        };
    }

    async fetchFiguresAsBase64(figureUrls) {
        const results = [];
        for (const url of figureUrls) {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const blob = await res.blob();
                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error('read failed'));
                    reader.readAsDataURL(blob);
                });
                results.push(dataUrl);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.warn('[AI Tutor] Could not load figure for vision:', url, e);
            }
        }
        return results;
    }

    /**
     * Extract problem context for the AI agent.
     * @returns {Object} Problem context including current step, problem details, and course info
     */
    getProblemContext() {
        const { problem, lesson, seed, getActiveStepData } = this.props;
        
        // Get the step student is currently working on
        const activeStepData = getActiveStepData ? getActiveStepData() : null;
        const currentStep = activeStepData ? {
            id: activeStepData.step.stepId,
            title: activeStepData.step.stepTitle,
            body: activeStepData.step.stepBody,
            correctAnswer: activeStepData.step.correctAnswer,
            knowledgeComponents: activeStepData.step.knowledgeComponents || []
        } : null;

        return {
            problemID: problem?.id,
            problemTitle: problem?.title,
            problemBody: problem?.body,
            courseName: lesson?.courseName,
            seed: seed,
            currentStep: currentStep,
            totalSteps: problem?.steps?.length || 0
        };
    }

    /**
     * Extract student state for the AI agent.
     * @returns {Object} Student state including answers, correctness, skill mastery, and attempt history
     */
    getStudentState() {
        const { stepStates, bktParams, getActiveStepData, attemptHistory, hintUsageByStep } = this.props;
        
        // Get active step
        const activeStepData = getActiveStepData ? getActiveStepData() : null;
        const stepIndex = activeStepData ? activeStepData.stepIndex : 0;
        const isCorrect = stepStates ? stepStates[stepIndex] : null;

        // Derive hints used for the active step (manual hints only)
        let hintsUsed = [];
        if (hintUsageByStep && Number.isInteger(stepIndex)) {
            const usage = hintUsageByStep[stepIndex];
            if (usage && Array.isArray(usage.hints)) {
                hintsUsed = usage.hints
                    .filter(h => {
                        // Only include viewed MANUAL hints:
                        // - viewed: student actually opened/used the hint
                        // - isManual flag true OR (fallback) type is not gptHint/bottomOut
                        const isManual = h.isManual !== undefined
                            ? h.isManual
                            : (h.type !== 'gptHint' && h.type !== 'bottomOut');
                        return h.viewed && isManual;
                    })
                    .map(h => ({
                        id: h.id,
                        title: h.title,
                        text: h.text,
                        type: h.type,
                        displayIndex: h.displayIndex,
                    }));
            }
        }

        // Extract skill mastery for relevant KCs
        const skillMastery = this.extractRelevantSkillMastery(
            activeStepData?.step?.knowledgeComponents,
            bktParams
        );

        // Get mastery for the current lesson
        const currentLessonMastery = this.getCurrentLessonMastery();

        return {
            isCorrect: isCorrect,
            skillMastery: skillMastery,
            attemptHistory: attemptHistory || {},
            currentLessonMastery: currentLessonMastery,
            hintsUsed,
        };
    }

    /**
     * Extract skill mastery for relevant knowledge components
     */
    extractRelevantSkillMastery(knowledgeComponents, bktParams) {
        if (!knowledgeComponents || !bktParams) {
            return {};
        }

        const relevantMastery = {};
        knowledgeComponents.forEach(kc => {
            if (bktParams[kc] && bktParams[kc].probMastery !== undefined) {
                relevantMastery[kc] = bktParams[kc].probMastery;
            }
        });

        return relevantMastery;
    }

    /**
     * Get mastery for the CURRENT lesson only (no grouping)
     * Returns array with 0 or 1 element: [{ name: "Lesson 1.1 Order of Operations", mastery: 49 }]
     */
    getCurrentLessonMastery() {
        const { lesson, lessonMasteryMap } = this.props;
        
        if (!lesson || !lesson.id || !lessonMasteryMap) {
            return [];
        }

        // Get mastery for current lesson only
        const mastery = lessonMasteryMap[lesson.id];
        
        // Only include if mastery > 0.15 (student has attempted)
        // This filters out the ~10% BKT baseline for unattempted lessons
        if (mastery && mastery > 0.15) {
            return [{
                name: `${lesson.name} ${lesson.topics}`,
                mastery: Math.round(mastery * 100)
            }];
        }
        
        return [];
    }

    render() {
        const { classes } = this.props;
        const { isVisible, messages, currentMessage, isGenerating, chatWidth, chatHeight } = this.state;

        // Toggle button (always visible)
        if (!isVisible) {
            return (
                <IconButton
                    className={classes.toggleButton}
                    onClick={this.toggleChat}
                    aria-label="Open AI Tutor"
                >
                    <img src={OSKI_SRC} alt="Oski" className={classes.toggleAvatarImg} />
                </IconButton>
            );
        }

        // Chat window
        return (
            <Card 
                ref={this.chatContainerRef}
                className={classes.chatContainer}
                style={{
                    width: chatWidth,
                    height: chatHeight
                }}
            >
                {/* Resize handle */}
                <div 
                    className={classes.resizeHandle}
                    onMouseDown={this.handleResizeStart}
                    title="Drag to resize"
                />

                <div className={classes.chatHeader}>
                    <div className={classes.chatTitle}>
                        <img
                            src={OSKI_SRC}
                            alt="Oski"
                            style={{ width: 32, height: 32, borderRadius: '50%', display: 'block' }}
                        />
                        <Typography variant="subtitle1">Oski • AI Tutor</Typography>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {messages.length > 0 && (
                            <IconButton
                                size="small"
                                onClick={this.clearConversation}
                                title="Clear chat"
                                style={{ color: 'white' }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        )}
                        <IconButton
                            size="small"
                            onClick={this.toggleChat}
                            title="Close chat"
                            style={{ color: 'white' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                </div>

                <div className={classes.chatMessages}>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`${classes.message} ${message.role === 'user' ? classes.userMessage : classes.assistantMessage}`}
                        >
                            {message.role === 'user' ? (
                                <Paper
                                    className={`${classes.messageBubble} ${classes.userBubble}`}
                                    elevation={1}
                                >
                                    {message.content ? (
                                        <Typography variant="body2" style={{ fontSize: 14, lineHeight: 1.4, fontWeight: 400 }}>
                                            {message.content}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" style={{ fontSize: 14, lineHeight: 1.4, fontWeight: 400 }}>
                                            {message.isGenerating ? 'Thinking...' : ''}
                                        </Typography>
                                    )}
                                    {message.isGenerating && (
                                        <CircularProgress size={16} style={{ marginLeft: 8 }} />
                                    )}
                                </Paper>
                            ) : (
                                <div className={classes.assistantContent}>
                                    {message.content ? (
                                        <div style={{ fontSize: 15, lineHeight: 1.6, fontWeight: 500, color: '#1f2933' }}>
                                            <MessageRenderer content={message.content} />
                                        </div>
                                    ) : (
                                        <Typography variant="body2" style={{ fontSize: 15, lineHeight: 1.6, fontWeight: 500, color: '#1f2933' }}>
                                            {message.isGenerating ? 'Thinking...' : ''}
                                        </Typography>
                                    )}
                                    {message.isGenerating && (
                                        <CircularProgress size={16} style={{ marginLeft: 8 }} />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    <div ref={this.messagesEndRef} />
                </div>

                <div className={classes.chatInput}>
                    <div className={classes.inputContainer}>
                        <TextField
                            className={classes.messageInput}
                            variant="outlined"
                            size="small"
                            placeholder="Ask me anything..."
                            value={currentMessage}
                            onChange={this.handleInputChange}
                            onKeyPress={this.handleKeyPress}
                            disabled={isGenerating}
                            multiline
                            maxRows={3}
                        />
                        <IconButton
                            className={classes.sendButton}
                            onClick={this.handleSendMessage}
                            disabled={!currentMessage.trim() || isGenerating}
                        >
                            <img src={SEND_ICON_SRC} alt="Send" className={classes.sendIconImg} />
                        </IconButton>
                    </div>
                </div>
            </Card>
        );
    }
}

export default withStyles(styles)(AgentChatbox);