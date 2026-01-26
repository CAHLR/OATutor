import React from 'react';
import MessageRenderer from './MessageRenderer';
import { withStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import avatar from '../../assets/avatar_default_state.svg';

import agentHelper from './AgentHelper';

const styles = (theme) => ({});

class AgentChatBubble extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isChatOpen: false,
            messages: [],
            currentMessage: '',
            isGenerating: false,
            agentSessionId: null,
            showHintBubble: false,
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

    toggleHintBubble = () => {
        this.setState(prevState => ({
            showHintBubble: !prevState.showHintBubble
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
        const chatBubbleHeight = isChatOpen ? (this.state.showHintBubble ? "340px" : "60vh") : "auto";
        
        const speechBubbleStyle = {
            background: "#D0F0FF",
            color: "#222",
            padding: "12px 16px",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            position: "relative",
            width: isChatOpen ? "100%" : "240px",
            maxWidth: isChatOpen ? "100%" : 240,
            height: chatBubbleHeight,
            overflow: "hidden",
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
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img
                                src={avatar}
                                alt="AI Tutor"
                                style={{
                                    width: 24,
                                    height: 24,
                                }}
                            />
                            <p style={{ margin: 0, fontWeight: 600 }}>
                                {isChatOpen ? "Chat with AI Tutor" : "AI Tutor"}
                            </p>
                        </div>
                        {!isChatOpen && <p style={{ margin: "4px 0 0 0", fontSize: 16 }}>Ask me anything!</p>}
                    </div>
                </div>

                {isChatOpen && (
                    <div
                        id="chatbot-content"
                        role="region"
                        aria-live="polite"
                        style={{
                            position: "absolute",
                            top: "70px",
                            left: "12px",
                            right: "12px",
                            bottom: "12px",
                            padding: 0,
                            background: "#f8f9fa",
                            borderRadius: 12,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{ 
                            marginBottom: 0, 
                            flex: 1, 
                            overflowY: "auto", 
                            minHeight: 0, 
                            position: "relative",
                            padding: "16px 12px",
                            background: "#ffffff"
                        }}>
                            {messages.length === 0 && (
                                <div style={{ 
                                    textAlign: "center", 
                                    color: "#9ca3af",
                                    fontSize: 14,
                                    padding: "32px 16px",
                                    fontWeight: 500
                                }}>
                                    👋 Hi! Ask me anything about this problem!
                                </div>
                            )}

                            {messages.map((msg, i) => {
                                const isUser = msg.role === "user";
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            justifyContent: isUser ? "flex-end" : "flex-start",
                                            marginBottom: 12,
                                        }}
                                    >
                                                                                    <div
                                            style={{
                                                maxWidth: "85%",
                                                padding: "10px 14px",
                                                borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                                background: isUser 
                                                    ? "#4E7DAA"
                                                    : "#e5e7eb",
                                                color: isUser ? "#ffffff" : "#1f2937",
                                                fontSize: 14,
                                                lineHeight: 1.5,
                                                boxShadow: isUser 
                                                    ? "0 2px 8px rgba(78, 125, 170, 0.25)"
                                                    : "0 1px 3px rgba(0, 0, 0, 0.1)",
                                                wordWrap: "break-word",
                                                position: "relative",
                                            }}
                                        >
                                            {!isUser && (
                                                <div style={{ 
                                                    fontSize: 11, 
                                                    fontWeight: 600, 
                                                    color: "#6b7280",
                                                    marginBottom: 4,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    AI Tutor
                                                </div>
                                            )}
                                            <div>
                                                {isUser 
                                                    ? msg.content 
                                                    : <MessageRenderer content={msg.content || ''} />
                                                }
                                            </div>
                                            {msg.isGenerating && (
                                                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                                                    <CircularProgress size={14} style={{ color: "#6b7280" }} />
                                                    <span style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>typing...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={this.messagesEndRef} />
                        </div>

                        <div style={{ 
                            flexShrink: 0, 
                            padding: "12px",
                            background: "#f8f9fa",
                            borderTop: "1px solid #e5e7eb"
                        }}>
                            <div style={{ 
                                display: "flex", 
                                gap: 8,
                                alignItems: "flex-end"
                            }}>
                                <textarea
                                    placeholder="Type your message..."
                                    value={currentMessage}
                                    onChange={this.handleInputChange}
                                    onKeyPress={this.handleKeyPress}
                                    disabled={isGenerating}
                                    style={{
                                        flex: 1,
                                        minHeight: 40,
                                        maxHeight: 100,
                                        resize: "none",
                                        padding: "10px 12px",
                                        border: "2px solid #e5e7eb",
                                        borderRadius: 20,
                                        fontFamily: "inherit",
                                        fontSize: 14,
                                        boxSizing: "border-box",
                                        outline: "none",
                                        transition: "border-color 0.2s",
                                        background: "#ffffff",
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#4E7DAA"}
                                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                                />
                                <button
                                    style={{
                                        backgroundColor: isGenerating || !currentMessage.trim() ? "#d1d5db" : "#4E7DAA",
                                        color: "white",
                                        border: "none",
                                        padding: "10px",
                                        borderRadius: "50%",
                                        cursor: isGenerating || !currentMessage.trim() ? "not-allowed" : "pointer",
                                        width: 40,
                                        height: 40,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "all 0.2s",
                                        boxShadow: isGenerating || !currentMessage.trim() 
                                            ? "none" 
                                            : "0 4px 12px rgba(78, 125, 170, 0.4)",
                                    }}
                                    disabled={isGenerating || !currentMessage.trim()}
                                    onClick={this.handleSendMessage}
                                    onMouseEnter={(e) => {
                                        if (!isGenerating && currentMessage.trim()) {
                                            e.target.style.transform = "scale(1.05)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = "scale(1)";
                                    }}
                                >
                                    {isGenerating ? (
                                        <CircularProgress size={18} style={{ color: "white" }} />
                                    ) : (
                                        <SendIcon style={{ fontSize: 18 }} />
                                    )}
                                </button>
                            </div>
                        </div>
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

export default withStyles(styles)(AgentChatBubble);