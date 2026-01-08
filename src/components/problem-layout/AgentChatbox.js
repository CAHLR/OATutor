import React from 'react';
import { agentHelper } from './AgentHelper';
import MessageRenderer from './MessageRenderer';
import { withStyles } from '@material-ui/core/styles';
import {
    Card,
    TextField,
    Typography,
    Box,
    Paper,
    IconButton,
    CircularProgress
} from '@material-ui/core';
import {
    Send as SendIcon,
    Close as CloseIcon,
    Chat as ChatIcon,
    Android as BotIcon,
    Delete as DeleteIcon
} from '@material-ui/icons';

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
        maxHeight: '90vh'
    },
    chatHeader: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    chatTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontWeight: 600
    },
    chatMessages: {
        flex: 1,
        overflowY: 'auto',
        padding: 16,
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
    },
    message: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4
    },
    userMessage: {
        alignItems: 'flex-end'
    },
    assistantMessage: {
        alignItems: 'flex-start'
    },
    messageBubble: {
        padding: '10px 14px',
        borderRadius: 16,
        maxWidth: '75%',
        wordWrap: 'break-word'
    },
    userBubble: {
        backgroundColor: '#667eea',
        color: 'white'
    },
    assistantBubble: {
        backgroundColor: 'white',
        color: '#333'
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
        backgroundColor: '#667eea',
        color: 'white',
        '&:hover': {
            backgroundColor: '#5a6fd8'
        },
        '&:disabled': {
            backgroundColor: '#ccc'
        }
    },
    toggleButton: {
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1001,
        backgroundColor: '#667eea',
        color: 'white',
        '&:hover': {
            backgroundColor: '#5a6fd8'
        },
        width: 60,
        height: 60,
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
    },
    resizeHandle: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 20,
        height: 20,
        cursor: 'nwse-resize',
        zIndex: 10,
        '&::after': {
            content: '""',
            position: 'absolute',
            top: 2,
            left: 2,
            width: 16,
            height: 16,
            borderTop: '2px solid rgba(102, 126, 234, 0.4)',
            borderLeft: '2px solid rgba(102, 126, 234, 0.4)'
        }
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

    toggleChat = () => {
        this.setState(prevState => ({
            isVisible: !prevState.isVisible
        }));
    };

    clearConversation = () => {
        agentHelper.initializeSession();
        this.setState({
            messages: [],
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

        const assistantMessageId = `assistant-${messageId}`;

        // Send to agent
        try {
            await agentHelper.sendMessage(
                userMessage,
                problemContext,
                studentState,
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
            );
        } catch (error) {
            // Error already handled in callbacks
        }
    };

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
        const { stepStates, bktParams, getActiveStepData, attemptHistory } = this.props;
        
        // Get active step
        const activeStepData = getActiveStepData ? getActiveStepData() : null;
        const stepIndex = activeStepData ? activeStepData.stepIndex : 0;
        const isCorrect = stepStates ? stepStates[stepIndex] : null;

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
            currentLessonMastery: currentLessonMastery
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
                    <ChatIcon />
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
                        <BotIcon />
                        <Typography variant="subtitle1">AI Tutor</Typography>
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
                    {messages.length === 0 && (
                        <Box textAlign="center" color="text.secondary" py={2}>
                            <Typography variant="body2">
                                Hi! I'm your AI tutor. Ask me anything about this problem!
                            </Typography>
                        </Box>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`${classes.message} ${message.role === 'user' ? classes.userMessage : classes.assistantMessage}`}
                        >
                            <Paper
                                className={`${classes.messageBubble} ${message.role === 'user' ? classes.userBubble : classes.assistantBubble}`}
                                elevation={1}
                            >
                                {message.content ? (
                                    message.role === 'user' ? (
                                        <Typography variant="body2">{message.content}</Typography>
                                    ) : (
                                        <MessageRenderer content={message.content} />
                                    )
                                ) : (
                                    <Typography variant="body2">
                                        {message.isGenerating ? 'Thinking...' : ''}
                                    </Typography>
                                )}
                                {message.isGenerating && (
                                    <CircularProgress size={16} style={{ marginLeft: 8 }} />
                                )}
                            </Paper>
                            <div className={classes.messageMeta}>
                                <Typography variant="caption" color="textSecondary">
                                    {message.role === 'user' ? 'You' : 'AI Tutor'}
                                </Typography>
                            </div>
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
                            <SendIcon />
                        </IconButton>
                    </div>
                </div>
            </Card>
        );
    }
}

export default withStyles(styles)(AgentChatbox);
