import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import ProblemCard from "./ProblemCard";
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

class Problem extends React.Component {
    static contextType = ThemeContext;

    constructor(props, context) {
        super(props);
        this.bktParams = context.bktParams;
        this.heuristic = context.heuristic;

        const giveStuFeedback = this.props.lesson?.giveStuFeedback;
        const giveStuHints = this.props.lesson?.giveStuHints;
        const keepMCOrder = this.props.lesson?.keepMCOrder;
        const keyboardType = this.props.lesson?.keyboardType;
        const doMasteryUpdate = this.props.lesson?.doMasteryUpdate;
        const unlockFirstHint = this.props.lesson?.unlockFirstHint;
        const giveStuBottomHint = this.props.lesson?.allowBottomHint;

        this.giveHintOnIncorrect = true;
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
        };
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
                scroller.scrollTo((cardIndex + 1).toString(), {
                    duration: 500,
                    smooth: true,
                    offset: -100,
                });
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
        const { problem } = this.props;

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

    render() {
        const { translate } = this.props;
        const { classes, problem, seed } = this.props;
        const [oerLink, oerName, licenseLink, licenseName] =
            this.getOerLicense();
        if (problem == null) {
            return <div></div>;
        }

        return (
            <>
                <div>
                    <div className={classes.prompt} role={"banner"}>
                        <Card className={classes.titleCard}>
                            <CardContent
                                {...stagingProp({
                                    "data-selenium-target": "problem-header",
                                })}
                            >
                                <h1 className={classes.problemHeader}>
                                    {renderText(
                                        problem.title,
                                        problem.id,
                                        chooseVariables(
                                            problem.variabilization,
                                            seed
                                        ),
                                        this.context
                                    )}
                                    <hr />
                                </h1>
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
                        <hr />
                    </div>
                    <div role={"main"}>
                        {problem.steps.map((step, idx) => (
                            <Element
                                name={idx.toString()}
                                key={`${problem.id}-${step.id}`}
                            >
                                <ProblemCard
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
                                    giveHintOnIncorrect={
                                        this.giveHintOnIncorrect
                                    }
                                    unlockFirstHint={this.unlockFirstHint}
                                    giveStuBottomHint={this.giveStuBottomHint}
                                    giveDynamicHint={this.giveDynamicHint}
                                    prompt_template={this.prompt_template}
                                />
                            </Element>
                        ))}
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
                            
                            <Grid container spacing={0}>
                                <Grid item xs={3} sm={3} md={5} key={1} />
                                <Grid item xs={6} sm={6} md={2} key={2}>
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
                                <Grid item xs={3} sm={3} md={5} key={3} />
                            </Grid>
                        )}
                    </div>
                </div>
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
                        <div
                            style={{
                                display: "flex",
                                flexGrow: 1,
                                marginRight: 20,
                                justifyContent: "flex-end",
                            }}
                        >
                            <IconButton
                                aria-label="help"
                                title={`How to use ${SITE_NAME}?`}
                                href={`${window.location.origin}${window.location.pathname}#/posts/how-to-use`}
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
                    </div>
                    {this.state.showFeedback ? (
                        <div className="Feedback">
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
                    )}
                </footer>
            </>
        );
    }
}

export default withStyles(styles)(withTranslation(Problem));
