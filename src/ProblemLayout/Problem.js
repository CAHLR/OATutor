import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ProblemCard from './ProblemCard'
import Grid from '@material-ui/core/Grid';
import { animateScroll as scroll, scroller, Element } from "react-scroll";
import update from '../BKT/BKTBrains.js'
import { renderText, chooseVariables } from '../ProblemLogic/renderText.js';
import styles from './commonStyles.js';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import {
    NavLink
} from "react-router-dom";
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import FeedbackOutlinedIcon from '@material-ui/icons/FeedbackOutlined';

import { CANVAS_WARNING_STORAGE_KEY, MIDDLEWARE_URL, ThemeContext } from '../config/config.js';
import { toast } from "react-toastify";
import to from "await-to-js";
import ToastID from "../util/toastIds";
import Spacer from "../Components/_General/Spacer";
import { stagingProp } from "../util/addStagingProperty";
import * as localForage from "localforage";


class Problem extends React.Component {
    static contextType = ThemeContext;

    constructor(props, context) {
        super(props);
        this.bktParams = context.bktParams;
        this.heuristic = context.heuristic;
        this.stepStates = {};
        this.numCorrect = 0;

        this.state = {
            problem: this.props.problem,
            steps: this.refreshSteps(props.problem),
            problemFinished: false,
            showFeedback: false,
            feedback: "",
            feedbackSubmitted: false
        }
    }

    componentDidMount() {
        const { lesson } = this.props;
        document["oats-meta-courseName"] = lesson?.courseName || "";
        document["oats-meta-textbookName"] = lesson?.courseName.substring((lesson?.courseName || "").indexOf(":") + 1).trim() || "";

        // query selects all katex annotation and adds aria label attribute to it
        for (const annotation of document.querySelectorAll("annotation")) {
            annotation.ariaLabel = annotation.textContent
        }
    }

    componentWillUnmount() {
        document["oats-meta-courseName"] = "";
        document["oats-meta-textbookName"] = "";
    }

    refreshSteps = (problem) => {
        if (problem == null) {
            return (<div></div>);
        }
        return problem.steps.map((step, index) => {
            this.stepStates[index] = null;
            return <Element name={index.toString()} key={Math.random()}>
                <ProblemCard problemID={problem.id} step={step} index={index} answerMade={this.answerMade}
                             seed={this.props.seed} problemVars={this.props.problem.variabilization}
                             lesson={problem.lesson}
                />
            </Element>
        })
    }

    updateCanvas = async (mastery, components) => {
        if (this.context.jwt) {
            let err, response;
            [err, response] = await to(fetch(`${MIDDLEWARE_URL}/postScore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: this.context?.jwt || "",
                    mastery,
                    components
                })
            }))
            if (err || !response) {
                toast.error(`An unknown error occurred trying to submit this problem. If reloading does not work, please contact us.`, {
                    toastId: ToastID.submit_grade_unknown_error.toString()
                })
                console.debug(err, response)

            } else {
                if (response.status !== 200) {
                    switch (response.status) {
                        case 400:
                            const responseText = await response.text()
                            let [message, ...addInfo] = responseText.split("|")
                            if (Array.isArray(addInfo) && addInfo.length > 0 && addInfo[0]) {
                                addInfo = JSON.parse(addInfo[0])
                            }
                            switch (message) {
                                case 'lost_link_to_lms':
                                    toast.error('It seems like the link back to your LMS has been lost. Please re-open the assignment to make sure your score is saved.', {
                                        toastId: ToastID.submit_grade_link_lost.toString()
                                    })
                                    return
                                case 'unable_to_handle_score':
                                    toast.warn('Something went wrong and we can\'t update your score right now. Your progress will be saved locally so you may continue working.', {
                                        toastId: ToastID.submit_grade_unable.toString(),
                                        closeOnClick: true
                                    })
                                    return
                                default:
                                    toast.error(`Error: ${responseText}`, {
                                        closeOnClick: true
                                    })
                                    return
                            }
                        case 401:
                            toast.error(`Your session has either expired or been invalidated, please reload the page to try again.`, {
                                toastId: ToastID.expired_session.toString()
                            })
                            return
                        case 403:
                            toast.error(`You are not authorized to make this action. (Are you a registered student?)`, {
                                toastId: ToastID.not_authorized.toString()
                            })
                            return
                        default:
                            toast.error(`An unknown error occurred trying to submit this problem. If reloading does not work, please contact us.`, {
                                toastId: ToastID.set_lesson_unknown_error.toString()
                            })
                            return
                    }
                } else {
                    console.debug('successfully submitted grade to Canvas')
                }
            }
        } else {
            const showWarning = !await localForage.getItem(CANVAS_WARNING_STORAGE_KEY)
            if (showWarning) {
                toast.warn("No credentials found (did you launch this assignment from Canvas?)", {
                    toastId: ToastID.warn_not_from_canvas.toString(),
                    autoClose: false,
                    onClick: () => {
                        toast.dismiss(ToastID.warn_not_from_canvas.toString())
                    },
                    onClose: () => {
                        localForage.setItem(CANVAS_WARNING_STORAGE_KEY, 1)
                    }
                })
            } else {
                // can ignore
            }
        }
    }

    answerMade = (cardIndex, kcArray, isCorrect) => {
        console.debug(`answer made and is correct: ${isCorrect}`)
        if (this.stepStates[cardIndex] === true) {
            return
        }

        if (this.stepStates[cardIndex] == null) {
            if (kcArray == null) {
                kcArray = []
            }
            for (const kc of kcArray) {
                //console.log(kc);
                update(this.bktParams[kc], isCorrect);
                //console.log(this.bktParams[kc].probMastery);
            }
        }

        if (!this.context.debug) {
            const objectives = Object.keys(this.props.lesson.learningObjectives);
            objectives.unshift(0);
            let score = objectives.reduce((x, y) => {
                return x + this.bktParams[y].probMastery
            });
            score /= objectives.length - 1;
            //console.log(this.context.studentName + " " + score);
            this.props.displayMastery(score);

            const relevantKc = {};
            Object.keys(this.props.lesson.learningObjectives).forEach(x => {
                relevantKc[x] = this.bktParams[x].probMastery
            });

            console.debug('updating canvas with problem score')
            this.updateCanvas(score, relevantKc);
        }
        this.stepStates[cardIndex] = isCorrect;

        if (isCorrect) {
            this.numCorrect += 1;
            if (this.numCorrect !== Object.keys(this.stepStates).length) {
                scroller.scrollTo((cardIndex + 1).toString(), {
                    duration: 500,
                    smooth: true,
                    offset: -100
                })
            } else {
                this.setState({ problemFinished: true });
            }
        }
    }

    clickNextProblem = () => {
        scroll.scrollToTop({ duration: 900, smooth: true });
        this.stepStates = {};
        this.numCorrect = 0;

        this.setState({ problem: this.props.problemComplete(this.context) },
            () => this.setState({
                steps: this.refreshSteps(this.props.problem),
                problemFinished: false,
                feedback: "",
                feedbackSubmitted: false
            }));
    }

    submitFeedback = () => {
        console.debug('this state problem', this.state.problem)
        this.context.firebase.submitFeedback(
            this.state.problem.id,
            this.state.feedback,
            this.state.problemFinished,
            chooseVariables(this.props.problem.variabilization, this.props.seed),
            this.state.problem.courseName,
            this.state.problem.steps,
            this.state.problem.lesson
        );
        this.setState({ feedback: "", feedbackSubmitted: true });
    }

    toggleFeedback = () => {
        scroll.scrollToBottom({ duration: 500, smooth: true });
        this.setState(prevState => ({ showFeedback: !prevState.showFeedback }))
    }

    _getNextDebug = (offset) => {
        return this.context.problemIDs[this.context.problemIDs.indexOf(this.state.problem.id) + offset] || "/"
    }


    render() {
        const { classes, lesson } = this.props;

        if (this.state.problem == null) {
            return (<div></div>);
        }

        return (
            <>
                <div>
                    <div className={classes.prompt} role={"banner"}>
                        <Card className={classes.titleCard}>
                            <CardContent {...stagingProp({
                                "data-selenium-target": "problem-header"
                            })}>
                                <h1 className={classes.problemHeader}>
                                    {renderText(this.props.problem.title, this.props.problem.id, chooseVariables(this.props.problem.variabilization, this.props.seed))}
                                    <hr/>
                                </h1>
                                <div className={classes.problemBody}>
                                    {renderText(this.props.problem.body, this.props.problem.id, chooseVariables(this.props.problem.variabilization, this.props.seed))}
                                </div>
                            </CardContent>
                        </Card>
                        <Spacer height={8}/>
                        <hr/>
                    </div>
                    <div role={"main"}>
                        {this.state.steps}
                    </div>
                    <div width="100%">
                        {this.context.debug ?
                            <Grid container spacing={0}>
                                <Grid item xs={2} key={0}/>
                                <Grid item xs={2} key={1}>
                                    <NavLink activeClassName="active" className="link" to={this._getNextDebug(-1)}
                                             type="menu"
                                             style={{ marginRight: '10px' }}>
                                        <Button className={classes.button} style={{ width: "100%" }} size="small"
                                                onClick={() => this.context.needRefresh = true}>Previous
                                            Problem</Button>
                                    </NavLink>
                                </Grid>
                                <Grid item xs={4} key={2}/>
                                <Grid item xs={2} key={3}>
                                    <NavLink activeClassName="active" className="link" to={this._getNextDebug(1)}
                                             type="menu"
                                             style={{ marginRight: '10px' }}>
                                        <Button className={classes.button} style={{ width: "100%" }} size="small"
                                                onClick={() => this.context.needRefresh = true}>Next Problem</Button>
                                    </NavLink>
                                </Grid>
                                <Grid item xs={2} key={4}/>
                            </Grid>
                            :
                            <Grid container spacing={0}>
                                <Grid item xs={3} sm={3} md={5} key={1}/>
                                <Grid item xs={6} sm={6} md={2} key={2}>
                                    <Button className={classes.button} style={{ width: "100%" }} size="small"
                                            onClick={this.clickNextProblem}
                                            disabled={!(this.state.problemFinished || this.state.feedbackSubmitted)}>Next
                                        Problem</Button>
                                </Grid>
                                <Grid item xs={3} sm={3} md={5} key={3}/>
                            </Grid>}
                    </div>
                </div>
                <footer>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <div style={{ marginLeft: 20, fontSize: 12 }}>
                            {this.state.problem.oer && this.state.problem.oer.includes("openstax") && lesson?.courseName.toLowerCase().includes("openstax") ?
                                <div>
                                    "{this.state.problem.title}" is a derivative of&nbsp;
                                    <a href="https://openstax.org/" target="_blank" rel="noreferrer">
                                        "{lesson?.courseName.substring((lesson?.courseName || "").indexOf(":") + 1).trim() || ""}"
                                    </a>
                                    &nbsp;by OpenStax, used under&nbsp;
                                    <a href="https://creativecommons.org/licenses/by/4.0" target="_blank"
                                       rel="noreferrer">CC
                                        BY 4.0</a>
                                </div>
                                : ""}
                        </div>
                        <div style={{ display: "flex", flexGrow: 1, marginRight: 20, justifyContent: "flex-end" }}>
                            <IconButton aria-label="help" title={"How to use OpenITS?"}
                                        href={`${window.location.origin}${window.location.pathname}#/posts/how-to-use`}>
                                <HelpOutlineOutlinedIcon htmlColor={"#000"} style={{
                                    fontSize: 36,
                                    margin: -2
                                }}/>
                            </IconButton>
                            <IconButton aria-label="report problem" onClick={this.toggleFeedback}
                                        title={"Report Problem"}>
                                <FeedbackOutlinedIcon htmlColor={"#000"} style={{
                                    fontSize: 32
                                }}/>
                            </IconButton>
                        </div>

                    </div>
                    {this.state.showFeedback ? <div className="Feedback">
                        <center><h1>Feedback</h1></center>
                        <div className={classes.textBox}>
                            <div className={classes.textBoxHeader}>
                                <center>{this.state.feedbackSubmitted ? "Thank you for your feedback!" : "Feel free to submit feedback about this problem if you encounter any bugs. Submit feedback for all parts of the problem at once."}</center>
                            </div>
                            {this.state.feedbackSubmitted ? <Spacer/> : <Grid container spacing={0}>
                                <Grid item xs={1} sm={2} md={2} key={1}/>
                                <Grid item xs={10} sm={8} md={8} key={2}>
                                    <TextField
                                        id="outlined-multiline-flexible"
                                        label="Response"
                                        multiline
                                        fullWidth
                                        minRows="6"
                                        maxRows="20"
                                        value={this.state.feedback}
                                        onChange={(event) => this.setState({ feedback: event.target.value })}
                                        className={classes.textField}
                                        margin="normal"
                                        variant="outlined"
                                    /> </Grid>
                                <Grid item xs={1} sm={2} md={2} key={3}/>
                            </Grid>}
                        </div>
                        {this.state.feedbackSubmitted ? "" :
                            <div className="submitFeedback">
                                <Grid container spacing={0}>
                                    <Grid item xs={3} sm={3} md={5} key={1}/>
                                    <Grid item xs={6} sm={6} md={2} key={2}>
                                        <Button className={classes.button} style={{ width: "100%" }} size="small"
                                                onClick={this.submitFeedback}
                                                disabled={this.state.feedback === ""}>Submit</Button>
                                    </Grid>
                                    <Grid item xs={3} sm={3} md={5} key={3}/>
                                </Grid>
                                <Spacer/>
                            </div>
                        }
                    </div> : ""}
                </footer>
            </>
        );
    }
}

export default withStyles(styles)(Problem);
