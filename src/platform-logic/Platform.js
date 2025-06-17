import React from "react";
import { AppBar, Toolbar } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import ProblemWrapper from "@components/problem-layout/ProblemWrapper.js";
import LessonSelectionWrapper from "@components/problem-layout/LessonSelectionWrapper.js";
import { withRouter } from "react-router-dom";

import {
    coursePlans,
    findLessonById,
    LESSON_PROGRESS_STORAGE_KEY,
    MIDDLEWARE_URL,
    SITE_NAME,
    ThemeContext,
    MASTERY_THRESHOLD,
} from "../config/config.js";
import to from "await-to-js";
import { toast } from "react-toastify";
import ToastID from "../util/toastIds";
import BrandLogoNav from "@components/BrandLogoNav";
import { cleanArray } from "../util/cleanObject";
import ErrorBoundary from "@components/ErrorBoundary";
import { CONTENT_SOURCE } from "@common/global-config";
import withTranslation from '../util/withTranslation';

import userIcon from "../assets/UserThumb.svg";
import IconButton from '@material-ui/core/IconButton';
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined"
import FeedbackOutlinedIcon from "@material-ui/icons/FeedbackOutlined";
import leftArrow from "../assets/chevron-left.svg";

import Popup from '../components/Popup/Popup';
import About from '../pages/Posts/About.js';

import { animateScroll as scroll, Element, scroller } from "react-scroll";
import { chooseVariables } from "../platform-logic/renderText.js";
import TextField from "@material-ui/core/TextField";
import Spacer from "../components/Spacer";
import Button from "@material-ui/core/Button";

import menuToggle from "../assets/menuIcon.svg";

import { withStyles } from "@material-ui/core/styles";
import styles from "../components/problem-layout/common-styles.js";

import Drawer from '@material-ui/core/Drawer';
import TableOfContents from '../components/tableOfContents.js';

let problemPool = require(`@generated/processed-content-pool/${CONTENT_SOURCE}.json`);

let seed = Date.now().toString();
console.log("Generated seed");

class Platform extends React.Component {
    static contextType = ThemeContext;

    constructor(props, context) {
        super(props);
        
        this.problemIndex = {
            problems: problemPool,
        };
        this.completedProbs = new Set();
        this.lesson = null;

        this.user = context.user || {};
        console.debug("USER: ", this.user)
        this.isPrivileged = !!this.user.privileged;
        this.context = context;

        this.state = {
            showPopup: false,
            feedback: "",
            feedbackSubmitted: false,

            drawerOpen: false
        };

        this.togglePopup = this.togglePopup.bind(this);
        this.toggleFeedback = this.toggleFeedback.bind(this);

        // Add each Q Matrix skill model attribute to each step
        for (const problem of this.problemIndex.problems) {
            for (
                let stepIndex = 0;
                stepIndex < problem.steps.length;
                stepIndex++
            ) {
                const step = problem.steps[stepIndex];
                step.knowledgeComponents = cleanArray(
                    context.skillModel[step.id] || []
                );
            }
        }
        if (this.props.lessonID == null) {
            this.state = {
                currProblem: null,
                status: "courseSelection",
                seed: seed,
                feedback: "",
                feedbackSubmitted: false,  
                drawerOpen: false             
            };
        } else {
            this.state = {
                currProblem: null,
                status: "courseSelection",
                seed: seed,
                feedback: "",
                feedbackSubmitted: false,
                drawerOpen: false
            };
        }

        this.selectLesson = this.selectLesson.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        if (this.props.lessonID != null) {
            console.log("calling selectLesson from componentDidMount...") 
            const lesson = findLessonById(this.props.lessonID)
            console.debug("lesson: ", lesson)
            this.selectLesson(lesson).then(
                (_) => {
                    console.debug(
                        "loaded lesson " + this.props.lessonID,
                        this.lesson
                    );
                }
            );

            const { setLanguage } = this.props;
            if (lesson.courseName == 'Matematik 4') {
                setLanguage('se')
            } else {
                const defaultLocale = localStorage.getItem('defaultLocale');
                setLanguage(defaultLocale)
            }
        } else if (this.props.courseNum != null) {
            this.selectCourse(coursePlans[parseInt(this.props.courseNum)]);
        }
        this.onComponentUpdate(null, null, null);
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.context.problemID = "n/a";
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.onComponentUpdate(prevProps, prevState, snapshot);
    }

    
    onComponentUpdate(prevProps, prevState, snapshot) {
        if (
            Boolean(this.state.currProblem?.id) &&
            this.context.problemID !== this.state.currProblem.id
        ) {
            this.context.problemID = this.state.currProblem.id;
        }
        if (this.state.status !== "learning") {
            this.context.problemID = "n/a";
        }
    }
    
    async selectLesson(lesson, updateServer=true) {
        const context = this.context;
        console.debug("lesson: ", context)
        console.debug("update server: ", updateServer)
        console.debug("context: ", context)
        if (!this._isMounted) {
            console.debug("component not mounted, returning early (1)");
            return;
        }
        if (this.isPrivileged) {
            // from canvas or other LTI Consumers
            console.log("valid privilege")
            let err, response;
            [err, response] = await to(
                fetch(`${MIDDLEWARE_URL}/setLesson`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token: context?.jwt || this.context?.jwt || "",
                        lesson,
                    }),
                })
            );
            if (err || !response) {
                toast.error(
                    `Error setting lesson for assignment "${this.user.resource_link_title}"`
                );
                console.debug(err, response);
                return;
            } else {
                if (response.status !== 200) {
                    switch (response.status) {
                        case 400:
                            const responseText = await response.text();
                            let [message, ...addInfo] = responseText.split("|");
                            if (
                                Array.isArray(addInfo) &&
                                addInfo[0].length > 1
                            ) {
                                addInfo = JSON.parse(addInfo[0]);
                            }
                            switch (message) {
                                case "resource_already_linked":
                                    toast.error(
                                        `${addInfo.from} has already been linked to lesson ${addInfo.to}. Please create a new assignment.`,
                                        {
                                            toastId:
                                                ToastID.set_lesson_duplicate_error.toString(),
                                        }
                                    );
                                    return;
                                default:
                                    toast.error(`Error: ${responseText}`, {
                                        toastId:
                                            ToastID.expired_session.toString(),
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
                            this.props.history.push("/session-expired");
                            return;
                        case 403:
                            toast.error(
                                `You are not authorized to make this action. (Are you an instructor?)`,
                                {
                                    toastId: ToastID.not_authorized.toString(),
                                }
                            );
                            return;
                        default:
                            toast.error(
                                `Error setting lesson for assignment "${this.user.resource_link_title}." If reloading does not work, please contact us.`,
                                {
                                    toastId:
                                        ToastID.set_lesson_unknown_error.toString(),
                                }
                            );
                            return;
                    }
                } else {
                    toast.success(
                        `Successfully linked assignment "${this.user.resource_link_title}" to lesson ${lesson.id} "${lesson.topics}"`,
                        {
                            toastId: ToastID.set_lesson_success.toString(),
                        }
                    );
                    const responseText = await response.text();
                    let [message, ...addInfo] = responseText.split("|");
                    this.props.history.push(
                        `/assignment-already-linked?to=${addInfo.to}`
                    );
                }
            }
        }

        this.lesson = lesson;

        const loadLessonProgress = async () => {
            const { getByKey } = this.context.browserStorage;
            return await getByKey(
                LESSON_PROGRESS_STORAGE_KEY(this.lesson.id)
            ).catch((err) => {});
        };

        const [, prevCompletedProbs] = await Promise.all([
            this.props.loadBktProgress(),
            loadLessonProgress(),
        ]);
        if (!this._isMounted) {
            console.debug("component not mounted, returning early (2)");
            return;
        }
        if (prevCompletedProbs) {
            console.debug(
                "student has already made progress w/ problems in this lesson before",
                prevCompletedProbs
            );
            this.completedProbs = new Set(prevCompletedProbs);
        }
        this.setState(
            {
                currProblem: this._nextProblem(
                    this.context ? this.context : context
                ),
            },
            () => {
                //console.log(this.state.currProblem);
                //console.log(this.lesson);
            }
        );
    }

    selectCourse = (course, context) => {
        this.course = course;
        this.setState({
            status: "lessonSelection",
            selectedCourse: course
        });
    };

    _nextProblem = (context) => {
        seed = Date.now().toString();
        this.setState({ seed: seed });
        this.props.saveProgress();
        const problems = this.problemIndex.problems.filter(
            ({ courseName }) => !courseName.toString().startsWith("!!")
        );
        let chosenProblem;

        console.debug(
            "Platform.js: sample of available problems",
            problems.slice(0, 10)
        );

        for (const problem of problems) {
            // Calculate the mastery for this problem
            let probMastery = 1;
            let isRelevant = false;
            for (const step of problem.steps) {
                if (typeof step.knowledgeComponents === "undefined") {
                    continue;
                }
                for (const kc of step.knowledgeComponents) {
                    if (typeof context.bktParams[kc] === "undefined") {
                        console.log("BKT Parameter " + kc + " does not exist.");
                        continue;
                    }
                    if (kc in this.lesson.learningObjectives) {
                        isRelevant = true;
                    }
                    // Multiply all the mastery priors
                    if (!(kc in context.bktParams)) {
                        console.log("Missing BKT parameter: " + kc);
                    }
                    probMastery *= context.bktParams[kc].probMastery;
                }
            }
            if (isRelevant) {
                problem.probMastery = probMastery;
            } else {
                problem.probMastery = null;
            }
        }

        console.debug(
            `Platform.js: available problems ${problems.length}, completed problems ${this.completedProbs.size}`
        );
        chosenProblem = context.heuristic(problems, this.completedProbs);
        console.debug("Platform.js: chosen problem", chosenProblem);

        const objectives = Object.keys(this.lesson.learningObjectives);
        console.debug("Platform.js: objectives", objectives);
        let score = objectives.reduce((x, y) => {
            return x + context.bktParams[y].probMastery;
        }, 0);
        score /= objectives.length;
        this.displayMastery(score);
        //console.log(Object.keys(context.bktParams).map((skill) => (context.bktParams[skill].probMastery <= this.lesson.learningObjectives[skill])));

        // There exists a skill that has not yet been mastered (a True)
        // Note (number <= null) returns false
        if (
            !Object.keys(context.bktParams).some(
                (skill) =>
                    context.bktParams[skill].probMastery <= MASTERY_THRESHOLD
            )
        ) {
            this.setState({ status: "graduated" });
            console.log("Graduated");
            return null;
        } else if (chosenProblem == null) {
            console.debug("no problems were chosen");
            // We have finished all the problems
            if (this.lesson && !this.lesson.allowRecycle) {
                // If we do not allow problem recycle then we have exhausted the pool
                this.setState({ status: "exhausted" });
                return null;
            } else {
                this.completedProbs = new Set();
                chosenProblem = context.heuristic(
                    problems,
                    this.completedProbs
                );
            }
        }

        if (chosenProblem) {
            this.setState({ currProblem: chosenProblem, status: "learning" });
            // console.log("Next problem: ", chosenProblem.id);
            console.debug("problem information", chosenProblem);
            this.context.firebase.startedProblem(
                chosenProblem.id,
                chosenProblem.courseName,
                chosenProblem.lesson,
                this.lesson.learningObjectives
            );
            return chosenProblem;
        } else {
            console.debug("still no chosen problem..? must be an error");
        }
    };

    problemComplete = async (context) => {
        this.completedProbs.add(this.state.currProblem.id);
        const { setByKey } = this.context.browserStorage;
        await setByKey(
            LESSON_PROGRESS_STORAGE_KEY(this.lesson.id),
            this.completedProbs
        ).catch((error) => {
            this.context.firebase.submitSiteLog(
                "site-error",
                `componentName: Platform.js`,
                {
                    errorName: error.name || "n/a",
                    errorCode: error.code || "n/a",
                    errorMsg: error.message || "n/a",
                    errorStack: error.stack || "n/a",
                },
                this.state.currProblem.id
            );
        });
        this._nextProblem(context);
    };

    displayMastery = (mastery) => {
        this.setState({ mastery: mastery });
        if (mastery >= MASTERY_THRESHOLD) {
            toast.success("You've successfully completed this assignment!", {
                toastId: ToastID.successfully_completed_lesson.toString(),
            });
        }
    };

    togglePopup() {
    this.setState(prevState => ({
        showPopup: !prevState.showPopup
    }));
    }

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
        this.setState((prevState) => ({
            showFeedback: !prevState.showFeedback,
            }),
        
            () => {
                if (this.state.showFeedback && !this.state.showpopup) {
                    scroll.scrollToBottom({ duration: 500, smooth: true });
                }
            }
        );
    };

    toggleDrawer = (open) => {
        this.setState({ drawerOpen: open });
    };

    render() {
        const { translate } = this.props;
        const { showPopup } = this.state;
        const { classes, problem, seed } = this.props;
        const drawerWidth = 320;
        this.studentNameDisplay = this.context.studentName
        ? decodeURIComponent(this.context.studentName)
        : translate('platform.LoggedIn');
        return (
            <>
                
                <Drawer
                    variant="persistent"
                    anchor="left"
                    open={this.state.drawerOpen}
                    classes={{
                        paper: this.props.classes.drawerPaper,
                    }}
                    style={{
                        position: "fixed",
                        width: 320,
                        flexShrink: 0,
                    }}
                >
                    
                    <div style={{ width: drawerWidth, padding: 16 }}>
                        <Button onClick={() => this.toggleDrawer(false)}>Close</Button>
                        <TableOfContents />
                    </div>
                </Drawer>                

                <div
                    style={{
                        backgroundColor: "#F6F6F6",
                        paddingBottom: 20,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >

                    <AppBar position="fixed" style = {{backgroundColor: '#FFFFFF'}}>
                        <Toolbar>
                            <Grid
                                container
                                spacing={0}
                                role={"navigation"}
                                alignItems={"center"}
                            >
                                <Grid item xs={3} key = {1}>
                                    <BrandLogoNav
                                        isPrivileged={this.isPrivileged}
                                    />
                                </Grid>
                                <Grid item xs={5} key={2}>
                                    {/* <div
                                        style={{
                                            textAlign: "center",
                                            textAlignVertical: "center",
                                            paddingTop: "3px",
                                        }}
                                    >
                                        {Boolean(
                                            findLessonById(this.props.lessonID)
                                        )
                                            ? findLessonById(this.props.lessonID)
                                                .name +
                                            " " +
                                            findLessonById(this.props.lessonID)
                                                .topics
                                            : ""}
                                    </div> */}
                                </Grid>

                                <Grid xs = {4} item key={3}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            alignItems: "center", 
                                            gap: "9px",
                                            color: "#344054",
                                        }}
                                    >
                                        <img src={userIcon} alt="User Icon" />
                                        <div style={{ fontWeight: 600 }}>
                                            {this.studentNameDisplay}
                                        </div>
                                    </div>
                                </Grid>


                            </Grid>
                        </Toolbar>
                    </AppBar>
                    
                    <div className={classes.toolbarOffset} />
                 
                    <AppBar position="fixed" className={classes.secondBarOffset}>

                        <Toolbar 
                            style={{ minHeight: '56px'}}
                        >
                            <Grid
                                container
                                spacing={0}
                                role={"secondary-navigation"}
                                alignItems={"center"}
                            >
                                <Grid item xs={9} key={1}>
                                {
                                    this.state.selectedCourse? (
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "flex-start",
                                                alignItems: "center", 
                                                gap: "8px"
                                            }}
                                        >

                                            <IconButton 
                                                onClick = {() => this.props.history.goBack()}
                                                aria-label = "Back" 
                                            >
                                                <img src={leftArrow} alt="Back Arrow" />

                                            </IconButton>

                                            <div style={{ fontWeight: 600 }}> {this.state.selectedCourse.courseName} </div>
                                            
                                        </div>
                                    )
                                
                                    : findLessonById(this.props.lessonID)?  (

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "flex-start",
                                                alignItems: "center", 
                                                gap: "8px"
                                            }}
                                        >
                                        
                                            <IconButton 
                                                onClick = {() => this.props.history.goBack()}
                                                aria-label = "Back" 
                                            >
                                                <img src={leftArrow} alt="Back Arrow" />

                                            </IconButton>

                                            <div style={{ fontWeight: 600 }}> {findLessonById(this.props.lessonID).courseName} </div>
                                            
                                        </div>
                                        
                                    )
                                        : ""
                                }
                                </Grid>


                                <Grid xs = {3} item key={3}>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexGrow: 1,
                                            justifyContent: "flex-end",
                                            border: 'none'
                                        }}
                                    >

                                        <IconButton
                                            aria-label="about"
                                            title={`About ${SITE_NAME}`}
                                            onClick={this.togglePopup}
                                        >
                                            <HelpOutlineOutlinedIcon
                                                htmlColor={"#ffffff"}
                                                style={{
                                                    fontSize: 36,
                                                    margin: -2,
                                                }}
                                            />
                                        </IconButton>

 
                                        {this.state.status === "learning" && (
                                            <IconButton
                                                aria-label="report problem"
                                                onClick={this.toggleFeedback}
                                                title={"Report Problem"}
                                                
                                            >
                                                <FeedbackOutlinedIcon
                                                    htmlColor={"#ffffff"}
                                                    style={{
                                                        fontSize: 32,
                                                    }}
                                                />
                                            </IconButton>
                                        )}

                                    </div>
                                    <Popup isOpen={showPopup} onClose={this.togglePopup}>
                                        <About />
                                    </Popup>
                                    
                                </Grid>

                            </Grid>
                        </Toolbar>
                    </AppBar>            

                    <div style={{ height: 56 }} />

                    <div 
                        style = {{
                            marginLeft: this.state.drawerOpen 
                                ? drawerWidth 
                                : 0,  
                            transition: "margin 0.1s ease",   
                        }}
                    >

                        {/* {this.state.status === "learning" ? (
                            <AppBar position="static" 
                                style = {{
                                    backgroundColor: '#F6F8FA',
                                    boxShadow: 'none',
                                }}>
                                <Toolbar style={{ minHeight: '80px'}}>
                                    <Grid
                                        container
                                        spacing={2}
                                        role={"progress-bar"}
                                        alignItems={"center"}
                                    >

                                        {!this.state.drawerOpen && (
                                            <Grid item xs={1} >
                                                
                                                <div style={{color: '#4C7D9F'}}>
                                                    <IconButton 
                                                        aria-label = "Table of Contents Toggle" 
                                                        onClick = {() => this.toggleDrawer(true)}
                                                        disabled = {this.state.drawerOpen}
                                                    >
                                                        <img 
                                                            src={menuToggle} 
                                                            alt="Table of Contents" 
                                                            style={{
                                                                width: 40,
                                                                height: 40
                                                            }}
                                                        />

                                                    </IconButton>
                                                </div>
                                            </Grid>
                                        )}

                                        <Grid item xs={3}>
                                            
                                            <div style={{
                                                color: "#21272A",
                                                fontWeight: 600,
                                                fontFamily: 'Titillium Web',
                                                marginLeft: 35
                                            }}>
                                                question yada / yada
                                            </div>

                                        </Grid>

                                        <Grid item xs={5} >
                                            
                                            <div style={{color: '#4C7D9F'}}>
                                                progress bar goes here 
                                            </div>

                                        </Grid>
                                    </Grid>
                                </Toolbar>

                            </AppBar>
                        ) : (
                            ""
                        )} */}



                        {this.state.status === "courseSelection" ? (
                            <LessonSelectionWrapper
                                selectLesson={this.selectLesson}
                                selectCourse={this.selectCourse}
                                history={this.props.history}
                                removeProgress={this.props.removeProgress}
                            />
                        ) : (
                            ""
                        )}
                        {this.state.status === "lessonSelection" ? (
                            <LessonSelectionWrapper
                                selectLesson={this.selectLesson}
                                removeProgress={this.props.removeProgress}
                                history={this.props.history}
                                courseNum={this.props.courseNum}
                            />
                        ) : (
                            ""
                        )}
                        {this.state.status === "learning" ? (
                            <ErrorBoundary
                                componentName={"Problem"}
                                descriptor={"problem"}
                            >
                                <ProblemWrapper
                                    problem={this.state.currProblem}
                                    problemComplete={this.problemComplete}
                                    lesson={this.lesson}
                                    seed={this.state.seed}
                                    lessonID={this.props.lessonID}
                                    displayMastery={this.displayMastery}
                                />
                            </ErrorBoundary>
                        ) : (
                            ""
                        )}
                        {this.state.status === "exhausted" ? (
                            <center>
                                <h2>
                                    Thank you for learning with {SITE_NAME}. You have
                                    finished all problems.
                                </h2>
                            </center>
                        ) : (
                            ""
                        )}
                        {this.state.status === "graduated" ? (
                            <center>
                                <h2>
                                    Thank you for learning with {SITE_NAME}. You have
                                    mastered all the skills for this session!
                                </h2>
                            </center>
                        ) : (
                            ""
                        )}

                        {this.state.showFeedback && (
                        <div className="Feedback" 
                            style={{
                                marginBottom: 100,
                                marginTop: -70
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
                                                onClick={this.submitFeedback}
                                                style={{ width: "100%" }}
                                                disabled={this.state.feedback.trim() === ""}
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
                                </div>
                            )}
                        </div>
                        
                    )}
                    </div>
                </div>
            </>

        );
    }
}

export default withStyles(styles)(withRouter(withTranslation(Platform)));
