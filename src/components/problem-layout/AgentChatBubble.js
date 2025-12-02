import React from 'react';
import MessageRenderer from './MessageRenderer';
import { withStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

import agentHelper from './AgentHelper';

const styles = (theme) => ({
    // Styles are inline for this component
});

class AgentChatbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isChatOpen: false,
            messages: [],
            currentMessage: '',
            isGenerating: false,
            agentSessionId: null
        };
        this.messagesEndRef = React.createRef();
    }

    componentDidMount() {
        agentHelper.initializeSession();
        this.setState({ agentSessionId: agentHelper.getSessionId() });
    }

    componentDidUpdate(prevProps) {
        const currentProblemID = this.props.problem?.id;
        const prevProblemID = prevProps.problem?.id;
        
        if (currentProblemID && prevProblemID && currentProblemID !== prevProblemID) {
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
            isChatOpen: !prevState.isChatOpen
        }));
    };

    clearConversation = () => {
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
        
        this.setState(prevState => ({
            messages: [...prevState.messages, {
                role: 'user',
                content: userMessage,
                timestamp: Date.now()
            }],
            currentMessage: '',
            isGenerating: true
        }));

        const assistantIndex = this.state.messages.length + 1;
        this.setState(prevState => ({
            messages: [...prevState.messages, {
                role: 'assistant',
                content: 'Thinking...',
                timestamp: Date.now(),
                isGenerating: true
            }],
            assistantIndex
        }));

        const problemContext = this.getProblemContext();
        const studentState = this.getStudentState();

        try {
            await agentHelper.sendMessage(
                userMessage,
                problemContext,
                studentState,
                {
                    onChunkReceived: (partialResponse) => {
                        this.setState(prevState => ({
                            messages: prevState.messages.map((msg, index) =>
                                index === prevState.assistantIndex
                                    ? { ...msg, content: partialResponse }
                                    : msg
                            )
                        }));
                    },
                    onSuccessfulCompletion: (fullResponse) => {
                        this.setState(prevState => ({
                            messages: prevState.messages.map((msg, index) =>
                                index === prevState.assistantIndex
                                    ? { ...msg, content: fullResponse, isGenerating: false }
                                    : msg
                            ),
                            isGenerating: false
                        }));
                    },
                    onError: (error) => {
                        this.setState(prevState => ({
                            messages: prevState.messages.map((msg, index) =>
                                index === prevState.assistantIndex
                                    ? { 
                                        ...msg, 
                                        content: `Sorry, I encountered an error: ${error.message}`, 
                                        isGenerating: false,
                                        isError: true 
                                    }
                                    : msg
                            ),
                            isGenerating: false
                        }));
                    }
                }
            );
        } catch (error) {
            console.error('Chat error:', error);
        }
    };

    getProblemContext() {
        const { problem, lesson, seed, getActiveStepData } = this.props;
        
        const activeStepData = getActiveStepData ? getActiveStepData() : null;
        const currentStep = activeStepData ? {
            id: activeStepData.step.id,
            title: activeStepData.step.stepTitle,
            body: activeStepData.step.stepBody,
            correctAnswer: activeStepData.step.stepAnswer,
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

    getStudentState() {
        const { stepStates, bktParams, getActiveStepData } = this.props;
        
        const activeStepData = getActiveStepData ? getActiveStepData() : null;
        const stepIndex = activeStepData ? activeStepData.stepIndex : 0;
        const isCorrect = stepStates ? stepStates[stepIndex] : null;

        const skillMastery = this.extractRelevantSkillMastery(
            activeStepData?.step?.knowledgeComponents,
            bktParams
        );

        return {
            currentAnswer: "",
            isCorrect: isCorrect,
            hintsUsed: [],
            skillMastery: skillMastery
        };
    }

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
        const { isChatOpen, messages, currentMessage, isGenerating } = this.state;

        const speechBubbleStyle = {
            background: "#D0F0FF",
            color: "#222",
            padding: "12px 16px",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            position: "relative",
            width: "auto",
            maxWidth: 240,
            alignSelf: "flex-end",
            textAlign: "left",
            cursor: isChatOpen ? "default" : "pointer",
            transition: "all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
            marginTop: 16,
            zIndex: 2,
        };

        return (
            <div style={speechBubbleStyle}>
                <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isChatOpen}
                    aria-controls="chatbot-content"
                    onClick={this.toggleChat}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            this.toggleChat();
                        }
                    }}
                    aria-label="Toggle chatbot"
                    style={{ cursor: "pointer" }}
                >
                    <p style={{ margin: 0, fontWeight: 600 }}>Chat with me!</p>
                    {!isChatOpen && <p style={{ margin: 0 }}>Tap to start chatting</p>}
                </div>

                {isChatOpen && (
                    <div
                        id="chatbot-content"
                        role="region"
                        aria-live="polite"
                        style={{
                            marginTop: 8,
                            padding: 12,
                            background: "#F5F5F5",
                            borderRadius: 6,
                            maxHeight: "40vh",
                            overflowY: "auto",
                        }}
                    >
                        <div style={{ marginBottom: 12 }}>
                            {messages.length === 0 && (
                                <div style={{ 
                                    textAlign: "center", 
                                    color: "#666",
                                    fontSize: 14,
                                    padding: "20px 0"
                                }}>
                                    Hi! Ask me anything about this problem!
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: "8px 10px",
                                        marginBottom: 6,
                                        borderRadius: 6,
                                        background: msg.role === "user" ? "#D8EAFE" : "#E9FFE5",
                                        fontSize: 14,
                                    }}
                                >
                                    <strong style={{ fontSize: 12, color: "#555" }}>
                                        {msg.role === "user" ? "You" : "AI Tutor"}
                                    </strong>
                                    <div style={{ marginTop: 4 }}>
                                        {msg.role === "user" 
                                            ? msg.content 
                                            : <MessageRenderer content={msg.content || ''} />
                                        }
                                    </div>
                                    {msg.isGenerating && (
                                        <CircularProgress size={12} style={{ marginLeft: 8 }} />
                                    )}
                                </div>
                            ))}
                            <div ref={this.messagesEndRef} />
                        </div>

                        <textarea
                            placeholder="Type your message..."
                            value={currentMessage}
                            onChange={this.handleInputChange}
                            onKeyPress={this.handleKeyPress}
                            disabled={isGenerating}
                            style={{
                                width: "100%",
                                minHeight: 80,
                                resize: "vertical",
                                padding: 8,
                                border: "1px solid #ddd",
                                borderRadius: 4,
                                fontFamily: "inherit",
                                fontSize: 14,
                            }}
                        />
                        <button
                            style={{
                                marginTop: 8,
                                backgroundColor: "#4E7DAA",
                                color: "white",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: 4,
                                cursor: "pointer",
                                fontWeight: 500,
                                width: "100%",
                                opacity: isGenerating ? 0.5 : 1,
                            }}
                            disabled={isGenerating || !currentMessage.trim()}
                            onClick={this.handleSendMessage}
                        >
                            {isGenerating ? "Thinking..." : "Send"}
                        </button>
                    </div>
                )}

                {/* Tail pointing upward */}
                <div
                    style={{
                        position: "absolute",
                        top: "-8px",
                        right: "24px",
                        width: 0,
                        height: 0,
                        borderLeft: "8px solid transparent",
                        borderRight: "8px solid transparent",
                        borderBottom: "8px solid #D0F0FF",
                    }}
                />
            </div>
        );
    }
}

export default withStyles(styles)(AgentChatbox);