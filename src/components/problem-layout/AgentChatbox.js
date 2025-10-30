import React from 'react';
import { agentHelper } from './AgentHelper';
import { withStyles } from '@material-ui/core/styles';
import {
    Card,
    TextField,
    Button,
    Typography,
    Box,
    Paper,
    IconButton,
    Chip,
    CircularProgress
} from '@material-ui/core';
import {
    Send as SendIcon,
    Close as CloseIcon,
    Chat as ChatIcon,
    Android as BotIcon
} from '@material-ui/icons';

const styles = (theme) => ({
    chatContainer: {
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 400,
        maxHeight: 600,
        zIndex: 1000,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        borderRadius: 12,
        overflow: 'hidden'
    },
    chatHeader: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    chatTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontWeight: 600
    },
    chatMessages: {
        height: 400,
        overflowY: 'auto',
        padding: 16,
        backgroundColor: '#fafafa'
    },
    message: {
        marginBottom: 12,
        display: 'flex',
        flexDirection: 'column'
    },
    userMessage: {
        alignItems: 'flex-end'
    },
    assistantMessage: {
        alignItems: 'flex-start'
    },
    messageBubble: {
        maxWidth: '80%',
        padding: '8px 12px',
        borderRadius: 18,
        wordWrap: 'break-word'
    },
    userBubble: {
        backgroundColor: '#667eea',
        color: 'white',
        borderBottomRightRadius: 4
    },
    assistantBubble: {
        backgroundColor: 'white',
        color: '#333',
        border: '1px solid #e0e0e0',
        borderBottomLeftRadius: 4
    },
    messageMeta: {
        fontSize: '0.75rem',
        color: '#666',
        marginTop: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 4
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
    typingIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: '#666',
        fontStyle: 'italic',
        padding: '8px 12px'
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
        }
    },
    hintLevelChip: {
        fontSize: '0.7rem',
        height: 20
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
            agentSessionId: null
        };
        this.messagesEndRef = React.createRef();
    }

    componentDidMount() {
        console.log("🤖 AgentChatbox mounted, initializing session...");
        agentHelper.initializeSession();
        this.setState({ agentSessionId: agentHelper.getSessionId() });
        console.log("🤖 AgentChatbox session ID:", agentHelper.getSessionId());
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    scrollToBottom = () => {
        if (this.messagesEndRef.current) {
            this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    toggleChat = () => {
        this.setState(prevState => ({
            isVisible: !prevState.isVisible
        }));
    };

    handleInputChange = (event) => {
        this.setState({ currentMessage: event.target.value });
    };

    handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    };

    sendMessage = async () => {
        const { currentMessage } = this.state;
        if (!currentMessage.trim() || this.state.isGenerating) return;

        const userMessage = currentMessage.trim();
        console.log("🤖 AgentChatbox: Sending message:", userMessage);

        // Add user message to chat
        this.setState(prevState => ({
            messages: [...prevState.messages, {
                role: 'user',
                content: userMessage,
                timestamp: Date.now()
            }],
            currentMessage: '',
            isGenerating: true,
            isTyping: true
        }));

        // Add assistant message placeholder BEFORE sending
        this.setState(prevState => ({
            messages: [...prevState.messages, {
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
                isGenerating: true
            }]
        }));

        // Get problem context from props
        const problemContext = this.getProblemContext();
        const studentState = this.getStudentState();
        
        console.log("🤖 AgentChatbox: Problem context:", problemContext);
        console.log("🤖 AgentChatbox: Student state:", studentState);

        // Send to agent
        console.log("🤖 AgentChatbox: Calling agentHelper.sendMessage...");
        await agentHelper.sendMessage(
            userMessage,
            problemContext,
            studentState,
            {
                onChunkReceived: (partialResponse) => {
                    console.log("🤖 AgentChatbox: Chunk received, updating UI...");
                    this.setState(prevState => ({
                        messages: prevState.messages.map((msg, index) =>
                            index === prevState.messages.length - 1 && msg.role === 'assistant'
                                ? { ...msg, content: partialResponse }
                                : msg
                        )
                    }));
                },
                onSuccessfulCompletion: (fullResponse) => {
                    console.log("🤖 AgentChatbox: Response complete!");
                    this.setState(prevState => ({
                        messages: prevState.messages.map((msg, index) =>
                            index === prevState.messages.length - 1 && msg.role === 'assistant'
                                ? { ...msg, content: fullResponse, isComplete: true, isGenerating: false }
                                : msg
                        ),
                        isGenerating: false,
                        isTyping: false
                    }));
                },
                onError: (error) => {
                    console.error('🤖 AgentChatbox: Agent error:', error);
                    this.setState(prevState => ({
                        messages: [...prevState.messages.slice(0, -1), {
                            role: 'assistant',
                            content: 'Sorry, I encountered an error. Please try again.',
                            timestamp: Date.now(),
                            isError: true
                        }],
                        isGenerating: false,
                        isTyping: false
                    }));
                }
            }
        );
    };

    getProblemContext = () => {
        const { problem, step, lesson, courseName, problemVars, seed } = this.props;
        const safeProblem = problem || {};
        const safeStep = step || {};
        const safeLesson = lesson || {};
        const safeVars = problemVars || {};
    
        return {
            problemID: safeProblem.id || '',
            lessonID: safeLesson.id || '',
            courseName: courseName || safeLesson.courseName || '',
            problemTitle: safeProblem.title || '',
            problemBody: safeProblem.body || '',
            currentStep: {
                id: safeStep.id || '',
                title: safeStep.stepTitle || safeStep.title || '',
                body: safeStep.stepBody || safeStep.body || '',
                answerType: safeStep.answerType || '',
                problemType: safeStep.problemType || '',
                correctAnswer: safeStep.stepAnswer || '',
                precision: safeStep.precision || '',
                choices: safeStep.choices || [],
                knowledgeComponents: safeStep.knowledgeComponents || []
            },
            variables: safeVars,
            seed: seed || ''
        };
    };
    getStudentState = () => {
        const { inputVal, isCorrect, attempts, hintsFinished, user, bktParams } = this.props;

        return {
            currentAnswer: inputVal || '',
            isCorrect: isCorrect,
            attemptCount: attempts || 0,
            hintsUsed: hintsFinished || [],
            timeOnStep: this.calculateTimeOnStep(),
            skillMastery: this.extractSkillMastery(bktParams),
            user: {
                user_id: user?.user_id,
                full_name: user?.full_name,
                course_name: user?.course_name,
                course_id: user?.course_id
            }
        };
    };

    calculateTimeOnStep = () => {
        return Math.floor(Math.random() * 120) + 30;
    };

    extractSkillMastery = (bktParams) => {
        if (!bktParams) return {};

        const mastery = {};
        Object.entries(bktParams).forEach(([skill, params]) => {
            if (params && typeof params.probMastery === 'number') {
                mastery[skill] = params.probMastery;
            }
        });
        return mastery;
    };

    render() {
        const { classes } = this.props;
        const { isVisible, messages, currentMessage, isTyping, isGenerating } = this.state;

        if (!isVisible) {
            return (
                <IconButton
                    className={classes.toggleButton}
                    onClick={this.toggleChat}
                    size="large"
                >
                    <ChatIcon />
                </IconButton>
            );
        }

        return (
            <Card className={classes.chatContainer}>
                <div className={classes.chatHeader}>
                    <div className={classes.chatTitle}>
                        <BotIcon />
                        <Typography variant="subtitle1">AI Tutor</Typography>
                    </div>
                    <IconButton
                        size="small"
                        onClick={this.toggleChat}
                        style={{ color: 'white' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>

                <div className={classes.chatMessages}>
                    {messages.length === 0 && (
                        <Box textAlign="center" color="text.secondary" py={2}>
                            <Typography variant="body2">
                                Hi! I'm your AI tutor. Ask me anything about this problem!
                            </Typography>
                        </Box>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`${classes.message} ${message.role === 'user' ? classes.userMessage : classes.assistantMessage}`}
                        >
                            <Paper
                                className={`${classes.messageBubble} ${message.role === 'user' ? classes.userBubble : classes.assistantBubble}`}
                            >
                                <Typography variant="body2">
                                    {message.content}
                                </Typography>
                                {message.isGenerating && (
                                    <CircularProgress size={16} style={{ marginLeft: 8 }} />
                                )}
                            </Paper>
                            <div className={classes.messageMeta}>
                                <Typography variant="caption">
                                    {message.role === 'user' ? 'You' : 'AI Tutor'}
                                </Typography>
                                {message.hintLevel && (
                                    <Chip
                                        label={`Hint Level ${message.hintLevel}/5`}
                                        size="small"
                                        className={classes.hintLevelChip}
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className={classes.typingIndicator}>
                            <CircularProgress size={16} />
                            <Typography variant="caption">AI is thinking...</Typography>
                        </div>
                    )}

                    <div ref={this.messagesEndRef} />
                </div>

                <div className={classes.chatInput}>
                    <div className={classes.inputContainer}>
                        <TextField
                            className={classes.messageInput}
                            placeholder="Ask me about this problem..."
                            value={currentMessage}
                            onChange={this.handleInputChange}
                            onKeyPress={this.handleKeyPress}
                            multiline
                            maxRows={3}
                            variant="outlined"
                            size="small"
                            disabled={isGenerating}
                        />
                        <Button
                            className={classes.sendButton}
                            onClick={this.sendMessage}
                            disabled={!currentMessage.trim() || isGenerating}
                        >
                            <SendIcon />
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }
}

export default withStyles(styles)(AgentChatbox);