import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import ProblemCardWrapper from "./ProblemCardWrapper";
import Grid from "@material-ui/core/Grid";
import { animateScroll as scroll, Element, scroller } from "react-scroll";
import update from "../../models/BKT/BKT-brain.js";
import {
    chooseVariables,
    renderText,
} from "../../platform-logic/renderText.js";
import styles from "./common-styles.js";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import { NavLink } from "react-router-dom";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import FeedbackOutlinedIcon from "@material-ui/icons/FeedbackOutlined";
import withTranslation from "../../util/withTranslation.js"
import avatar from "../../assets/avatar_default_state.svg";

import {
    CANVAS_WARNING_STORAGE_KEY,
    MIDDLEWARE_URL,
    SHOW_NOT_CANVAS_WARNING,
    SITE_NAME,
    ThemeContext,
} from "../../config/config.js";
import { toast } from "react-toastify";
import to from "await-to-js";
import ToastID from "../../util/toastIds";
import Spacer from "../Spacer";
import { stagingProp } from "../../util/addStagingProperty";
import { cleanArray } from "../../util/cleanObject";
import Popup from '../Popup/Popup.js';
import About from '../../pages/Posts/About.js';

import {Accordion, AccordionSummary, AccordionDetails, Typography} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

class Problem extends React.Component {
    static defaultProps = {
        autoScroll: true
      };
    static contextType = ThemeContext;

    constructor(props, context) {
        super(props);

        const { setLanguage } = props;
        if (props.lesson.courseName == "Matematik 4") {
            setLanguage('se')
        }

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
        this.prompt_template = this.props.lesson?.prompt_template
            ? this.props.lesson?.prompt_template
            : "";

        this.state = {
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
            metaCollapsed: false,
        };

        this.togglePopup = this.togglePopup.bind(this);
        this.hintPortalRef = React.createRef();
    }

    componentDidMount() {
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
    }

    componentWillUnmount() {
        document["oats-meta-courseName"] = "";
        document["oats-meta-textbookName"] = "";
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

    answerMade = (cardIndex, kcArray, isCorrect) => {
        const { stepStates, firstAttempts } = this.state;
        const { lesson, problem } = this.props;

        console.debug(`answer made and is correct: ${isCorrect}`);

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
            this.setState({
                stepStates: nextStepStates,
            });
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
                        duration: 500,
                        smooth: true,
                        offset: -100,
                    });
                }
                this.setState({
                    stepStates: nextStepStates,
                });
            } else {
                this.setState({
                    problemFinished: true,
                    stepStates: nextStepStates,
                });
            }
        }
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
        }));
    };

    handleHintAvatarClick = (event) => {
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
            const targetIndex = hasExpanded ? prevState.expandedAccordion : 0;

            return {
                hintToggleTrigger: prevState.hintToggleTrigger + 1,
                hintToggleIndex: targetIndex,
                expandedAccordion: hasExpanded
                    ? prevState.expandedAccordion
                    : targetIndex,
                isHintPortalOpen: false,
            };
        });
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
        this.setState((prevState) => ({
            isHintPortalOpen: isOpen,
            hintToggleIndex: isOpen ? index : null,
        }));
    };

    render() {
        const { translate } = this.props;
        const { classes, problem, seed } = this.props;
        const [oerLink, oerName, licenseLink, licenseName] =
            this.getOerLicense();
        const { showPopup, isHintPortalOpen, metaCollapsed } = this.state;
        if (problem == null) {
            return <div></div>;
        }

        const drawerOpen = this.props.drawerOpen;
        const layoutGap = drawerOpen ? 3 : 4;
        const toggleMetaCollapsed = () =>
            this.setState((prevState) => ({
                metaCollapsed: !prevState.metaCollapsed,
            }));
        const hintStickTop = 200;
        const hintDisplayStyle = {
            position: "sticky",
            top: hintStickTop,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            width: "95%",
            maxWidth: "100%",
            maxHeight: "70vh",
            transition: "all 0.4s ease",
        };
        const bubbleContainerStyle = {
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: isHintPortalOpen ? "stretch" : "flex-end",
            justifyContent: isHintPortalOpen ? "flex-end" : "flex-start",
            width: isHintPortalOpen ? "100%" : "auto",
            flexGrow: 1,
        };

        const speechBubbleStyle = {
            background: "#FFF3CC",
            color: "#222",
            padding: "12px 16px",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            position: "relative",
            width: isHintPortalOpen ? "100%" : "auto",
            maxWidth: isHintPortalOpen ? "100%" : 240,
            maxHeight: "60vh",
            alignSelf: isHintPortalOpen ? "stretch" : "flex-end",
            textAlign: "left",
            cursor: "pointer",
            transition: "all 0.3s ease",
            marginTop: isHintPortalOpen ? "auto" : 0,
            zIndex: 2,
        };

        // const hintPortalStyle = {
        //     display: isHintPortalOpen ? "block" : "none",
        //     width: "100%",
        //     marginTop: isHintPortalOpen ? 8 : 0,
        // };

        const hintPortalStyle = {
            display: isHintPortalOpen ? "block" : "none",
            position: "sticky",
            width: "100%",
            height: "50vh",
            marginTop: 8,
            overflowY: "auto",
        };

        return (
            <>
                <Grid
                    container
                    spacing={layoutGap}
                    alignItems="flex-start"
                    style={{ width: "100%", margin: 0 }}
                >
                    <Grid item xs={12} style={{ position: "sticky", top: hintStickTop, paddingTop: 0, paddingBottom: 0, backgroundColor: "#F6F6F6", zIndex: 3, marginBottom: -10, paddingRight: 40 }}>
                    
                    {/* <Grid item xs={12} style={{ position: "sticky", top: hintStickTop, zIndex: 3 }}> */}
                        <div className={classes.prompt} role={"banner"}>
                            <Card className={classes.titleCard}>

                                <div 
                                    style = {{
                                        backgroundColor: "#EBF4FA",
                                        padding: 15,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <div className={classes.problemHeader}>
                                        {renderText(
                                            problem.title,
                                            problem.id,
                                            chooseVariables(
                                                problem.variabilization,
                                                seed
                                            ),
                                            this.context
                                        )}
                                        
                                    </div>
                                    <IconButton
                                        aria-label="Toggle problem statement"
                                        onClick={toggleMetaCollapsed}
                                        style={{
                                            transform: metaCollapsed ? "rotate(180deg)" : "rotate(0deg)",
                                            transition: "transform 0.2s ease",
                                        }}
                                    >
                                        <ExpandMoreIcon />
                                    </IconButton>
                                </div>

                                {!metaCollapsed && (
                                    <CardContent
                                        {...stagingProp({
                                            "data-selenium-target": "problem-header",
                                        })}
                                        style={{ 
                                            padding: 15
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
                                )}
                            </Card>
                            <Spacer height={0} />
                            
                        </div>
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={drawerOpen ? 8 : 7}
                    >
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
                                                    }}
                                                >
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
                                                </Typography>
                                            </AccordionSummary>

                                                <ProblemCardWrapper
                                                    problemID={problem.id}
                                                    step={step}
                                                    index={idx}
                                                    answerMade={this.answerMade}
                                                    seed={seed}
                                                    problemVars={problem.variabilization}
                                                    lesson={problem.lesson}
                                                    courseName={problem.courseName}
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
                                                    hintPortalTarget={this.hintPortalRef}
                                                    onHintToggle={this.handleHintToggleFromStep}
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
                        alignSelf: "flex-start",
                        zIndex: 2,
                    }}
                    >
                        <div style={hintDisplayStyle}>
                        <button
                            style={{
                                backgroundColor: "#4E7DAA", // similar blue tone
                                color: "white",
                                border: "none",
                                borderRadius: "9999px", // fully rounded edges
                                padding: "2px 14px",
                                fontSize: "12px",
                                fontWeight: 500,
                                cursor: "pointer",
                                alignSelf: "flex-end",
                                marginBottom: "56px",
                            }}
                            >
                            OpenAI o1
                        </button>
                        <div
                            style={bubbleContainerStyle}
                        >
                        {/* Speech Bubble */}
                        <div
                        style={speechBubbleStyle}
                        {...stagingProp({
                            "data-selenium-target": "hint-avatar-toggle",
                        })}
                        role="button"
                        tabIndex={0}
                        aria-expanded={this.state.isHintPortalOpen}
                        aria-controls="hint-portal-content"
                        onClick={this.handleHintAvatarClick}
                        onKeyDown={this.handleHintAvatarKeyDown}
                        aria-label="Toggle hints"
                        >
                        <p style={{ margin: 0, fontWeight: 600 }}>Stuck on the problem?</p>
                        {!this.state.isHintPortalOpen && (
                            <p style={{ margin: 0 }}>Give me a tap and I am happy to help!</p>
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

                        {/* Tail at top right, pointing upward */}
                        <div
                            style={{
                                position: "absolute",
                                top: "-8px",
                                right: "24px",
                                width: 0,
                                height: 0,
                                borderLeft: "8px solid transparent",
                                borderRight: "8px solid transparent",
                                borderBottom: "8px solid #FFF3CC"
                            }}
                        />
                        </div>

                        {/* Avatar Icon */}
                        <img
                        src={avatar}
                        alt="Whisper"
                        style={{
                            width: 64,
                            height: 64,
                            position: "absolute",
                            top: "-55px",
                            right: "-10px",
                            zIndex: 0,
                        }}
                        />
                        </div>
                    </div>
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
            </>
        );
    }
}

export default withStyles(styles)(withTranslation(Problem));
