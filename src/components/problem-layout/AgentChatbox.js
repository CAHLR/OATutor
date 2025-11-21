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
        width: 400,
        maxWidth: '90vw',
        height: 600,
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        zIndex: 1000,
        borderRadius: 12,
        overflow: 'hidden'
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
        console.log("🤖 AgentChatbox mounted");
        agentHelper.initializeSession();
        this.setState({ agentSessionId: agentHelper.getSessionId() });
    }

    componentDidUpdate(prevProps) {
        // Check if problem changed - start new session
        const currentProblemID = this.props.problem?.id;
        const prevProblemID = prevProps.problem?.id;
        
        if (currentProblemID && prevProblemID && currentProblemID !== prevProblemID) {
            console.log("🔄 Problem changed! Starting new agent session...");
            this.clearConversation();
        }
        
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

    clearConversation = () => {
        console.log("🗑️ Clearing conversation...");
        agentHelper.initializeSession();
        this.setState({
            messages: [],
            agentSessionId: agentHelper.getSessionId()
        });
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
        
        // Add user message to UI
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

        // Add assistant placeholder
        this.setState(prevState => ({
            messages: [...prevState.messages, {
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
                isGenerating: true
            }]
        }));

        // Get context from props
        const problemContext = this.getProblemContext();
        const studentState = this.getStudentState();
        
        console.log("🤖 Sending message with context:", {
            problemContext,
            studentState
        });

        // Send to agent
        try {
            await agentHelper.sendMessage(
                userMessage,
                problemContext,
                studentState,
                {
                    onChunkReceived: (partialResponse) => {
                        this.setState(prevState => ({
                            messages: prevState.messages.map((msg, index) =>
                                index === prevState.messages.length - 1 && msg.role === 'assistant'
                                    ? { ...msg, content: partialResponse }
                                    : msg
                            )
                        }));
                    },
                    onSuccessfulCompletion: (fullResponse) => {
                        this.setState(prevState => ({
                            messages: prevState.messages.map((msg, index) =>
                                index === prevState.messages.length - 1 && msg.role === 'assistant'
                                    ? { ...msg, content: fullResponse, isGenerating: false }
                                    : msg
                            ),
                            isGenerating: false,
                            isTyping: false
                        }));
                    },
                    onError: (error) => {
                        this.setState(prevState => ({
                            messages: prevState.messages.map((msg, index) =>
                                index === prevState.messages.length - 1 && msg.role === 'assistant'
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
            console.error("🤖 Error sending message:", error);
        }
    };

    /**
     * Extract problem context from props
     * This is what the agent needs to know about the problem
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
     * Extract student state from props
     * This is what the agent needs to know about the student
     */
    getStudentState() {
        const { stepStates, bktParams, getActiveStepData } = this.props;
        
        // Get active step
        const activeStepData = getActiveStepData ? getActiveStepData() : null;
        const stepIndex = activeStepData ? activeStepData.stepIndex : 0;
        const isCorrect = stepStates ? stepStates[stepIndex] : null;

        // Extract skill mastery for relevant KCs
        const skillMastery = this.extractRelevantSkillMastery(
            activeStepData?.step?.knowledgeComponents,
            bktParams
        );

        return {
            currentAnswer: "",  // ProblemCard-level data, not available here
            isCorrect: isCorrect,
            hintsUsed: [],  // ProblemCard-level data, not available here
            skillMastery: skillMastery
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

    render() {
        const { classes } = this.props;
        const { isVisible, messages, currentMessage, isGenerating } = this.state;

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
            <Card className={classes.chatContainer}>
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

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`${classes.message} ${message.role === 'user' ? classes.userMessage : classes.assistantMessage}`}
                        >
                            <Paper
                                className={`${classes.messageBubble} ${message.role === 'user' ? classes.userBubble : classes.assistantBubble}`}
                                elevation={1}
                            >
                                <Typography variant="body2">
                                    {message.content || (message.isGenerating ? 'Thinking...' : '')}
                                </Typography>
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
