import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import ProblemCardWrapper from "./ProblemCardWrapper";
import Grid from "@material-ui/core/Grid";
import { animateScroll as scroll, Element, scroller } from "react-scroll";
import update from "../../models/BKT/BKT-brain.js";
import {
    chooseVariables,
    renderText,
} from "../../platform-logic/renderText.js";
import styles from "./common-styles.js";
import { NavLink } from "react-router-dom";
import { agentHelper } from "./AgentHelper";
import { increment } from "../Firebase";
import withTranslation from "../../util/withTranslation.js"
import lightbulbIcon from "../../assets/lightbulb.svg";
import avatar from "../../assets/avatar_default_state.svg";
import TTSPlayer from "../../util/ttsPlayer.js";
import TTSButtons from "./TTSButtons.js";
import { textToReadable } from "../../util/latexToReadable.js";

import {
    CANVAS_WARNING_STORAGE_KEY,
    MIDDLEWARE_URL,
    SHOW_NOT_CANVAS_WARNING,
    ThemeContext,
} from "../../config/config.js";
import { toast } from "react-toastify";
import to from "await-to-js";
import ToastID from "../../util/toastIds";
import Spacer from "../Spacer";
import { stagingProp } from "../../util/addStagingProperty";
import { cleanArray } from "../../util/cleanObject";

import {Accordion, AccordionSummary, AccordionDetails, Typography} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AgentIntegration from './AgentIntegration';
import StandaloneChatView from './StandaloneChatView';
import AvatarHelpPanel from './AvatarHelpPanel';

class Problem extends React.Component {
    static defaultProps = {
        autoScroll: true
      };
    static contextType = ThemeContext;

    constructor(props, context) {
        super(props);

        // const { setLanguage } = props;
        // if (props.lesson.courseName == "Matematik 4") {
        //     setLanguage('se')
        // }
        
        this.bktParams = context.bktParams;
        this.heuristic = context.heuristic;

        const giveStuFeedback = this.props.lesson?.giveStuFeedback;
        const giveStuHints = this.props.lesson?.giveStuHints;
        const keepMCOrder = this.props.lesson?.keepMCOrder;
        const giveHintOnIncorrect = this.props.lesson?.giveHintOnIncorrect;
        const keyboardType = this.props.lesson?.keyboardType;
        const doMasteryUpdate = this.props.lesson?.doMasteryUpdate;
        const unlockFirstHint = this.props.lesson?.unlockFirstHint;
        const giveStuBottomHint = this.props.lesson?.allowBottomHint;

        this.giveHintOnIncorrect = giveHintOnIncorrect != null && giveHintOnIncorrect;
        this.giveStuFeedback = giveStuFeedback == null || giveStuFeedback;
        this.keepMCOrder = keepMCOrder != null && keepMCOrder;
        this.keyboardType = keyboardType != null && keyboardType;
        this.giveStuHints = giveStuHints == null || giveStuHints;
        this.doMasteryUpdate = doMasteryUpdate == null || doMasteryUpdate;
        this.unlockFirstHint = unlockFirstHint != null && unlockFirstHint;
        this.giveStuBottomHint = giveStuBottomHint == null || giveStuBottomHint;
        this.giveDynamicHint = this.props.lesson?.allowDynamicHint;
        this.enableTTS = this.props.lesson?.allowTTS;
        this.prompt_template = this.props.lesson?.prompt_template
            ? this.props.lesson?.prompt_template
            : "";

        this.state = {
            // metaCollapsed: false,
            stepStates: {},
            firstAttempts: {},
            problemFinished: false,
            showFeedback: false,
            feedback: "",
            feedbackSubmitted: false,
            showPopup: false,
            expandedAccordion: 0,
            hintToggleTrigger: 0,
            hintToggleIndex: null,
            isHintPortalOpen: false,
            hasHintBeenOpened: false,
            isHintHovering: false,
            attemptHistory: {}, // { "Problem Title": { "Question Text": ["attempt1", "attempt2"] } }
            hintUsageByStep: {}, // { [stepIndex]: { stepId, hints: [{ id, title, text, type, viewed }] } }
            avatarHintsByStep: {},
            avatarHintStepIndex: null,
            avatarVisibleHintIndex: null,
            isAvatarHintVisible: false,
            avatarHintRequestId: 0,
            standaloneExited: false,
            firstHelpAction: null, // "chat" | "hint" — set once, used to write firstActionType
        };

        this.togglePopup = this.togglePopup.bind(this);
        this.hintPortalRef = React.createRef();
        this.stepTTSPlayers = {};

        if (this.enableTTS) {
            this.ttsPlayer = new TTSPlayer();
            this.ttsPlayer.onStateChange((playing) => this.setState({ ttsPlaying: playing }));
        }
        this.bannerRef = React.createRef();
    }

    componentDidMount() {
        const h = this.bannerRef.current?.offsetHeight || 0;
        this.setState({ bannerHeight: h });
        const { lesson } = this.props;
        document["oats-meta-courseName"] = lesson?.courseName || "";
        document["oats-meta-textbookName"] =
            lesson?.courseName
                .substring((lesson?.courseName || "").indexOf(":") + 1)
                .trim() || "";

        // query selects all katex annotation and adds aria label attribute to it
        for (const annotation of document.querySelectorAll("annotation")) {
            annotation.ariaLabel = annotation.textContent;
        }

        // Initialize shared agent session (idempotent — AgentChatbox also calls this)
        const sessionId = agentHelper.initSessionIfNeeded();

        // Write the static session metadata doc once per problem load
        const firebase = this.context?.firebase;
        if (firebase?.logChatSession && sessionId) {
            const { problem } = this.props;
            const chatDisplayMode = lesson?.chat_display_mode || 'Off';
            firebase.logChatSession(sessionId, {
                sessionId,
                oats_user_id: this.context?.userID || null,
                lms_user_id: this.context?.user?.user_id || null,
                course_id: this.context?.user?.course_id || null,
                course_name: this.context?.user?.course_name || lesson?.courseName || null,
                course_code: this.context?.user?.course_code || null,
                semester: firebase.addMetaData({}).semester || null,
                treatment: this.context?.getTreatment?.() ?? null,
                siteVersion: firebase.siteVersion || null,
                siteCommitHash: process.env.REACT_APP_COMMIT_HASH || null,
                problemId: problem?.id || null,
                lessonId: lesson?.id || null,
                chatDisplayMode,
                condition: chatDisplayMode === 'Window' ? 'window'
                    : chatDisplayMode === 'Avatar' ? 'avatar'
                    : chatDisplayMode === 'Full' ? 'full'
                    : 'off',
                chatPrompt: lesson?.chat_prompt || 'PROMPTv2.txt',
                startedAt: Date.now(),
                lastActivityAt: Date.now(),
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
            });
        }
        if (this.enableTTS) this._loadTTSAudio(this.props.problem);
    }

    componentDidUpdate(prevProps) {
        if (this.enableTTS && prevProps.problem?.id !== this.props.problem?.id) {
            this._loadTTSAudio(this.props.problem);
        }
    }

    _loadTTSAudio(problem) {
        if (!problem) return;

        // 停止并重置所有旧的 player
        if (this.ttsPlayer) {
            this.ttsPlayer.destroy();
            this.ttsPlayer = new TTSPlayer();
            this.ttsPlayer.onStateChange((playing) => this.setState({ ttsPlaying: playing }));
        }
        Object.values(this.stepTTSPlayers).forEach(p => p.destroy());
        this.stepTTSPlayers = {};
        this.setState({ ttsPlaying: false, ttsPlayingStep: -1 });

        // 加载大题音频
        this.ttsPlayer.onReady(() => this.forceUpdate());
        let segments;
        if (problem.pacedSpeech && Array.isArray(problem.pacedSpeech) && problem.pacedSpeech.length > 0) {
            segments = problem.pacedSpeech;
        } else {
            const raw = textToReadable((problem.title || "") + ". " + (problem.body || ""));
            if (raw && raw !== ".") segments = [raw];
        }
        if (segments) this.ttsPlayer.fetchAudio(segments);

        // 加载每个 step 音频
        (problem.steps || []).forEach((step, idx) => {
            let stepSegments = null;
            if (step.pacedSpeech && Array.isArray(step.pacedSpeech) && step.pacedSpeech.length > 0) {
                stepSegments = step.pacedSpeech;
            } else {
                const raw = textToReadable((step.stepTitle || "") + ". " + (step.stepBody || ""));
                if (raw && raw !== ".") stepSegments = [raw];
            }
            if (stepSegments) {
                const player = new TTSPlayer();
                player.onStateChange((playing) => this.setState({ ttsPlayingStep: playing ? idx : -1 }));
                player.onReady(() => this.forceUpdate());
                this.stepTTSPlayers[idx] = player;
                player.fetchAudio(stepSegments);
            }
        });
    }

    handleHintUsageChange = (stepIndex, usage) => {
        this.setState((prevState) => ({
            hintUsageByStep: {
                ...prevState.hintUsageByStep,
                [stepIndex]: usage,
            },
        }));
    };

    handleAvatarHintsChange = (stepIndex, payload) => {
        this.setState((prevState) => ({
            avatarHintsByStep: {
                ...prevState.avatarHintsByStep,
                [stepIndex]: payload,
            },
        }));
    };

    componentWillUnmount() {
        document["oats-meta-courseName"] = "";
        document["oats-meta-textbookName"] = "";
        if (this.ttsPlayer) this.ttsPlayer.destroy();
        Object.values(this.stepTTSPlayers).forEach(p => p.destroy());
    }

    updateCanvas = async (mastery, components) => {
        if (this.context.jwt) {
            console.debug("updating canvas with problem score");

            let err, response;
            [err, response] = await to(
                fetch(`${MIDDLEWARE_URL}/postScore`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token: this.context?.jwt || "",
                        mastery,
                        components,
                    }),
                })
            );
            if (err || !response) {
                toast.error(
                    `An unknown error occurred trying to submit this problem. If reloading does not work, please contact us.`,
                    {
                        toastId: ToastID.submit_grade_unknown_error.toString(),
                    }
                );
                console.debug(err, response);
            } else {
                if (response.status !== 200) {
                    switch (response.status) {
                        case 400:
                            const responseText = await response.text();
                            let [message, ...addInfo] = responseText.split("|");
                            if (
                                Array.isArray(addInfo) &&
                                addInfo.length > 0 &&
                                addInfo[0]
                            ) {
                                addInfo = JSON.parse(addInfo[0]);
                            }
                            switch (message) {
                                case "lost_link_to_lms":
                                    toast.error(
                                        "It seems like the link back to your LMS has been lost. Please re-open the assignment to make sure your score is saved.",
                                        {
                                            toastId:
                                                ToastID.submit_grade_link_lost.toString(),
                                        }
                                    );
                                    return;
                                case "unable_to_handle_score":
                                    toast.warn(
                                        "Something went wrong and we can't update your score right now. Your progress will be saved locally so you may continue working.",
                                        {
                                            toastId:
                                                ToastID.submit_grade_unable.toString(),
                                            closeOnClick: true,
                                        }
                                    );
                                    return;
                                default:
                                    toast.error(`Error: ${responseText}`, {
                                        closeOnClick: true,
                                    });
                                    return;
                            }
                        case 401:
                            toast.error(
                                `Your session has either expired or been invalidated, please reload the page to try again.`,
                                {
                                    toastId: ToastID.expired_session.toString(),
                                }
                            );
                            return;
                        case 403:
                            toast.error(
                                `You are not authorized to make this action. (Are you a registered student?)`,
                                {
                                    toastId: ToastID.not_authorized.toString(),
                                }
                            );
                            return;
                        default:
                            toast.error(
                                `An unknown error occurred trying to submit this problem. If reloading does not work, please contact us.`,
                                {
                                    toastId:
                                        ToastID.set_lesson_unknown_error.toString(),
                                }
                            );
                            return;
                    }
                } else {
                    console.debug("successfully submitted grade to Canvas");
                }
            }
        } else {
            const { getByKey, setByKey } = this.context.browserStorage;
            const showWarning =
                !(await getByKey(CANVAS_WARNING_STORAGE_KEY)) &&
                SHOW_NOT_CANVAS_WARNING;
            if (showWarning) {
                toast.warn(
                    "No credentials found (did you launch this assignment from Canvas?)",
                    {
                        toastId: ToastID.warn_not_from_canvas.toString(),
                        autoClose: false,
                        onClick: () => {
                            toast.dismiss(
                                ToastID.warn_not_from_canvas.toString()
                            );
                        },
                        onClose: () => {
                            setByKey(CANVAS_WARNING_STORAGE_KEY, 1);
                        },
                    }
                );
            } else {
                // can ignore
            }
        }
    };

    answerMade = (cardIndex, kcArray, isCorrect, attemptedAnswer, questionText) => {
        const { stepStates, firstAttempts, attemptHistory } = this.state;
        const { lesson, problem } = this.props;

        console.debug(`answer made and is correct: ${isCorrect}`);

        // Record attempt history
        if (attemptedAnswer && questionText) {
            const problemTitle = problem.title;
            const updatedHistory = { ...attemptHistory };
            
            if (!updatedHistory[problemTitle]) {
                updatedHistory[problemTitle] = {};
            }
            
            if (!updatedHistory[problemTitle][questionText]) {
                updatedHistory[problemTitle][questionText] = [];
            }
            
            updatedHistory[problemTitle][questionText].push(attemptedAnswer);
            
            this.setState({ attemptHistory: updatedHistory });
        }

        if (stepStates[cardIndex] === true) {
            return;
        }

        if (stepStates[cardIndex] == null) {
            if (kcArray == null) {
                kcArray = [];
            }
            const _kcArray = cleanArray(kcArray);
            for (const kc of _kcArray) {
                if (!this.bktParams[kc]) {
                    console.debug("invalid KC", kc);
                    this.context.firebase.submitSiteLog(
                        "site-warning",
                        "missing-kc",
                        {
                            kc,
                            cardIndex,
                        },
                        this.context.problemID
                    );
                    continue;
                }
                if (this.doMasteryUpdate && (firstAttempts[cardIndex] === undefined || firstAttempts[cardIndex] === false)) {
                    firstAttempts[cardIndex] = true;
                    update(this.bktParams[kc], isCorrect);
                }
            }
        }

        if (!this.context.debug) {
            const objectives = Object.keys(lesson.learningObjectives);
            objectives.unshift(0);
            let score = objectives.reduce((x, y) => {
                return x + this.bktParams[y].probMastery;
            });
            score /= objectives.length - 1;
            //console.log(this.context.studentName + " " + score);
            this.props.displayMastery(score);

            const relevantKc = {};
            Object.keys(lesson.learningObjectives).forEach((x) => {
                relevantKc[x] = this.bktParams[x].probMastery;
            });

            this.updateCanvas(score, relevantKc);
        }

        const nextStepStates = {
            ...stepStates,
            [cardIndex]: isCorrect,
        };

        const giveStuFeedback = this.giveStuFeedback;
        const numSteps = problem.steps.length;

        if (!giveStuFeedback) {
            const numAttempted = Object.values(nextStepStates).filter(
                (stepState) => stepState != null
            ).length;
            // console.log("num attempted: ", numAttempted);
            // console.log("num steps: ", numSteps);
            // console.log("step states: ", Object.values(nextStepStates));
            if (isCorrect && cardIndex + 1 < numSteps) {
                if (this.props.autoScroll) {
                    scroller.scrollTo((cardIndex + 1).toString(), {
                        duration: 350,
                        smooth: true,
                        offset: -80,
                    });
                }
                this.setState({
                    stepStates: nextStepStates,
                    expandedAccordion: cardIndex + 1,
                    hintToggleIndex: null,
                    isHintPortalOpen: false,
                });
            } else {
                this.setState({
                    stepStates: nextStepStates,
                });
            }
            if (numAttempted === numSteps) {
                this.setState({
                    problemFinished: true,
                    stepStates: nextStepStates,
                });
            }
            // don't attempt to auto scroll to next step
            return;
        }

        if (isCorrect) {
            const numCorrect = Object.values(nextStepStates).filter(
                (stepState) => stepState === true
            ).length;
            if (numSteps !== numCorrect) {
                console.debug(
                    "not last step so not done w/ problem, step states:",
                    nextStepStates
                );
                if (this.props.autoScroll) {
                    scroller.scrollTo((cardIndex + 1).toString(), {
                        duration: 350,
                        smooth: true,
                        offset: -80,
                    });
                }
                this.setState({
                    stepStates: nextStepStates,
                    expandedAccordion: cardIndex + 1,
                    hintToggleIndex: null,
                    isHintPortalOpen: false,
                });
            } else {
                this.setState({
                    problemFinished: true,
                    stepStates: nextStepStates,
                });
            }
        }
    };

    /**
     * Computes the current BKT mastery for logging. Reads the live (in-place
     * mutated) bktParams, so call this AFTER answerMade has applied the update
     * for the step to capture the post-step mastery.
     * @param {string[]} kcArray knowledge components for the specific step
     * @returns {{ masteryScore: number|null, kcMastery: Object }}
     */
    getMasteryData = (kcArray = []) => {
        const { lesson } = this.props;
        const objectives = Object.keys(lesson?.learningObjectives || {});

        let masteryScore = null;
        if (objectives.length) {
            const sum = objectives.reduce(
                (acc, kc) => acc + (this.bktParams[kc]?.probMastery ?? 0),
                0
            );
            masteryScore = sum / objectives.length;
        }

        const kcMastery = {};
        cleanArray(kcArray || []).forEach((kc) => {
            if (this.bktParams[kc]) {
                kcMastery[kc] = this.bktParams[kc].probMastery;
            }
        });

        return { masteryScore, kcMastery };
    };

    clickNextProblem = async () => {
        scroll.scrollToTop({ duration: 900, smooth: true });

        await this.props.problemComplete(this.context);

        this.setState({
            stepStates: {},
            firstAttempts: {},
            problemFinished: false,
            feedback: "",
            feedbackSubmitted: false,
        });
    };

    submitFeedback = () => {
        const problem = this.state.currProblem;

        console.debug("problem when submitting feedback", problem);
        this.context.firebase.submitFeedback(
            problem.id,
            this.state.feedback,
            this.state.problemFinished,
            chooseVariables(problem.variabilization, this.props.seed),
            problem.courseName,
            problem.steps,
            problem.lesson
        );
        this.setState({ feedback: "", feedbackSubmitted: true });
    };

    toggleFeedback = () => {
        scroll.scrollToBottom({ duration: 500, smooth: true });
        this.setState((prevState) => ({
            showFeedback: !prevState.showFeedback,
        }));
    };
    
    togglePopup = () => {
        console.log("Toggling popup visibility");
        this.setState((prevState) => ({
          showPopup: !prevState.showPopup,
        }));
    };

    _getNextDebug = (offset) => {
        return (
            this.context.problemIDs[
                this.context.problemIDs.indexOf(this.props.problem.id) + offset
            ] || "/"
        );
    };

    getOerLicense = () => {
        const { lesson, problem } = this.props;
        var oerArray, licenseArray;
        var oerLink, oerName;
        var licenseLink, licenseName;
	try {
        if (problem.oer != null && problem.oer.includes(" <")) {
            oerArray = problem.oer.split(" <");
        } else if (lesson.courseOER != null && lesson.courseOER.includes(" ")) {
            oerArray = lesson.courseOER.split(" <");
        } else {
            oerArray = ["", ""];
        }
	} catch(error) {
		oerArray = ["", ""];
	}

        oerLink = oerArray[0];
        oerName = oerArray[1].substring(0, oerArray[1].length - 1);

        try {
            if (problem.license != null && problem.license.includes(" ")) {
                licenseArray = problem.license.split(" <");
            } else if (
                lesson.courseLicense != null &&
                lesson.courseLicense.includes(" ")
            ) {
                licenseArray = lesson.courseLicense.split(" <");
            } else {
                licenseArray = ["", ""];
            }
        } catch(error) {
            licenseArray = ["", ""];
        }
        licenseLink = licenseArray[0];
        licenseName = licenseArray[1].substring(0, licenseArray[1].length - 1);
        return [oerLink, oerName, licenseLink, licenseName];
    };

    accordionChange = (panel) => (event, isExpanded) => {
        this.setState(() => ({
            expandedAccordion: isExpanded ? panel : null,
            hintToggleIndex: null,
            isHintPortalOpen: false,
            isAvatarHintVisible: false,
        }));
    };

    getAvatarHintTargetStepIndex = () => {
        const activeStepData = this.getActiveStepData();
        if (activeStepData && Number.isInteger(activeStepData.stepIndex)) {
            return activeStepData.stepIndex;
        }
        return 0;
    };

    getNextAvatarHintIndex = (stepIndex) => {
        const payload = this.state.avatarHintsByStep[stepIndex];
        const hints = payload?.hints || [];
        const currentIndex = Number.isInteger(this.state.avatarVisibleHintIndex)
            ? this.state.avatarVisibleHintIndex
            : -1;
        const nextUnviewedIndex = hints.findIndex(
            (hint, index) => index > currentIndex && !hint.viewed
        );

        if (nextUnviewedIndex >= 0) {
            return nextUnviewedIndex;
        }

        if (currentIndex + 1 < hints.length) {
            return currentIndex + 1;
        }

        if (hints.length > 0) {
            return Math.min(Math.max(currentIndex, 0), hints.length - 1);
        }

        return null;
    };

    handleHintAvatarClick = (event) => {
        const chatDisplayMode = this.props.lesson?.chat_display_mode || 'Off';

        if (chatDisplayMode !== 'Avatar') {
            if (
                event &&
                this.state.isHintPortalOpen &&
                this.hintPortalRef?.current &&
                this.hintPortalRef.current.contains(event.target)
            ) {
                return;
            }

            this.setState((prevState, props) => {
                const steps = props.problem?.steps || [];

                if (steps.length === 0) {
                    return null;
                }

                const hasExpanded = prevState.expandedAccordion !== null;
                const targetIndex = hasExpanded
                    ? prevState.expandedAccordion
                    : this.getAvatarHintTargetStepIndex();

                return {
                    hintToggleTrigger: prevState.hintToggleTrigger + 1,
                    hintToggleIndex: targetIndex,
                    expandedAccordion: hasExpanded
                        ? prevState.expandedAccordion
                        : targetIndex,
                    isHintPortalOpen: false,
                    hasHintBeenOpened: true,
                };
            });
            return;
        }

        this.setState((prevState, props) => {
            const steps = props.problem?.steps || [];

            if (steps.length === 0) {
                return null;
            }

            const targetIndex = this.getAvatarHintTargetStepIndex();
            const currentHintIndex = prevState.avatarVisibleHintIndex;

            if (Number.isInteger(currentHintIndex) && !prevState.isAvatarHintVisible) {
                return {
                    avatarHintStepIndex: prevState.avatarHintStepIndex ?? targetIndex,
                    isAvatarHintVisible: true,
                    hintToggleIndex: prevState.avatarHintStepIndex ?? targetIndex,
                    expandedAccordion: prevState.avatarHintStepIndex ?? targetIndex,
                };
            }

            const nextHintIndex = this.getNextAvatarHintIndex(targetIndex);

            if (nextHintIndex == null) {
                return null;
            }

            return {
                avatarHintStepIndex: targetIndex,
                avatarVisibleHintIndex: nextHintIndex,
                isAvatarHintVisible: true,
                avatarHintRequestId: prevState.avatarHintRequestId + 1,
                hintToggleIndex: targetIndex,
                expandedAccordion: targetIndex,
            };
        });
    };

    handleAvatarHintPrevious = () => {
        this.setState((prevState) => {
            const currentIndex = prevState.avatarVisibleHintIndex;
            if (!Number.isInteger(currentIndex) || currentIndex <= 0) {
                return null;
            }

            return {
                avatarVisibleHintIndex: currentIndex - 1,
                isAvatarHintVisible: true,
            };
        });
    };

    handleAvatarHintNext = () => {
        this.setState((prevState) => {
            const stepIndex = prevState.avatarHintStepIndex ?? this.getAvatarHintTargetStepIndex();
            const payload = prevState.avatarHintsByStep[stepIndex];
            const hints = payload?.hints || [];
            const currentIndex = Number.isInteger(prevState.avatarVisibleHintIndex)
                ? prevState.avatarVisibleHintIndex
                : -1;
            const nextIndex = currentIndex + 1;

            if (nextIndex < 0 || nextIndex >= hints.length) {
                return null;
            }

            return {
                avatarHintStepIndex: stepIndex,
                avatarVisibleHintIndex: nextIndex,
                isAvatarHintVisible: true,
                avatarHintRequestId: prevState.avatarHintRequestId + 1,
                hintToggleIndex: stepIndex,
                expandedAccordion: stepIndex,
            };
        });
    };

    handleAvatarHintHide = () => {
        this.setState({ isAvatarHintVisible: false });
    };

    handleHintAvatarKeyDown = (event) => {
        if (
            (event.key === "Enter" || event.key === " ") &&
            event.target === event.currentTarget
        ) {
            event.preventDefault();
            this.handleHintAvatarClick(event);
        }
    };

    handleHintToggleFromStep = (index, isOpen) => {
        const firebase = this.context?.firebase;
        const sessionId = agentHelper.getSessionId();

        this.setState((prevState) => {
            const isFirst = prevState.firstHelpAction === null;
            const firstHelpAction = isFirst && isOpen ? 'hint' : prevState.firstHelpAction;

            if (firebase?.logChatSession && sessionId) {
                const delta = isOpen
                    ? { hintOpenCount: increment(1), lastActivityAt: Date.now() }
                    : { hintCloseCount: increment(1), lastActivityAt: Date.now() };

                if (isFirst && isOpen) {
                    delta.firstActionType = 'hint';
                    delta.firstActionTimestampMs = Date.now();
                }

                firebase.logChatSession(sessionId, delta);
            }

            return {
                isHintPortalOpen: isOpen,
                hintToggleIndex: isOpen ? index : null,
                hasHintBeenOpened: isOpen ? true : prevState.hasHintBeenOpened,
                firstHelpAction,
            };
        });
    };

    handleHintHoverStart = () => {
        this.setState({ isHintHovering: true });
    };

    handleHintHoverEnd = () => {
        this.setState({ isHintHovering: false });
    };

    render() {
        const { translate } = this.props;
        const { classes, problem, seed, compactHeader, hideHintPanel } = this.props;
        const [oerLink, oerName, licenseLink, licenseName] =
            this.getOerLicense();
        const { isHintPortalOpen, hasHintBeenOpened, isHintHovering } = this.state;
        const showHintPromoBubble =
            !isHintPortalOpen && (!hasHintBeenOpened || isHintHovering);
        const showHintCardChrome = isHintPortalOpen || showHintPromoBubble;
        if (problem == null) {
            return <div></div>;
        }

        const chatDisplayMode = this.props.lesson?.chat_display_mode || 'Off';
        const avatarHintStepIndex = this.state.avatarHintStepIndex ?? this.getAvatarHintTargetStepIndex();
        const avatarHintPayload = this.state.avatarHintsByStep[avatarHintStepIndex];
        const avatarHints = avatarHintPayload?.hints || [];
        const avatarVisibleHint = this.state.isAvatarHintVisible &&
            Number.isInteger(this.state.avatarVisibleHintIndex)
            ? avatarHints[this.state.avatarVisibleHintIndex]
            : null;
        const avatarHasHints = avatarHints.length > 0;
        const avatarHasAnotherHint =
            avatarHasHints &&
            (!Number.isInteger(this.state.avatarVisibleHintIndex) ||
                this.state.avatarVisibleHintIndex < avatarHints.length - 1);
        const avatarHasPreviousHint =
            Number.isInteger(this.state.avatarVisibleHintIndex) &&
            this.state.avatarVisibleHintIndex > 0;
        const avatarHintButtonLabel = this.state.isAvatarHintVisible
            ? "Hide hint"
            : Number.isInteger(this.state.avatarVisibleHintIndex)
                ? "Show hint"
                : "Get a hint";
        const avatarHintRequest = {
            requestId: this.state.avatarHintRequestId,
            stepIndex: this.state.avatarHintStepIndex,
            hintIndex: this.state.avatarVisibleHintIndex,
        };
        if (chatDisplayMode === 'Full' && !this.state.standaloneExited) {
            return (
                <StandaloneChatView
                    lesson={this.props.lesson}
                    problem={problem}
                    seed={seed}
                    problemVars={this.props.problemVars}
                    stepStates={this.state.stepStates}
                    bktParams={this.bktParams}
                    getActiveStepData={this.getActiveStepData}
                    attemptHistory={this.state.attemptHistory}
                    user={this.props.user}
                    lessonMasteryMap={this.props.lessonMasteryMap}
                    hintUsageByStep={this.state.hintUsageByStep}
                    condition="standalone_gpt_only"
                    onExit={() => this.setState({ standaloneExited: true })}
                />
            );
        }

        const drawerOpen = this.props.drawerOpen;
        const layoutGap = drawerOpen ? 3 : 4;
        // const toggleMetaCollapsed = () =>
        //     this.setState((prevState) => ({
        //         metaCollapsed: !prevState.metaCollapsed,
        //     }));
        const hintStickTop = "calc(50vh - 120px)";
        const hintDisplayStyle = {
            position: "sticky",
            top: hintStickTop,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            width: "100%",
            maxWidth: "100%",
            maxHeight: "70vh",
        };
        // Yellow box
        const bubbleContainerStyle = {
            position: "fixed",
            // top: metaCollapsed ? 410 : this.state.bannerHeight + 330,
            top: this.state.bannerHeight + 330,
            right: 28,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            width: "100%",
            pointerEvents: "none",
        };

        const hintThemePrimary = "#4c7d9f";
        const hintThemePrimaryDark = "#3f7091";
        const hintThemeSurface = "#eef4fa";
        const hintThemePale = "#a3c5de";
        const hintThemeAccent = "#EF9F27";
        const hintThemeAccentSoft = "#FAEEDA";
        const hintThemeAccentHover = "#F5DBA7";
        const hintThemeAccentIcon = "#854F0B";

        const hintCardMaxWidth = isHintPortalOpen 
            ? (drawerOpen ? 340 : 380)  // Wider when drawer is closed
            : (drawerOpen ? 300 : 340);

        const hintCardWrapperStyle = {
            position: "relative",
            width: "100%",
            // maxWidth: isHintPortalOpen ? 340 : 300,
            maxWidth: hintCardMaxWidth,
            paddingTop: 34,
            boxSizing: "border-box",
            transition: "max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "pointer",
            pointerEvents: "auto", 
        };

        const hintCardStyle = {
            background: isHintPortalOpen ? hintThemeSurface : "transparent",
            color: "#222",
            border: showHintCardChrome ? `1px solid ${hintThemePrimary}` : "none",
            padding: isHintPortalOpen
                ? "8px 10px"
                : showHintPromoBubble
                    ? "14px 10px 6px"
                    : 0,
            borderRadius: 8,
            boxShadow: isHintPortalOpen ? "0 4px 16px rgba(76, 125, 159, 0.14)" : "none",
            position: "relative",
            width: "100%",
            // Natural height up to 380px, then scroll
            maxHeight: isHintPortalOpen ? 340 : "none",
            overflowY: isHintPortalOpen ? "auto" : "visible",
            textAlign: "left",
            zIndex: 2,
            fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            boxSizing: "border-box",
        };

        const hintPortalStyle = isHintPortalOpen ? {
            width: "100%",
            boxSizing: "border-box",
            marginTop: 8,
        } : {
            display: "none",
        };

        return (
            <>
                <Grid
                    container
                    spacing={layoutGap}
                    alignItems="flex-start"
                    style={{ width: "100%", margin: 0 }}
                >
                    <Grid
                        item
                        xs={12}
                        md={hideHintPanel ? 12 : (drawerOpen ? 8 : 7)}
                    >
                        <div className={classes.prompt} role={"banner"}>
                            <Card className={classes.titleCard}>

                                <div
                                    style = {{
                                        backgroundColor: "#EBF4FA",
                                        padding: 20
                                    }}
                                >
                                    <div className={classes.problemHeader}>
                                        <span style={{ minWidth: 0 }}>
                                            {renderText(
                                                problem.title,
                                                problem.id,
                                                chooseVariables(
                                                    problem.variabilization,
                                                    seed
                                                ),
                                                this.context
                                            )}
                                        </span>
                                        {this.enableTTS && this.ttsPlayer && (
                                            <TTSButtons
                                                playing={this.state.ttsPlaying}
                                                onToggle={() => this.ttsPlayer.togglePlayPause()}
                                                onReplay={() => this.ttsPlayer.replay()}
                                                disabled={!this.ttsPlayer.isReady()}
                                            />
                                        )}
                                    </div>
                                </div>

                                <CardContent
                                    {...stagingProp({
                                        "data-selenium-target": "problem-header",
                                    })}
                                    style={{
                                        padding: 20
                                    }}
                                >

                                    <div className={classes.problemBody}>
                                        {renderText(
                                            problem.body,
                                            problem.id,
                                            chooseVariables(
                                                problem.variabilization,
                                                seed
                                            ),
                                            this.context
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            <Spacer height={8} />
                        </div>
                    <div width="100%">
                        {this.context.debug ? (
                            <Grid container spacing={0}>
                                <Grid item xs={2} key={0} />
                                <Grid item xs={2} key={1}>
                                    <NavLink
                                        activeClassName="active"
                                        className="link"
                                        to={this._getNextDebug(-1)}
                                        type="menu"
                                        style={{ marginRight: "10px" }}
                                    >
                                        <Button
                                            className={classes.button}
                                            style={{ width: "100%" }}
                                            size="small"
                                            onClick={() =>
                                                (this.context.needRefresh = true)
                                            }
                                        >
                                            {translate('problem.PreviousProblem')}
                                        </Button>
                                    </NavLink>
                                </Grid>
                                <Grid item xs={4} key={2} />
                                <Grid item xs={2} key={3}>
                                    <NavLink
                                        activeClassName="active"
                                        className="link"
                                        to={this._getNextDebug(1)}
                                        type="menu"
                                        style={{ marginRight: "10px" }}
                                    >
                                        <Button
                                            className={classes.button}
                                            style={{ width: "100%" }}
                                            size="small"
                                            onClick={() =>
                                                (this.context.needRefresh = true)
                                            }
                                        >
                                           {translate('problem.NextProblem')}
                                        </Button>
                                    </NavLink>
                                </Grid>
                                <Grid item xs={2} key={4} />
                            </Grid>
                        ) : (
                            null
                        )}
                        </div>

                        <div role={"main"}>
                            {problem.steps.map((step, idx) => {
                                const expanded =
                                    this.state.expandedAccordion === idx;
                                return (
                                    <Element
                                        name={idx.toString()}
                                        key={`${problem.id}-${step.id}`}
                                    >
                                        <Accordion
                                            style={{
                                                marginBottom: 32,
                                                // backgroundColor: "transparent",
                                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                            }}
                                            expanded={expanded}
                                            onChange={this.accordionChange(idx)}
                                            round
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls={`problem-step-${idx}-content`}
                                                id={`problem-step-${idx}-header`}
                                                {...stagingProp({
                                                    "data-selenium-target": `problem-step-toggle-${idx}`,
                                                })}
                                            >
                                                <Typography
                                                    variant="subtitle1"
                                                    style={{
                                                        fontWeight: 800,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <span style={{ minWidth: 0 }}>
                                                        {renderText(
                                                            step.stepTitle,
                                                            problem.id,
                                                            chooseVariables(
                                                                Object.assign(
                                                                    {},
                                                                    problem.variabilization,
                                                                    step.variabilization
                                                                ),
                                                                seed
                                                            ),
                                                            this.context
                                                        )}
                                                    </span>
                                                    {this.enableTTS && this.stepTTSPlayers[idx] && (
                                                        <TTSButtons
                                                            playing={this.state.ttsPlayingStep === idx}
                                                            onToggle={(e) => { e.stopPropagation(); this.stepTTSPlayers[idx].togglePlayPause(); }}
                                                            onReplay={(e) => { e.stopPropagation(); this.stepTTSPlayers[idx].replay(); }}
                                                            disabled={!this.stepTTSPlayers[idx].isReady()}
                                                        />
                                                    )}
                                                </Typography>
                                            </AccordionSummary>

                                                <ProblemCardWrapper
                                                    enableTTS={this.enableTTS}
                                                    problemID={problem.id}
                                                    step={step}
                                                    index={idx}
                                                    answerMade={this.answerMade}
                                                    seed={seed}
                                                    problemVars={problem.variabilization}
                                                    lesson={problem.lesson}
                                                    courseName={problem.courseName}
                                                    getMasteryData={this.getMasteryData}
                                                    problemTitle={problem.title}
                                                    problemSubTitle={problem.body}
                                                    giveStuFeedback={this.giveStuFeedback}
                                                    giveStuHints={this.giveStuHints}
                                                    keepMCOrder={this.keepMCOrder}
                                                    keyboardType={this.keyboardType}
                                                    giveHintOnIncorrect={this.giveHintOnIncorrect}
                                                    unlockFirstHint={this.unlockFirstHint}
                                                    giveStuBottomHint={this.giveStuBottomHint}
                                                    giveDynamicHint={this.giveDynamicHint}
                                                    prompt_template={this.prompt_template}
                                                    showCardHeader={false}
                                                    hintToggleTrigger={this.state.hintToggleTrigger}
                                                    hintToggleIndex={this.state.hintToggleIndex}
                                                    hintPortalTarget={chatDisplayMode === 'Avatar' ? null : this.hintPortalRef}
                                                    onHintToggle={this.handleHintToggleFromStep}
                                                    onHintUsageChange={this.handleHintUsageChange}
                                                    avatarHintMode={chatDisplayMode === 'Avatar'}
                                                    avatarHintRequest={chatDisplayMode === 'Avatar' ? avatarHintRequest : null}
                                                    onAvatarHintsChange={this.handleAvatarHintsChange}
                                                />
                                        </Accordion>
                                    </Element>
                                );
                            })}
                        </div>
                        <div width="100%">
                            {this.context.debug ? (
                                <Grid container spacing={0}>
                                    <Grid item xs={2} key={0} />
                                    <Grid item xs={2} key={1}>
                                        <NavLink
                                            activeClassName="active"
                                            className="link"
                                            to={this._getNextDebug(-1)}
                                            type="menu"
                                            style={{ marginRight: "10px" }}
                                        >
                                            <Button
                                                className={classes.button}
                                                style={{ width: "100%" }}
                                                size="small"
                                                onClick={() =>
                                                    (this.context.needRefresh = true)
                                                }
                                            >
                                                {translate('problem.PreviousProblem')}
                                            </Button>
                                        </NavLink>
                                    </Grid>
                                    <Grid item xs={4} key={2} />
                                    <Grid item xs={2} key={3}>
                                        <NavLink
                                            activeClassName="active"
                                            className="link"
                                            to={this._getNextDebug(1)}
                                            type="menu"
                                            style={{ marginRight: "10px" }}
                                        >
                                            <Button
                                                className={classes.button}
                                                style={{ width: "100%" }}
                                                size="small"
                                                onClick={() =>
                                                    (this.context.needRefresh = true)
                                                }
                                            >
                                            {translate('problem.NextProblem')}
                                            </Button>
                                        </NavLink>
                                    </Grid>
                                    <Grid item xs={2} key={4} />
                                </Grid>
                            ) : (
                                
                                <Grid 
                                    container 
                                    justifyContent="flex-end"
                                    style={{ marginTop: 32, marginBottom: 32}}
                                >
                                    <Grid item
                                        style={{width: 167}}
                                    >
                                        <Button
                                            className={classes.button} 
                                            style={{ width: "100%" }}
                                            size="small"
                                            onClick={this.clickNextProblem}
                                            disabled={
                                                !(
                                                    this.state.problemFinished ||
                                                    this.state.feedbackSubmitted
                                                )
                                            }
                                        >
                                            {translate('problem.NextProblem')}
                                        </Button>
                                    </Grid>
                                </Grid>

                            )}
                        </div>
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={drawerOpen ? 4 : 5}
                        style={{
                        position: "sticky",
                        top: hintStickTop,
                        alignSelf: "flex-start",
                        zIndex: 2,
                    }}
                    >
                        {chatDisplayMode === 'Avatar' ? (
                            <AvatarHelpPanel
                                problem={problem}
                                lesson={this.props.lesson}
                                seed={seed}
                                problemVars={this.props.problemVars}
                                stepStates={this.state.stepStates}
                                bktParams={this.bktParams}
                                getActiveStepData={this.getActiveStepData}
                                attemptHistory={this.state.attemptHistory}
                                user={this.props.user}
                                lessonMasteryMap={this.props.lessonMasteryMap}
                                hintUsageByStep={this.state.hintUsageByStep}
                                avatarHint={avatarVisibleHint}
                                avatarHintPayload={avatarHintPayload}
                                avatarHintIndex={this.state.avatarVisibleHintIndex}
                                avatarHintButtonLabel={avatarHintButtonLabel}
                                avatarHintButtonDisabled={!this.state.isAvatarHintVisible && !avatarHasHints}
                                avatarHasPreviousHint={avatarHasPreviousHint}
                                avatarHasNextHint={avatarHasAnotherHint}
                                onGetHint={this.handleHintAvatarClick}
                                onPreviousHint={this.handleAvatarHintPrevious}
                                onNextHint={this.handleAvatarHintNext}
                                onHideHint={this.handleAvatarHintHide}
                            />
                        ) : (
                        <div style={hintDisplayStyle}>
                        <div
                            style={bubbleContainerStyle}
                            onMouseEnter={this.handleHintHoverStart}
                            onMouseLeave={this.handleHintHoverEnd}
                        >
                        {/* Hints card */}
                        <div
                        style={hintCardWrapperStyle}
                        {...stagingProp({
                            "data-selenium-target": "hint-avatar-toggle",
                        })}
                        role="button"
                        tabIndex={0}
                        aria-expanded={this.state.isHintPortalOpen}
                        aria-controls="hint-portal-content"
                        aria-label="Toggle hints"
                        onClick={this.handleHintAvatarClick}
                        onKeyDown={this.handleHintAvatarKeyDown}
                        onFocus={this.handleHintHoverStart}
                        onBlur={this.handleHintHoverEnd}
                        >
                        {/* Hint badge: full circle is clickable (not just the icon) */}
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                backgroundColor: isHintHovering || isHintPortalOpen
                                    ? hintThemeAccentHover
                                    : hintThemeAccentSoft,
                                border: `3px solid ${hintThemeAccent}`,
                                boxShadow: "0 6px 18px rgba(239, 159, 39, 0.24)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "absolute",
                                top: 0,
                                right: 16,
                                zIndex: 3,
                                cursor: "pointer",
                                transition: "transform 0.16s ease, box-shadow 0.16s ease",
                                transform: isHintHovering || isHintPortalOpen ? "scale(1.04)" : "scale(1)",
                            }}
                        >
                            <span
                                aria-hidden="true"
                                style={{
                                    width: 42,
                                    height: 42,
                                    display: "block",
                                    backgroundColor: hintThemeAccentIcon,
                                    WebkitMask: `url(${lightbulbIcon}) center / contain no-repeat`,
                                    mask: `url(${lightbulbIcon}) center / contain no-repeat`,
                                }}
                            />
                        </div>
                        <div style={hintCardStyle}>
                        {(isHintPortalOpen || showHintPromoBubble) && (
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, lineHeight: 1.2, color: hintThemePrimaryDark }}>
                            Hints
                        </p>
                        )}
                        {showHintPromoBubble && (
                            <>
                                <p style={{ margin: "2px 0 0", fontSize: 12, lineHeight: 1.3, color: "#5c6b7a", whiteSpace: "nowrap" }}>
                                    Pre-written hints to help you with the problem.
                                </p>
                                <span
                                    style={{
                                        display: "inline-block",
                                        marginTop: 4,
                                        padding: "2px 7px",
                                        borderRadius: 9999,
                                        border: `1px solid ${hintThemePale}`,
                                        backgroundColor: "#ffffff",
                                        color: hintThemePrimaryDark,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Affects your mastery score
                                </span>
                            </>
                        )}
                        <div
                            ref={this.hintPortalRef}
                            id="hint-portal-content"
                            role="region"
                            aria-live="polite"
                            aria-label="Hints"
                            aria-hidden={!this.state.isHintPortalOpen}
                            style={hintPortalStyle}
                        />
                        </div>
                        </div>
                        </div>
                    </div>
                    )}
                    </Grid>
                </Grid>

                <footer>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ marginLeft: 20, fontSize: 12 }}>
                            {licenseName !== "" && licenseLink !== "" ? (
                                <div>
                                    "{problem.title}" {translate('problem.Derivative')}&nbsp;
                                    <a
                                        href={oerLink}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        "{oerName}"
                                    </a>
                                    {translate('problem.Used')}&nbsp;
                                    <a
                                        href={licenseLink}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {licenseName}
                                    </a>
                                </div>
                            ) : (
                                <div>
                                {oerName !== "" && oerLink !== "" ? (
                                <div>
                                    "{problem.title}" {translate('problem.Derivative')}&nbsp;
                                    <a
                                        href={oerLink}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        "{oerName}"
                                    </a>
                                </div>
                            ) : (
                                <></>
                            )}
                            </div>
                            )}
                        </div>


                        {/* <div
                            style={{
                                display: "flex",
                                flexGrow: 1,
                                marginRight: 20,
                                justifyContent: "flex-end",
                            }}
                        >
                            <IconButton
                                aria-label="about"
                                title={`About ${SITE_NAME}`}
                                onClick={this.togglePopup}
                            >
                                <HelpOutlineOutlinedIcon
                                    htmlColor={"#000"}
                                    style={{
                                        fontSize: 36,
                                        margin: -2,
                                    }}
                                />
                            </IconButton>
                            <IconButton
                                aria-label="report problem"
                                onClick={this.toggleFeedback}
                                title={"Report Problem"}
                            >
                                <FeedbackOutlinedIcon
                                    htmlColor={"#000"}
                                    style={{
                                        fontSize: 32,
                                    }}
                                />
                            </IconButton>
                        </div>
                        <Popup isOpen={showPopup} onClose={this.togglePopup}>
                            <About />
                        </Popup> */}
                    </div>

                    {this.props.showFeedback && (
                        <div
                            className="Feedback"
                            style={{
                                paddingTop: 16,
                                paddingBottom: 24,
                            }}
                        >
                            <center>
                                <h1>{translate('problem.Feedback')}</h1>
                            </center>
                            <div className={classes.textBox}>
                                <div className={classes.textBoxHeader}>
                                    <center>
                                        {this.props.feedbackSubmitted
                                            ? translate('problem.Thanks')
                                            : translate('problem.Description')}
                                    </center>
                                </div>
                                {this.props.feedbackSubmitted ? (
                                    <Spacer />
                                ) : (
                                    <Grid container spacing={0}>
                                        <Grid item xs={1} sm={2} md={2} key={1} />
                                        <Grid item xs={10} sm={8} md={8} key={2}>
                                            <TextField
                                                id="outlined-multiline-flexible"
                                                label={translate('problem.Response')}
                                                multiline
                                                fullWidth
                                                minRows="6"
                                                maxRows="20"
                                                value={this.props.feedback || ""}
                                                onChange={(event) => this.props.onFeedbackChange?.(event.target.value)}
                                                className={classes.textField}
                                                margin="normal"
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={1} sm={2} md={2} key={3} />
                                    </Grid>
                                )}
                            </div>
                            {this.props.feedbackSubmitted ? (
                                ""
                            ) : (
                                <div className="submitFeedback">
                                    <Grid container spacing={0}>
                                        <Grid item xs={3} sm={3} md={5} key={1} />
                                        <Grid item xs={6} sm={6} md={2} key={2}>
                                            <Button
                                                className={classes.button}
                                                onClick={this.props.submitFeedback}
                                                style={{ width: "100%" }}
                                                disabled={(this.props.feedback || "").trim() === ""}
                                            >
                                                {translate('problem.Submit')}
                                            </Button>
                                        </Grid>
                                        <Grid item xs={3} sm={3} md={5} key={3} />
                                    </Grid>
                                </div>
                            )}
                        </div>
                    )}


                    {/* {this.state.showFeedback ? (
                        <div className="Feedback" 
                            style={{
                                marginTop: 0,
                                paddingTop: 0,
                                paddingBottom: 690,
                                backgroundColor: "#F6F6F6",
                            }}
                        
                        >
                            <center>
                                <h1>{translate('problem.Feedback')}</h1>
                            </center>
                            <div className={classes.textBox}>
                                <div className={classes.textBoxHeader}>
                                    <center>
                                        {this.state.feedbackSubmitted
                                            ? translate('problem.Thanks')
                                            : translate('problem.Description')}
                                    </center>
                                </div>
                                {this.state.feedbackSubmitted ? (
                                    <Spacer />
                                ) : (
                                    <Grid container spacing={0}>
                                        <Grid
                                            item
                                            xs={1}
                                            sm={2}
                                            md={2}
                                            key={1}
                                        />
                                        <Grid
                                            item
                                            xs={10}
                                            sm={8}
                                            md={8}
                                            key={2}
                                        >
                                            <TextField
                                                id="outlined-multiline-flexible"
                                                label={translate('problem.Response')}
                                                multiline
                                                fullWidth
                                                minRows="6"
                                                maxRows="20"
                                                value={this.state.feedback}
                                                onChange={(event) =>
                                                    this.setState({
                                                        feedback:
                                                            event.target.value,
                                                    })
                                                }
                                                className={classes.textField}
                                                margin="normal"
                                                variant="outlined"
                                            />{" "}
                                        </Grid>
                                        <Grid
                                            item
                                            xs={1}
                                            sm={2}
                                            md={2}
                                            key={3}
                                        />
                                    </Grid>
                                )}
                            </div>
                            {this.state.feedbackSubmitted ? (
                                ""
                            ) : (
                                <div className="submitFeedback">
                                    <Grid container spacing={0}>
                                        <Grid
                                            item
                                            xs={3}
                                            sm={3}
                                            md={5}
                                            key={1}
                                        />
                                        <Grid item xs={6} sm={6} md={2} key={2}>
                                            <Button
                                                className={classes.button}
                                                style={{ width: "100%" }}
                                                size="small"
                                                onClick={this.submitFeedback}
                                                disabled={
                                                    this.state.feedback === ""
                                                }
                                            >
                                                {translate('problem.Submit')}
                                            </Button>
                                        </Grid>
                                        <Grid
                                            item
                                            xs={3}
                                            sm={3}
                                            md={5}
                                            key={3}
                                        />
                                    </Grid>
                                    <Spacer />
                                </div>
                            )}
                        </div>
                    ) : (
                        ""
                    )} */}
                    
                </footer>

                {/* AI Agent Chatbot */}
                {chatDisplayMode === 'Window' && (
                    <AgentIntegration
                        problem={problem}
                        lesson={this.props.lesson}
                        seed={seed}
                        problemVars={this.props.problemVars}
                        stepStates={this.state.stepStates}
                        bktParams={this.bktParams}
                        getActiveStepData={this.getActiveStepData}
                        attemptHistory={this.state.attemptHistory}
                        user={this.props.user}
                        lessonMasteryMap={this.props.lessonMasteryMap}
                        hintUsageByStep={this.state.hintUsageByStep}
                        hintsOpen={this.state.isHintPortalOpen}
                        condition="window"
                    />
                )}
            </>
        );
    }

    /**
     * Find the step that needs help
     * Priority: hintToggleIndex (currently expanded) > first incorrect > last attempted > first step
     * Used by AI Agent to determine which step student is working on
     */
    getActiveStepData = () => {
        const { problem } = this.props;
        const { stepStates, expandedAccordion } = this.state;
        
        // PRIORITY 1: Use expandedAccordion (which accordion is actually open)
        if (expandedAccordion !== null && expandedAccordion >= 0 && problem.steps[expandedAccordion]) {
            return {
                step: problem.steps[expandedAccordion],
                stepIndex: expandedAccordion,
                isIncorrect: stepStates[expandedAccordion] === false
            };
        }
        
        // If NO accordion is expanded, use smart fallbacks:
        
        // PRIORITY 2: Find first INCORRECT (wrong) step - student needs help here!
        for (let i = 0; i < problem.steps.length; i++) {
            if (stepStates[i] === false) {
                return {
                    step: problem.steps[i],
                    stepIndex: i,
                    isIncorrect: true
                };
            }
        }
        
        // PRIORITY 3: Find first UNANSWERED step - student is working on this next
        for (let i = 0; i < problem.steps.length; i++) {
            if (stepStates[i] === undefined || stepStates[i] === null) {
                return {
                    step: problem.steps[i],
                    stepIndex: i,
                    isIncorrect: false
                };
            }
        }
        
        // PRIORITY 4: All steps completed correctly! Use last step for congratulations
        const lastStepIndex = problem.steps.length - 1;
        return {
            step: problem.steps[lastStepIndex],
            stepIndex: lastStepIndex,
            isIncorrect: false
        };
    }
}

export default withTranslation(withStyles(styles)(Problem));
