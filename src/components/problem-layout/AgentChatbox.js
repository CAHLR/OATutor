import React from 'react';
import { CONTENT_SOURCE } from '@common/global-config';
import { agentHelper } from './AgentHelper';
import { increment } from '../Firebase';
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
    Close as CloseIcon
} from '@material-ui/icons';
import { ReactComponent as OskiAvatar } from '../../assets/avatar_default_state.svg';
import { ReactComponent as SendArrowIcon } from '../../assets/arrow.svg';
import { ReactComponent as ChatBubble } from '../../assets/chat-bubble.svg';
import { ThemeContext } from '../../config/config.js';
import { withResponsive } from '../../util/ResponsiveContext';
import { MOBILE_CHAT_SHEET_HEIGHT } from './MobileBottomSheet';
import MobileBottomSheet from './MobileBottomSheet';
import {
    MOBILE_AGENT_AVATAR_HEIGHT,
    MOBILE_AGENT_AVATAR_WIDTH,
    MOBILE_AGENT_FAB_BOTTOM,
    MOBILE_FAB_RIGHT,
    DESKTOP_TOOLTIP_RIGHT,
    PAGE_BG,
} from './mobileFabStyles';
import {
    getHelpPenaltyBadgeText,
    getChatPenaltyMode,
    getHintPenaltyMode,
    shouldJudgeAgentAnswerReveal,
    shouldPenalizeAgentOnOpen,
} from '../../util/helpPenaltyMode.js';
import { resolveChatModel } from '../../util/chatModel.js';
import { chooseVariables, variabilize } from '../../platform-logic/variabilize.js';

const CHAT_THEME = {
    primary: '#4c7d9f',
    primaryDark: '#3f7091',
    accent: '#ffc300',
    pale: '#a3c5de',
    surface: '#eef4fa',
};

const VISION_IMAGE_MIME_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
]);

function isVisionSafeImageDataUrl(dataUrl) {
    return typeof dataUrl === 'string'
        && /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(dataUrl);
}

// Tail tip x=382 in the 520-wide chat-bubble viewBox
const LAUNCHER_TAIL_CENTER_PERCENT = (382 / 520) * 100;

const FALLBACK_SUGGESTED_QUESTIONS = [
    'What should I try first?',
    'Can you explain this step in simpler words?',
    'Why might my answer be wrong?',
];

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
    chatContainerSheet: {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: MOBILE_CHAT_SHEET_HEIGHT,
        maxWidth: '100vw',
        maxHeight: MOBILE_CHAT_SHEET_HEIGHT,
        minWidth: 0,
        minHeight: 0,
        borderRadius: '20px 20px 0 0',
        zIndex: 1300,
        boxShadow: '0 -10px 40px rgba(16, 24, 40, 0.16)',
    },
    launcherAvatarMobile: {
        width: MOBILE_AGENT_AVATAR_WIDTH,
        height: MOBILE_AGENT_AVATAR_HEIGHT,
        display: 'block',
        filter: 'drop-shadow(0 4px 14px rgba(76, 125, 159, 0.32))',
    },
    chatHeader: {
        background: `linear-gradient(135deg, ${CHAT_THEME.primary} 0%, ${CHAT_THEME.primaryDark} 100%)`,
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `3px solid ${CHAT_THEME.accent}`,
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
        backgroundColor: CHAT_THEME.surface,
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
        backgroundColor: CHAT_THEME.primary,
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
        borderTop: `1px solid ${CHAT_THEME.pale}`,
    },
    suggestions: {
        marginTop: 4,
        padding: '12px 14px',
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
        border: `1px solid ${CHAT_THEME.pale}`,
    },
    suggestionsTitle: {
        color: '#5f6f7f',
        fontSize: 13,
        fontWeight: 700,
        marginBottom: 8,
    },
    suggestionList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
    },
    suggestionChip: {
        border: `1px solid ${CHAT_THEME.pale}`,
        backgroundColor: '#f7fbfe',
        color: CHAT_THEME.primaryDark,
        borderRadius: 999,
        padding: '7px 11px',
        fontSize: 13,
        fontWeight: 700,
        lineHeight: 1.25,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.16s ease',
        '&:hover': {
            borderColor: CHAT_THEME.primary,
            backgroundColor: CHAT_THEME.surface,
        },
        '&:disabled': {
            cursor: 'default',
            opacity: 0.65,
        },
    },
    inputContainer: {
        display: 'flex',
        gap: 8,
        alignItems: 'center',
    },
    messageInput: {
        flex: 1,
        '& .MuiOutlinedInput-root': {
            borderRadius: 20
        }
    },
    sendButton: {
        padding: 0,
        minWidth: 0,
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        backgroundColor: 'transparent !important',
        border: 'none',
        boxShadow: 'none',
        borderRadius: 0,
        flexShrink: 0,
        '&:hover': {
            backgroundColor: 'transparent !important',
            boxShadow: 'none',
            '& $sendIcon': {
                transform: 'scale(1.06)',
            },
        },
        '&:disabled': {
            backgroundColor: 'transparent !important',
            opacity: 0.45,
        },
    },
    sendIcon: {
        width: 48,
        height: 48,
        display: 'block',
        flexShrink: 0,
        transition: 'transform 0.2s ease',
    },
    floatingLauncher: {
        position: 'fixed',
        bottom: MOBILE_AGENT_FAB_BOTTOM,
        right: MOBILE_FAB_RIGHT,
        zIndex: 1001,
        maxWidth: 'calc(100vw - 40px)',
        transform: 'none',
        [theme.breakpoints.up('md')]: {
            right: DESKTOP_TOOLTIP_RIGHT,
        },
    },
    embeddedLauncher: {
        width: '100%',
        padding: '24px 16px',
        boxSizing: 'border-box',
    },
    launcherButton: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: 0,
        fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        '&:hover $launcherAvatar': {
            transform: 'scale(1.06)',
        },
    },
    launcherStack: {
        width: '100%',
        maxWidth: 300,
    },
    launcherBubbleWrap: {
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'visible',
        transition: 'max-height 0.25s ease, opacity 0.2s ease, margin-bottom 0.2s ease',
    },
    launcherBubbleWrapHidden: {
        maxHeight: 0,
        opacity: 0,
        marginBottom: 0,
        padding: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
    },
    launcherBubbleWrapVisible: {
        maxHeight: 200,
        opacity: 1,
        marginBottom: 0,
    },
    launcherBubbleShape: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        overflow: 'visible',
        pointerEvents: 'none',
        '& path': {
            fill: PAGE_BG,
            stroke: CHAT_THEME.primary,
            vectorEffect: 'non-scaling-stroke',
        },
    },
    launcherBubbleContent: {
        position: 'relative',
        padding: '14px 10px 32px',
        textAlign: 'left',
        boxSizing: 'border-box',
    },
    launcherTitle: {
        margin: 0,
        fontWeight: 700,
        fontSize: 15,
        lineHeight: 1.2,
        color: CHAT_THEME.primaryDark,
    },
    launcherDescription: {
        margin: '2px 0 0',
        fontSize: 12,
        lineHeight: 1.3,
        color: '#5c6b7a',
    },
    launcherPill: {
        display: 'inline-block',
        marginTop: 4,
        padding: '2px 7px',
        borderRadius: 9999,
        border: `1px solid ${CHAT_THEME.pale}`,
        backgroundColor: '#ffffff',
        color: CHAT_THEME.primaryDark,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.2,
    },
    launcherAvatarRow: {
        display: 'flex',
        justifyContent: 'flex-start',
        paddingLeft: `calc(${LAUNCHER_TAIL_CENTER_PERCENT}% - 40px)`,
        marginTop: 4,
    },
    launcherAvatar: {
        width: 80,
        height: 74,
        display: 'block',
        filter: 'drop-shadow(0 4px 14px rgba(76, 125, 159, 0.32))',
        transition: 'transform 0.2s ease',
    },
    avatarIcon: {
        width: 32,
        height: 32,
        display: 'block',
        flexShrink: 0,
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
    static contextType = ThemeContext;

    constructor(props) {
        super(props);
        const startsVisible = props.mode === 'embedded' && props.defaultOpen !== false;
        this.state = {
            isVisible: startsVisible,
            messages: [],
            currentMessage: '',
            isTyping: false,
            isGenerating: false,
            chatWidth: 400,
            chatHeight: 600,
            isResizing: false,
            suggestedQuestions: [],
            isLoadingSuggestedQuestions: false,
            suggestionsCacheKey: '',
            hasChatBeenOpened: false,
            isLauncherHovered: false,
            firstChatActionRecorded: false, // true once firstActionType has been written
        };
        this.messagesEndRef = React.createRef();
        this.chatContainerRef = React.createRef();
        this.activeRequestId = 0;
        // Last problemId whose context was already reflected in an LLM turn.
        // Used to inject a role:user switch notice when the ITS advances problems
        // without clearing the chat thread (lesson change still clears).
        this._lastPromptedProblemId = null;
    }

    getFirebase = () => this.context?.firebase;

    getSessionId = () => agentHelper.getSessionId();

    componentDidMount() {
        // Use initSessionIfNeeded so Problem.js (which mounts first) wins the session ID.
        agentHelper.initSessionIfNeeded();
        if (this.props.mode === 'embedded' && this.state.isVisible) {
            // In standalone embedded mode, greet immediately and mark chat as opened.
            this.setState((prev) => ({
                messages: prev.messages.length === 0 ? this.buildGreetingMessages() : prev.messages,
            }));
            const fb = this.getFirebase();
            const sid = this.getSessionId();
            if (fb?.logChatSession && sid) {
                fb.logChatSession(sid, { chatOpenCount: increment(1), lastActivityAt: Date.now() });
            }
        }
        this.fetchSuggestedQuestionsIfNeeded();
        this._notifyPromoEligibility();
        this.props.onPromoLayoutChange?.();
    }

    _getChatPenaltyMode = () =>
        this.props.chatPenaltyMode || getChatPenaltyMode(this.props.lesson);

    _maybePenalizeAgentOnFirstQuery = () => {
        if (!shouldPenalizeAgentOnOpen({ mode: this._getChatPenaltyMode() })) {
            return;
        }
        this.props.applyHelpPenalty?.();
    };

    _resolveStepAnswers = (step) => {
        if (!step) return [];
        const chosenVars = chooseVariables(
            Object.assign(
                {},
                this.props.problemVars || {},
                this.props.problem?.variabilization || {},
                step.variabilization || {}
            ),
            this.props.seed
        );
        const raw = step.stepAnswer;
        const list = Array.isArray(raw) ? raw : raw != null && raw !== '' ? [raw] : [];
        return list
            .map((ans) => String(variabilize(ans, chosenVars) ?? ans))
            .filter(Boolean);
    };

    _maybeJudgeAgentAnswerReveal = async (assistantText) => {
        if (!shouldJudgeAgentAnswerReveal({ mode: this._getChatPenaltyMode() })) {
            return;
        }
        const text = (assistantText || '').trim();
        if (!text) return;

        const active = this.props.getActiveStepData?.();
        const step = active?.step;
        const stepIndex = active?.stepIndex;
        const answers = this._resolveStepAnswers(step);
        if (!answers.length) return;

        try {
            const result = await agentHelper.judgeAnswerReveal({
                assistantMessage: text,
                stepAnswers: answers,
                problemContext: this.getProblemContext(),
                stepId: step?.id || null,
                chatPrompt: this.props.lesson?.chat_prompt || 'PROMPTv2.txt',
                chatDisplayMode: this.props.lesson?.chat_display_mode ?? 'Off',
                chatPenaltyMode: this._getChatPenaltyMode(),
                chatModel: resolveChatModel(this.props.lesson),
                lessonId: this.props.lesson?.id || null,
                condition: this.props.condition,
            });
            if (result?.answerRevealed) {
                this.props.applyHelpPenalty?.(stepIndex);
            }
        } catch (err) {
            console.warn('Answer-reveal judge failed; skipping help penalty', err);
        }
    };

    _getPromoAllowed = () => {
        const isMobile = this.props.responsive?.isMobile ?? false;
        return (
            this.props.showLauncherBubble !== false &&
            !this.props.hintsOpen &&
            !isMobile
        );
    };

    _getPromoEligible = () => {
        if (!this._getPromoAllowed()) return false;
        return (
            !this.state.hasChatBeenOpened || this.state.isLauncherHovered
        );
    };

    _notifyPromoEligibility = () => {
        const meta = {
            allowed: this._getPromoAllowed(),
            hasBeenOpened: Boolean(this.state.hasChatBeenOpened),
            isHovering: Boolean(this.state.isLauncherHovered),
        };
        const prev = this._lastReportedPromoMeta;
        if (
            prev &&
            prev.allowed === meta.allowed &&
            prev.hasBeenOpened === meta.hasBeenOpened &&
            prev.isHovering === meta.isHovering
        ) {
            return;
        }
        this._lastReportedPromoMeta = meta;
        this.props.onPromoEligibilityChange?.(meta);
    };

    componentDidUpdate(prevProps, prevState) {
        this._notifyPromoEligibility();
        const currentLessonID = this.props.lesson?.id;
        const prevLessonID = prevProps.lesson?.id;

        if (
            this.props.closeRequest != null &&
            this.props.closeRequest !== prevProps.closeRequest &&
            this.state.isVisible
        ) {
            this.setState({ isVisible: false });
        }

        // Only reset chat when the lesson changes — not when advancing to the next problem.
        if (currentLessonID && prevLessonID && currentLessonID !== prevLessonID) {
            this.clearConversation();
        }
        
        // Scroll to latest when chat is reopened, or when a new message is added
        if (!prevState.isVisible && this.state.isVisible) {
            // Double rAF: wait until remounted chat has finished layout
            requestAnimationFrame(() => {
                requestAnimationFrame(() => this.scrollToBottom(true));
            });
        } else if (this.state.messages.length > prevState.messages.length) {
            // New user/assistant turn — always stick to the latest message
            this.scrollToBottom(true);
        }

        if (this.props.showSuggestedQuestions) {
            this.fetchSuggestedQuestionsIfNeeded();
        }
    }
    
    scrollToBottom = (force = false) => {
        if (!this.messagesEndRef.current) {
            return;
        }
        const messagesContainer = this.messagesEndRef.current.parentElement;
        if (!messagesContainer) {
            return;
        }

        const distanceFromBottom =
            messagesContainer.scrollHeight -
            messagesContainer.scrollTop -
            messagesContainer.clientHeight;
        const isNearBottom = distanceFromBottom < 120;

        // Scroll only the messages pane (not scrollIntoView — that moves page/flex ancestors).
        if (force || isNearBottom) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
        const fb = this.getFirebase();
        const sid = this.getSessionId();
        if (fb?.logChatSession && sid) {
            fb.logChatSession(sid, { greetingShown: true, lastActivityAt: Date.now() });
        }
        return [{
            id: `greeting-${Date.now()}`,
            role: 'assistant',
            content: `Hello! I'm Oski, your AI tutor. I'm here to think through ${subject} with you — feel free to ask me anything, or tell me where you're stuck.`,
            timestamp: Date.now(),
            isGenerating: false,
        }];
    };

    getSuggestionsCacheKey = () => {
        const problemContext = this.getProblemContext();
        const studentState = this.getStudentState();

        return [
            problemContext.problemID || '',
            problemContext.currentStep?.id || '',
            studentState.isCorrect === undefined ? 'unknown' : String(studentState.isCorrect),
        ].join('::');
    };

    fetchSuggestedQuestionsIfNeeded = async () => {
        if (!this.props.showSuggestedQuestions || this.state.isLoadingSuggestedQuestions) {
            return;
        }
        if (this.props.allowEmbeddedClose && !this.state.isVisible) {
            return;
        }

        const cacheKey = this.getSuggestionsCacheKey();
        if (!cacheKey || cacheKey === this.state.suggestionsCacheKey) {
            return;
        }

        this.setState({
            isLoadingSuggestedQuestions: true,
            suggestionsCacheKey: cacheKey,
        });

        try {
            const problemContext = this.getProblemContext();
            const studentState = this.getStudentState();
            const { text } = this.extractConceptExplorationInput('', problemContext);
            const questions = await agentHelper.fetchSuggestedQuestions(
                problemContext,
                studentState,
                {
                    text,
                    images: [],
                    condition: this.props.condition,
                    lessonId: this.props.lesson?.id,
                },
                this.props.lesson?.chat_prompt || 'PROMPTv2.txt',
                this.props.lesson?.chat_display_mode ?? 'Off',
                this._getChatPenaltyMode(),
                resolveChatModel(this.props.lesson),
            );

            this.setState({
                suggestedQuestions: questions.slice(0, 3),
                isLoadingSuggestedQuestions: false,
            });
        } catch (_error) {
            this.setState({
                suggestedQuestions: FALLBACK_SUGGESTED_QUESTIONS,
                isLoadingSuggestedQuestions: false,
            });
        }
    };

    handleLauncherPointerIn = () => {
        this.setState({ isLauncherHovered: true }, () => {
            this.props.onPromoLayoutChange?.();
        });
    };

    handleLauncherPointerOut = () => {
        this.setState({ isLauncherHovered: false }, () => {
            this.props.onPromoLayoutChange?.();
        });
    };

    handleLauncherKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.toggleChat();
        }
    };

    renderLauncher = () => {
        const { classes, responsive } = this.props;
        const isMobile = responsive?.isMobile ?? false;
        const mode = this.props.mode || 'floating';
        const launcherPlacement = this.props.closedLauncherPlacement || mode;
        const hintsOpen = this.props.hintsOpen;
        const hidePromoDueToOverlap = Boolean(this.props.hidePromoDueToOverlap);
        const promoEligible = this._getPromoEligible();
        const promoVisible = promoEligible && !hidePromoDueToOverlap;
        const bubbleWrapClass = promoVisible
            ? classes.launcherBubbleWrapVisible
            : classes.launcherBubbleWrapHidden;

        if (isMobile && launcherPlacement === 'floating') {
            if (hintsOpen || this.props.drawerOpen || this.props.mathKeyboardOpen) {
                return null;
            }

            return (
                <button
                    type="button"
                    className={`${classes.launcherButton} ${classes.floatingLauncher}`}
                    onClick={this.toggleChat}
                    onKeyDown={this.handleLauncherKeyDown}
                    aria-label="Open AI Tutor"
                >
                    <OskiAvatar className={classes.launcherAvatarMobile} aria-hidden="true" />
                </button>
            );
        }

        return (
            <button
                type="button"
                className={`${classes.launcherButton} ${
                    launcherPlacement === 'floating' ? classes.floatingLauncher : classes.embeddedLauncher
                }`}
                onClick={this.toggleChat}
                onKeyDown={this.handleLauncherKeyDown}
                onMouseEnter={this.handleLauncherPointerIn}
                onMouseLeave={this.handleLauncherPointerOut}
                onFocus={this.handleLauncherPointerIn}
                onBlur={this.handleLauncherPointerOut}
                aria-label="Open AI Tutor"
            >
                <div className={classes.launcherStack}>
                    <div
                        className={`${classes.launcherBubbleWrap} ${bubbleWrapClass}`}
                        aria-hidden={!promoVisible}
                    >
                        <ChatBubble
                            className={classes.launcherBubbleShape}
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        />
                        <div className={classes.launcherBubbleContent}>
                            <p className={classes.launcherTitle}>AI Tutor</p>
                            <p className={classes.launcherDescription}>
                                Ask me any question about this problem or topic.
                            </p>
            <span className={classes.launcherPill}>
                                {getHelpPenaltyBadgeText(this._getChatPenaltyMode(), 'agent')}
                            </span>
                        </div>
                    </div>
                    <div className={classes.launcherAvatarRow}>
                        <OskiAvatar className={classes.launcherAvatar} aria-hidden="true" />
                    </div>
                </div>
            </button>
        );
    };

    toggleChat = () => {
        const fb = this.getFirebase();
        const sid = this.getSessionId();
        let nextVisible = false;

        this.setState(prevState => {
            const opening = !prevState.isVisible;
            nextVisible = opening;
            const needsGreeting = opening && prevState.messages.length === 0;

            if (fb?.logChatSession && sid) {
                if (opening) {
                    const delta = { chatOpenCount: increment(1), lastActivityAt: Date.now() };
                    // Record firstActionType = 'chat' only once per session
                    if (!prevState.firstChatActionRecorded) {
                        delta.firstActionType = 'chat';
                        delta.firstActionTimestampMs = Date.now();
                    }
                    fb.logChatSession(sid, delta);
                } else {
                    fb.logChatSession(sid, { chatCloseCount: increment(1), lastActivityAt: Date.now() });
                }
            }

            return {
                isVisible: opening,
                hasChatBeenOpened:
                    prevState.hasChatBeenOpened || opening || prevState.isVisible,
                firstChatActionRecorded: prevState.firstChatActionRecorded || opening,
                isLauncherHovered: opening ? false : prevState.isLauncherHovered,
                messages: needsGreeting ? this.buildGreetingMessages() : prevState.messages,
            };
        }, () => {
            if (this.props.onChatVisibilityChange) {
                this.props.onChatVisibilityChange(nextVisible);
            }
            this.props.onPromoLayoutChange?.();
        });
    };

    clearConversation = () => {
        this.activeRequestId += 1;
        const fb = this.getFirebase();
        const oldSid = this.getSessionId();
        // Attribute clear to the session that was active, then start a fresh one.
        if (fb?.logChatSession && oldSid) {
            fb.logChatSession(oldSid, { clearedCount: increment(1), lastActivityAt: Date.now() });
        }
        agentHelper.initializeSession();
        // Problem will not remount, so write create metadata for the new session here.
        const sid = this.getSessionId();
        const lesson = this.props.lesson;
        if (fb?.logChatSession && sid && agentHelper.needsSessionMetaWrite()) {
            fb.logChatSession(
                sid,
                agentHelper.buildChatSessionCreatePayload({
                    sessionId: sid,
                    lesson,
                    oats_user_id: this.context?.userID || null,
                    lms_user_id: this.context?.user?.user_id || null,
                    course_id: this.context?.user?.course_id || null,
                    course_name: this.context?.user?.course_name || lesson?.courseName || null,
                    course_code: this.context?.user?.course_code || null,
                    semester: fb.addMetaData?.({})?.semester || null,
                    treatment: this.context?.getTreatment?.() ?? null,
                    siteVersion: fb.siteVersion || null,
                    siteCommitHash: process.env.REACT_APP_COMMIT_HASH || null,
                    hintPenaltyMode: getHintPenaltyMode(lesson),
                    chatPenaltyMode: this._getChatPenaltyMode(),
                })
            );
            agentHelper.markSessionMetaWritten();
        }
        this.setState({
            messages: this.buildGreetingMessages(),
            suggestedQuestions: [],
            suggestionsCacheKey: '',
            firstChatActionRecorded: false,
            isGenerating: false,
            isTyping: false,
            currentMessage: '',
        }, this.fetchSuggestedQuestionsIfNeeded);
        this._lastPromptedProblemId = null;
    };

    handleResizeStart = (event) => {
        event.preventDefault();
        this.setState({ isResizing: true });
        
        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = this.state.chatWidth;
        const startHeight = this.state.chatHeight;
        const maxWidth = window.innerWidth * 0.95;
        const minWidth = Math.min(300, maxWidth);

        const handleMouseMove = (e) => {
            const deltaX = startX - e.clientX; // Reverse for left-side resize
            const deltaY = startY - e.clientY; // Reverse for top-side resize
            
            const newWidth = Math.max(minWidth, Math.min(startWidth + deltaX, maxWidth));
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

    handleSendMessage = async (messageOverride = null) => {
        const { currentMessage } = this.state;
        const nextMessage = typeof messageOverride === 'string' ? messageOverride : currentMessage;
        
        if (!nextMessage.trim() || this.state.isGenerating) {
            if (typeof messageOverride === 'string' && this.state.isGenerating) {
                this.setState({ currentMessage: messageOverride });
            }
            return;
        }

        const userMessage = nextMessage.trim();
        const messageId = Date.now();
        const requestId = this.activeRequestId + 1;
        this.activeRequestId = requestId;

        // OnOpen: penalize only when the student actually sends a query.
        this._maybePenalizeAgentOnFirstQuery();

        // Snapshot prior turns before we append this turn's placeholders.
        // This is a copy for the LLM payload — UI state is updated separately below.
        const conversationHistory = (this.state.messages || [])
            .filter((msg) => msg?.role === 'user' || msg?.role === 'assistant')
            .map((msg) => ({
                role: msg.role,
                content: typeof msg.content === 'string' ? msg.content : '',
            }))
            .filter((msg) => msg.content.trim().length > 0);

        // Context switch: system prompt already reflects the new ITS problem, but
        // recency bias favors the old thread. Insert a role:user notice at the end
        // of history (before the new question) so the model sees the switch.
        const nextProblemId = this.props.problem?.id || null;
        const nextProblemTitle = this.props.problem?.title || nextProblemId || 'a new problem';
        if (
            this._lastPromptedProblemId &&
            nextProblemId &&
            this._lastPromptedProblemId !== nextProblemId
        ) {
            conversationHistory.push({
                role: 'user',
                content:
                    `We have switched to a new problem: ${nextProblemTitle}. ` +
                    `Earlier messages in this chat were about a different problem — ` +
                    `treat this as a fresh problem context going forward.`,
            });
        }
        if (nextProblemId) {
            this._lastPromptedProblemId = nextProblemId;
        }
        
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
        // Snapshot once at turn start so user + assistant history rows stay aligned
        // even if the student changes step while the reply streams.
        const turnProblemId = problemContext?.problemID || null;
        const turnStepId = problemContext?.currentStep?.id || null;
        const studentState = this.getStudentState();
        const { text, figureUrls } = this.extractConceptExplorationInput(userMessage, problemContext);
        const images = await this.fetchFiguresAsBase64(figureUrls);
        const extracted = {
            text,
            images,
            // Forward experiment condition + lesson id to Lambda so it can be
            // persisted in CloudWatch + S3 transcripts.
            condition: this.props.condition,
            lessonId: this.props.lesson?.id,
        };

        const chatPrompt = this.props.lesson?.chat_prompt || 'PROMPTv2.txt';
        const chatDisplayMode = this.props.lesson?.chat_display_mode ?? 'Off';
        const chatPenaltyMode = this._getChatPenaltyMode();
        const chatModel = resolveChatModel(this.props.lesson);

        const assistantMessageId = `assistant-${messageId}`;
        const turnStart = Date.now();

        // Send to agent
        try {
            await agentHelper.sendMessage(
                userMessage,
                problemContext,
                studentState,
                extracted,
                chatPrompt,
                chatDisplayMode,
                chatPenaltyMode,
                {
                    onTurnStarted: (turnId) => {
                        const fb = this.getFirebase();
                        const sid = this.getSessionId();
                        if (fb?.logChatMessage && sid) {
                            fb.logChatMessage(sid, {
                                turnId,
                                role: 'user',
                                content: userMessage,
                                imagesCount: images.length,
                                problemId: turnProblemId,
                                stepId: turnStepId,
                                // Same hints that were sent in studentState for the prompt.
                                hintStepId: studentState?.hintStepId || turnStepId,
                                hintsUsed: Array.isArray(studentState?.hintsUsed)
                                    ? studentState.hintsUsed
                                    : [],
                                hintsUsedCount: Array.isArray(studentState?.hintsUsed)
                                    ? studentState.hintsUsed.length
                                    : 0,
                                chatPrompt,
                                chatDisplayMode,
                                chatPenaltyMode,
                                chatModel,
                                timestampMs: Date.now(),
                            });
                        }
                        if (fb?.logChatSession && sid) {
                            fb.logChatSession(sid, { messageCountUser: increment(1), lastActivityAt: Date.now() });
                        }
                    },
                    onChunkReceived: (partialResponse) => {
                        if (requestId !== this.activeRequestId) {
                            return;
                        }
                        this.setState(prevState => ({
                            messages: prevState.messages.map(msg =>
                                msg.id === assistantMessageId
                                    ? { ...msg, content: partialResponse }
                                    : msg
                            )
                        }), () => {
                            // Follow the streaming reply to the bottom (ChatGPT-style)
                            this.scrollToBottom(true);
                        });
                    },
                    onSuccessfulCompletion: (fullResponse) => {
                        if (requestId !== this.activeRequestId) {
                            return;
                        }
                        const resolvedResponse = (fullResponse || '').trim()
                            || "Sorry, I didn't get a response. Please try again.";
                        this.setState(prevState => ({
                            messages: prevState.messages.map(msg =>
                                msg.id === assistantMessageId
                                    ? { ...msg, content: resolvedResponse, isGenerating: false }
                                    : msg
                            ),
                            isGenerating: false,
                            isTyping: false
                        }), () => {
                            this.scrollToBottom(true);
                        });
                        const fb = this.getFirebase();
                        const sid = this.getSessionId();
                        if (fb?.logChatMessage && sid) {
                            fb.logChatMessage(sid, {
                                turnId: agentHelper.getTurnId(),
                                role: 'assistant',
                                content: resolvedResponse,
                                latencyMs: Date.now() - turnStart,
                                responseCharCount: resolvedResponse.length,
                                problemId: turnProblemId,
                                stepId: turnStepId,
                                chatPrompt,
                                chatDisplayMode,
                                chatPenaltyMode,
                                chatModel,
                                timestampMs: Date.now(),
                            });
                        }
                        if (fb?.logChatSession && sid) {
                            fb.logChatSession(sid, { messageCountAssistant: increment(1), lastActivityAt: Date.now() });
                        }
                        this._maybeJudgeAgentAnswerReveal(resolvedResponse);
                    },
                    onError: (error) => {
                        if (requestId !== this.activeRequestId) {
                            return;
                        }
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
                        }), () => {
                            this.scrollToBottom(true);
                        });
                        const fb = this.getFirebase();
                        const sid = this.getSessionId();
                        if (fb?.logChatSession && sid) {
                            fb.logChatSession(sid, { errorCount: increment(1), lastActivityAt: Date.now() });
                        }
                    }
                },
                conversationHistory,
                chatModel
            );
        } catch (error) {
            // Error already handled in callbacks
        }
    };

    handleSuggestedQuestionClick = (question) => {
        const cleanQuestion = (question || '').trim();
        if (!cleanQuestion) return;

        if (this.props.onSuggestedQuestionClick) {
            this.props.onSuggestedQuestionClick(cleanQuestion);
            return;
        }

        if (this.state.isGenerating) {
            this.setState({ currentMessage: cleanQuestion });
            return;
        }

        this.handleSendMessage(cleanQuestion);
    };

    renderSuggestedQuestions = (questions, loadingSuggestions) => {
        const { classes } = this.props;

        if (!this.props.showSuggestedQuestions || (!loadingSuggestions && questions.length === 0)) {
            return null;
        }

        return (
            <div className={classes.suggestions}>
                <div className={classes.suggestionsTitle}>
                    {loadingSuggestions ? 'Finding helpful questions...' : 'Suggested questions'}
                </div>
                {questions.length > 0 && (
                    <div className={classes.suggestionList}>
                        {questions.map((question, index) => (
                            <button
                                key={`${question}-${index}`}
                                type="button"
                                className={classes.suggestionChip}
                                onClick={() => this.handleSuggestedQuestionClick(question)}
                                disabled={loadingSuggestions}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
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
        const imageFilenamePattern = /\.(gif|jpe?g|png|webp)$/i;
        if (problemID) {
            const figTokenRegex = /##([^\s#\n]+)/g;
            let m;
            while ((m = figTokenRegex.exec(combined)) !== null) {
                const filename = (m[1] || '').trim();
                if (filename && imageFilenamePattern.test(filename)) {
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

                const contentType = (res.headers.get('content-type') || '')
                    .split(';')[0]
                    .trim()
                    .toLowerCase();
                if (!VISION_IMAGE_MIME_TYPES.has(contentType)) {
                    throw new Error(`Unsupported content-type: ${contentType || 'unknown'}`);
                }

                const blob = await res.blob();
                if (!VISION_IMAGE_MIME_TYPES.has((blob.type || '').toLowerCase())) {
                    throw new Error(`Unsupported blob type: ${blob.type || 'unknown'}`);
                }

                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error('read failed'));
                    reader.readAsDataURL(blob);
                });

                if (!isVisionSafeImageDataUrl(dataUrl)) {
                    throw new Error('Generated data URL is not a supported vision image');
                }

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
            // Step docs use `id` (e.g. aaac80bvis1a), not `stepId`
            id: activeStepData.step?.id || null,
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

        // Derive hints used for the active step (manual hints only).
        // This is the same payload agent-logic formats into {hintsUsed} in the prompt.
        let hintsUsed = [];
        let hintStepId = activeStepData?.step?.id || null;
        if (hintUsageByStep && Number.isInteger(stepIndex)) {
            const usage = hintUsageByStep[stepIndex];
            if (usage?.stepId) {
                hintStepId = usage.stepId;
            }
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
            hintStepId,
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
        const { classes, responsive } = this.props;
        const isMobile = responsive?.isMobile ?? false;
        const {
            isVisible,
            messages,
            currentMessage,
            isGenerating,
            chatWidth,
            chatHeight,
            suggestedQuestions,
            isLoadingSuggestedQuestions,
        } = this.state;
        const mode = this.props.mode || 'floating';
        const allowEmbeddedClose = this.props.allowEmbeddedClose === true;
        const isChatVisible = (mode === 'embedded' && !allowEmbeddedClose) || isVisible;
        const isResizablePanel = !isMobile && (mode === 'floating' || allowEmbeddedClose);
        const useMobileSheet = isMobile && (mode === 'floating' || (mode === 'embedded' && allowEmbeddedClose));
        const questions = this.props.suggestedQuestions || suggestedQuestions;
        const loadingSuggestions = this.props.isLoadingSuggestedQuestions ?? isLoadingSuggestedQuestions;
        const showEmbeddedHeader = mode === 'embedded' && this.props.showEmbeddedHeader !== false;
        const topContent = this.props.topContent || null;
        const afterMessagesContent = this.props.afterMessagesContent || null;
        const beforeInputContent = this.props.beforeInputContent || null;
        const embeddedHeight = this.props.embeddedHeight || '100%';
        const header = (
            <div
                className={classes.chatHeader}
                {...(useMobileSheet ? { 'data-sheet-drag-handle': true } : {})}
            >
                <div className={classes.chatTitle}>
                    <OskiAvatar className={classes.avatarIcon} aria-label="Oski" />
                    <Typography variant="subtitle1">Oski • AI Tutor</Typography>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {(mode !== 'embedded' || allowEmbeddedClose) && (
                        <IconButton
                            size="small"
                            onClick={this.toggleChat}
                            title="Close chat"
                            style={{ color: 'white' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                </div>
            </div>
        );

        if (useMobileSheet) {
            return (
                <>
                    {!isChatVisible && this.renderLauncher()}
                    <MobileBottomSheet
                        open={isChatVisible}
                        onClose={this.toggleChat}
                        height={MOBILE_CHAT_SHEET_HEIGHT}
                        showHeader={false}
                        handleMode="content"
                    >
                        <Card
                            ref={this.chatContainerRef}
                            className={`${classes.chatContainer} ${classes.chatContainerSheet}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                maxWidth: 'none',
                                maxHeight: 'none',
                                minWidth: 0,
                                minHeight: 0,
                                position: 'relative',
                                borderRadius: 0,
                                boxShadow: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {showEmbeddedHeader && header}
                            {topContent}
                            {mode === 'floating' && header}
                            <>
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
                                    {afterMessagesContent}
                                    <div ref={this.messagesEndRef} />
                                </div>

                                <div className={classes.chatInput}>
                                    {beforeInputContent}
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
                                            disableRipple
                                            disableFocusRipple
                                        >
                                            <SendArrowIcon className={classes.sendIcon} aria-label="Send" />
                                        </IconButton>
                                    </div>
                                    {this.renderSuggestedQuestions(questions, loadingSuggestions)}
                                </div>
                            </>
                        </Card>
                    </MobileBottomSheet>
                </>
            );
        }

        if (!isChatVisible) {
            return this.renderLauncher();
        }

        // Chat window
        const chatPanel = (
            <Card 
                ref={this.chatContainerRef}
                className={`${classes.chatContainer} ${useMobileSheet ? classes.chatContainerSheet : ''}`}
                style={{
                    width: useMobileSheet
                        ? '100%'
                        : mode === 'embedded'
                        ? (allowEmbeddedClose ? chatWidth : '100%')
                        : chatWidth,
                    height: useMobileSheet
                        ? '100%'
                        : mode === 'embedded'
                        ? (allowEmbeddedClose ? chatHeight : embeddedHeight)
                        : chatHeight,
                    position: useMobileSheet
                        ? 'fixed'
                        : mode === 'embedded'
                        ? (allowEmbeddedClose ? 'fixed' : 'relative')
                        : undefined,
                    bottom: useMobileSheet
                        ? 0
                        : mode === 'embedded'
                        ? (allowEmbeddedClose ? 20 : 'auto')
                        : undefined,
                    left: useMobileSheet ? 0 : undefined,
                    right: useMobileSheet
                        ? 0
                        : mode === 'embedded'
                        ? (allowEmbeddedClose ? 20 : 'auto')
                        : undefined,
                    borderRadius: useMobileSheet ? '20px 20px 0 0' : (mode === 'embedded' ? 12 : undefined),
                    boxShadow: useMobileSheet
                        ? '0 -10px 40px rgba(16, 24, 40, 0.16)'
                        : (mode === 'embedded' ? '0 8px 32px rgba(0, 0, 0, 0.12)' : undefined),
                    minWidth: useMobileSheet || mode === 'embedded' ? 0 : undefined,
                    minHeight: useMobileSheet || mode === 'embedded' ? 0 : undefined,
                    maxWidth: useMobileSheet
                        ? '100vw'
                        : mode === 'embedded'
                        ? (allowEmbeddedClose ? '95vw' : 'none')
                        : undefined,
                    maxHeight: useMobileSheet
                        ? MOBILE_CHAT_SHEET_HEIGHT
                        : mode === 'embedded'
                        ? (allowEmbeddedClose ? '90vh' : 'none')
                        : undefined,
                }}
            >
                {showEmbeddedHeader && header}
                {topContent}
                {/* Resize handle */}
                {isResizablePanel && (
                    <div 
                        className={classes.resizeHandle}
                        onMouseDown={this.handleResizeStart}
                        title="Drag to resize"
                    />
                )}

                {mode === 'floating' && (
                    header
                )}

                <>
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
                            {afterMessagesContent}
                            <div ref={this.messagesEndRef} />
                        </div>

                        <div className={classes.chatInput}>
                            {beforeInputContent}
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
                                    disableRipple
                                    disableFocusRipple
                                >
                                    <SendArrowIcon className={classes.sendIcon} aria-label="Send" />
                                </IconButton>
                            </div>
                            {this.renderSuggestedQuestions(questions, loadingSuggestions)}
                        </div>
                </>
            </Card>
        );

        return chatPanel;
    }
}

export default withStyles(styles)(withResponsive(AgentChatbox));