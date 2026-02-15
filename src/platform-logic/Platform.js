import React from "react";
import { AppBar, Toolbar } from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";
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
    SHOW_NOT_CANVAS_WARNING,
    CANVAS_WARNING_STORAGE_KEY,
} from "../config/config.js";
import to from "await-to-js";
import { toast } from "react-toastify";
import ToastID from "../util/toastIds";
import BrandLogoNav from "@components/BrandLogoNav";
import { cleanArray } from "../util/cleanObject";
import ErrorBoundary from "@components/ErrorBoundary";
import { CONTENT_SOURCE } from "@common/global-config";
import withTranslation from "../util/withTranslation";

import userIcon from "../assets/UserThumb.svg";
import IconButton from "@material-ui/core/IconButton";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import FeedbackOutlinedIcon from "@material-ui/icons/FeedbackOutlined";
import leftArrow from "../assets/chevron-left.svg";

import Popup from "../components/Popup/Popup";
import About from "../pages/Posts/About.js";

import { animateScroll as scroll } from "react-scroll";
import { chooseVariables } from "../platform-logic/renderText.js";
import TextField from "@material-ui/core/TextField";
import Spacer from "../components/Spacer";
import Button from "@material-ui/core/Button";

import ToCButton from "../assets/layoutLeft.svg";

import { withStyles } from "@material-ui/core/styles";
import styles from "../components/problem-layout/common-styles.js";

import Drawer from "@material-ui/core/Drawer";
import TableOfContents from "../components/tableOfContents.js";

import withWidth from "@material-ui/core/withWidth";

import { ProgressTooltip, InfoTooltip } from "@components/Tooltip";
import { LocalizationConsumer } from '../util/LocalizationContext';

let problemPool = require(`@generated/processed-content-pool/${CONTENT_SOURCE}.json`);

let seed = Date.now().toString();
console.log("Generated seed");

const TOC_DRAWER_OPEN_KEY = "toc:drawer-open:v1";

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
    this.isPrivileged = !!this.user.privileged;
    this.context = context;
    const saved = typeof window !== "undefined" ? localStorage.getItem(TOC_DRAWER_OPEN_KEY) : null;
    const defaultOpenIfNoPref = Boolean(props.lessonID);
    const initialDrawerOpen = saved === null ? defaultOpenIfNoPref : saved === "1";

    this.state = {
      showPopup: false,
      feedback: "",
      feedbackSubmitted: false,
      drawerOpen: initialDrawerOpen,
      hasAutoClosedDrawer: false,
    };

    this.togglePopup = this.togglePopup.bind(this);
    this.toggleFeedback = this.toggleFeedback.bind(this);

    for (const problem of this.problemIndex.problems) {
      for (let stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
        const step = problem.steps[stepIndex];
        step.knowledgeComponents = cleanArray(context.skillModel[step.id] || []);
      }
    }
    if (this.props.lessonID == null) {
      this.state = {
        currProblem: null,
        status: "courseSelection",
        seed: seed,
        feedback: "",
        feedbackSubmitted: false,
        drawerOpen: initialDrawerOpen,
      };
    } else {
      this.state = {
        currProblem: null,
        status: "courseSelection",
        seed: seed,
        feedback: "",
        feedbackSubmitted: false,
        drawerOpen: initialDrawerOpen,
      };
    }

    this.selectLesson = this.selectLesson.bind(this);
  }

    componentDidMount() {
        this._isMounted = true;

        const { enterCourse, exitCourse} = this.props;

        const isHomePage = this.props.history.location.pathname === '/';
        if (isHomePage) {
            exitCourse();
            this.onComponentUpdate(null, null, null);
            return;
        }

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

            // const { setLanguage } = this.props;
            
            // if (lesson.courseName == 'Matematik 4') {
            //     setLanguage('se')
            // } else {
            //     const defaultLocale = localStorage.getItem('defaultLocale');
            //     setLanguage(defaultLocale)
            // }

            const course = coursePlans.find(c => 
                c.lessons.some(l => l.id === this.props.lessonID)
            );
            
            if (course) {
                // Pass course ID and language from coursePlans.json
                enterCourse(course.courseName, course.language);
            }

        } else if (this.props.courseNum != null) {

            const course = coursePlans[parseInt(this.props.courseNum)];
            if (course) {
                enterCourse(course.courseName, course.language);
            }

            this.selectCourse(coursePlans[parseInt(this.props.courseNum)]);
        }


        this.onComponentUpdate(null, null, null);
    }

  componentWillUnmount() {
    this._isMounted = false;
    this.context.problemID = "n/a";
  }

    componentDidUpdate(prevProps, prevState, snapshot) {
        
        const { enterCourse, exitCourse } = this.props;
        
        // If navigating to home, exit course context
        if (this.props.history.location.pathname === '/' && 
            prevProps.history.location.pathname !== '/') {
            exitCourse();
        }
        
        // If lesson changed, update course context
        if (this.props.lessonID !== prevProps.lessonID && this.props.lessonID != null) {
            const lesson = findLessonById(this.props.lessonID);
            const course = coursePlans.find(c => 
                c.lessons.some(l => l.id === this.props.lessonID)
            );
            
            if (course) {
                enterCourse(course.courseName, course.language);
            }
            if (lesson) {
                this.selectLesson(lesson, false);
            }
        }
        
        // If course changed
        if (this.props.courseNum !== prevProps.courseNum && this.props.courseNum != null) {
            const course = coursePlans[parseInt(this.props.courseNum)];
            if (course) {
                enterCourse(course.courseName, course.language);
            }
        }

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

    getProgressBarData() {
        if (!this.lesson) return { completed: 0, total: 0, percent: 0 };

        const lessonName = String(this.lesson.name.replace("Lesson ", "") + " " + this.lesson.topics);
        const problems = this.problemIndex.problems.filter(
            ({ lesson }) => String(lesson).includes(lessonName)
        );
        const completed = this.completedProbs.size;
        const total = problems.length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, total, percent };
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
                    const [, ...addInfo] = responseText.split("|");
                    this.props.history.push(
                        `/assignment-already-linked?to=${addInfo[0] ?? ""}`
                    );
                }
            }
        }

    this.lesson = lesson;

    // Calculate effective enable_ai_chat (lesson overrides course)
    if (lesson.enable_ai_chat === undefined) {
      const course = coursePlans.find(c => c.courseName === lesson.courseName);
      this.lesson.enable_ai_chat = course?.enable_ai_chat;
    }

    const loadLessonProgress = async () => {
      const { getByKey } = this.context.browserStorage;
      return await getByKey(LESSON_PROGRESS_STORAGE_KEY(this.lesson.id)).catch((err) => {});
    };

    const [, prevCompletedProbs] = await Promise.all([this.props.loadBktProgress(), loadLessonProgress()]);
    if (!this._isMounted) return;
    if (prevCompletedProbs) {
      this.completedProbs = new Set(prevCompletedProbs);
    }
    this.setState({
      currProblem: this._nextProblem(this.context ? this.context : context),
    });
  }

  selectCourse = (course, context) => {
    this.course = course;
    this.setState({
      status: "lessonSelection",
      selectedCourse: course,
    });
  };

  _nextProblem = (context) => {
    seed = Date.now().toString();
    this.setState({ seed: seed });
    this.props.saveProgress();
    const problems = this.problemIndex.problems.filter(({ courseName }) => !courseName.toString().startsWith("!!"));
    let chosenProblem;

    for (const problem of problems) {
      let probMastery = 1;
      let isRelevant = false;
      for (const step of problem.steps) {
        if (typeof step.knowledgeComponents === "undefined") continue;
        for (const kc of step.knowledgeComponents) {
          if (typeof context.bktParams[kc] === "undefined") continue;
          if (kc in this.lesson.learningObjectives) {
            isRelevant = true;
          }
          if (!(kc in context.bktParams)) continue;
          probMastery *= context.bktParams[kc].probMastery;
        }
      }
      if (isRelevant) {
        problem.probMastery = probMastery;
      } else {
        problem.probMastery = null;
      }
    }

    chosenProblem = context.heuristic(problems, this.completedProbs);

    const objectives = Object.keys(this.lesson.learningObjectives);
    let score = objectives.reduce((x, y) => {
      return x + context.bktParams[y].probMastery;
    }, 0);
    score /= objectives.length;
    this.displayMastery(score);

    if (!Object.keys(context.bktParams).some((skill) => context.bktParams[skill].probMastery <= MASTERY_THRESHOLD)) {
      this.setState({ status: "graduated" });
      return null;
    } else if (chosenProblem == null) {
      if (this.lesson && !this.lesson.allowRecycle) {
        this.setState({ status: "exhausted" });
        return null;
      } else {
        this.completedProbs = new Set();
        chosenProblem = context.heuristic(problems, this.completedProbs);
      }
    }

    if (chosenProblem) {
      this.setState({ currProblem: chosenProblem, status: "learning" });
      this.context.firebase.startedProblem(
        chosenProblem.id,
        chosenProblem.courseName,
        chosenProblem.lesson,
        this.lesson.learningObjectives
      );
      return chosenProblem;
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

        if (this.lesson.enableCompletionMode) {
            const relevantKc = {};
            Object.keys(this.lesson.learningObjectives).forEach((x) => {
                relevantKc[x] = context.bktParams[x]?.probMastery ?? 0;
            });

            // Check if all problems are completed or all skills 
            const progressData = this.getProgressBarData();
            const progressPercent = progressData.percent / 100;

            const allProblemsCompleted = progressData.completed === progressData.total;
            if (allProblemsCompleted) {
                console.debug("updateCanvas called because lesson is complete");
            }

            this.updateCanvas(progressPercent, relevantKc);
            this._nextProblem(context);
        } else {
            this._nextProblem(context);
        }
    };

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


  displayMastery = (mastery) => {
    this.setState({ mastery: mastery });
    if (mastery >= MASTERY_THRESHOLD) {
      toast.success("You've successfully completed this assignment!", {
        toastId: ToastID.successfully_completed_lesson.toString(),
      });
    }
  };

  togglePopup() {
    this.setState((prevState) => ({
      showPopup: !prevState.showPopup,
    }));
  }

  submitFeedback = () => {
    const problem = this.state.currProblem;
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
    this.setState(
      (prevState) => ({
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
    try {
      localStorage.setItem(TOC_DRAWER_OPEN_KEY, open ? "1" : "0");
    } catch (e) {}
    this.setState({ drawerOpen: open, hasAutoClosedDrawer: false });
  };

  getLessonMasteryMap = (courseName) => {
    if (!courseName) return {};
    const course = coursePlans.find((c) => c.courseName === courseName);
    if (!course) return {};

    const map = {};
    for (const lesson of course.lessons) {
      const kcs = Object.keys(lesson.learningObjectives || {});
      if (kcs.length === 0) {
        map[lesson.id] = 0;
        continue;
      }
      let sum = 0;
      let count = 0;
      for (const kc of kcs) {
        const m = this.context?.bktParams?.[kc]?.probMastery;
        if (typeof m === "number" && !Number.isNaN(m)) {
          sum += m;
          count += 1;
        }
      }
      map[lesson.id] = count ? sum / count : 0;
    }
    return map;
  };

  render() {
    const { translate } = this.props;
    const { showPopup } = this.state;
    const { classes } = this.props;
    const drawerWidth = 340;

    this.studentNameDisplay = this.context.studentName ? decodeURIComponent(this.context.studentName) : translate("platform.LoggedIn");

    const tocCourseName = this.state.selectedCourse?.courseName || findLessonById(this.props.lessonID)?.courseName;

    const lessonMasteryMap = this.getLessonMasteryMap(tocCourseName);
    const inLesson = Boolean(this.props.lessonID);

    // Shared, centered max-width container for BOTH progress area and problem area
    const CONTAINER_MAX_WIDTH = "100vw";
    const CONTAINER_STYLE = {
      maxWidth: CONTAINER_MAX_WIDTH,
      width: "100%",
      margin: inLesson && this.state.drawerOpen ? "0 0 0 16px" : "0 0 0 32px",
      padding: "0 16px",
      boxSizing: "border-box",
    };
    const PROGRESS_GAP = 20;            // keep the same spacing you had before
    const MAX_PROGRESS_BAR_WIDTH = 602;
    const MIN_PROGRESS_BAR_WIDTH = 200;

    return (
      <>
        {inLesson && (
          <Drawer
            variant="persistent"
            anchor="left"
            open={this.state.drawerOpen}
            classes={{ paper: this.props.classes.drawerPaper }}
            style={{ position: "fixed", width: 320, flexShrink: 0 }}
            PaperProps={{ style: { padding: 0 } }}
          >
            <div style={{ width: drawerWidth, padding: 16 }}>
              <IconButton aria-label="Table of Contents Toggle" onClick={() => this.toggleDrawer(false)}>
                <img src={ToCButton} alt="Table of Contents" style={{ width: 24, height: 24 }} />
              </IconButton>

              <TableOfContents
                courseName={tocCourseName}
                courseMastery={this.state.mastery || 0}
                mastery={lessonMasteryMap}
                onLessonClick={this.handleLessonClick}
                selectedLessonId={this.props.lessonID}
                drawerOpen={this.state.drawerOpen}
              />
            </div>
          </Drawer>
        )}

        <div
          style={{
            backgroundColor: "#F6F6F6",
            paddingBottom: 20,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top bar: "OATutor" logo, user icon and name */}
          <AppBar position="fixed" style={{ backgroundColor: "#FFFFFF" }}>
            <Toolbar>
              <Grid container spacing={0} role={"navigation"} alignItems={"center"}>
                <Grid item xs={3} key={1}>
                  <BrandLogoNav isPrivileged={this.isPrivileged} />
                </Grid>
                <Grid item xs={5} key={2}></Grid>
                <Grid xs={4} item key={3}>
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
                    <div style={{ fontWeight: 600 }}>{this.studentNameDisplay}</div>
                  </div>
                </Grid>
              </Grid>
            </Toolbar>
          </AppBar>

          <div className={classes.toolbarOffset} />
          
          {/* Second top bar:  course name, about and report problem buttons */}
          <AppBar position="fixed" className={classes.secondBarOffset}>
            <Toolbar style={{ minHeight: "56px" }}>
              <Grid container spacing={0} role={"secondary-navigation"} alignItems={"center"}>
                <Grid item xs={9} key={1}>
                  {this.state.selectedCourse ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <IconButton onClick={() => this.props.history.goBack()} aria-label="Back">
                        <img src={leftArrow} alt="Back Arrow" />
                      </IconButton>

                      <div style={{ fontWeight: 600 }}> {this.state.selectedCourse.courseName} </div>
                    </div>
                  ) : findLessonById(this.props.lessonID) ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <IconButton onClick={() => this.props.history.goBack()} aria-label="Back">
                        <img src={leftArrow} alt="Back Arrow" />
                      </IconButton>

                      <div style={{ fontWeight: 600 }}> {findLessonById(this.props.lessonID).courseName} </div>
                    </div>
                  ) : (
                    ""
                  )}
                </Grid>

                <Grid xs={3} item key={3}>
                  <div
                    style={{
                      display: "flex",
                      flexGrow: 1,
                      justifyContent: "flex-end",
                      border: "none",
                    }}
                  >
                    <IconButton aria-label="about" title={`About ${SITE_NAME}`} onClick={this.togglePopup}>
                      <HelpOutlineOutlinedIcon htmlColor={"#ffffff"} style={{ fontSize: 36, margin: -2 }} />
                    </IconButton>

                    {this.state.status === "learning" && (
                      <IconButton aria-label="report problem" onClick={this.toggleFeedback} title={"Report Problem"}>
                        <FeedbackOutlinedIcon htmlColor={"#ffffff"} style={{ fontSize: 32 }} />
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

          {/* Progress Bar */}
          <div
            style={{
              marginLeft: inLesson && this.state.drawerOpen ? drawerWidth : 0,
              transition: "margin 0.1s ease",
            }}
          >
            {this.state.status === "learning" ? (
              <AppBar position="sticky" style={{ top: 120, backgroundColor: "#F6F6F6", boxShadow: "none", zIndex: 1, marginLeft: "16px" }}>
                <Toolbar disableGutters style={{ minHeight: 80 }}>
                  <Grid container spacing={0} role="progress-bar" alignItems="center" style={{ width: "100%" }}>
                    {!this.state.drawerOpen && (
                      <IconButton
                        aria-label="Table of Contents Toggle"
                        onClick={() => this.toggleDrawer(true)}
                        disabled={this.state.drawerOpen}
                        style={{ position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)" }}
                      >
                        <img src={ToCButton} alt="Table of Contents" style={{ width: 24, height: 24 }} />
                      </IconButton>
                    )}
                    
                    <Grid item xs={12}>
                      <div style={CONTAINER_STYLE}>
                        {/* One centered row, 3 columns: [label] [bar (min..max)] [info] */}
                        <div
                          style={{
                            display: "grid",
                            // Middle column gets a real width range so it NEVER collapses
                            gridTemplateColumns: `auto minmax(${MIN_PROGRESS_BAR_WIDTH}px, ${MAX_PROGRESS_BAR_WIDTH}px) auto`,
                            alignItems: "center",
                            justifyContent: "center",    // center the whole trio as a group
                            columnGap: PROGRESS_GAP,
                            width: "100%",
                            maxWidth: "100%",
                          }}
                        >
                          {/* Left: lightning + label */}
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <img
                              src="/place-holder/static/images/icons/mastery-bolt.png"
                              alt="Mastery Icon"
                              width={20}
                              height={20}
                              style={{ display: "block" }}
                            />
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 500, color: "#000" }}>
                              Lesson Mastery: {Math.round((this.state.mastery || 0) * 100)}%
                            </span>
                          </div>

                          {/* Middle: progress bar (cannot collapse; capped at MAX_PROGRESS_BAR_WIDTH) */}
                          <div style={{ minWidth: 0 /* allow inner 100% to shrink within minmax */ }}>
                            <ProgressTooltip
                              arrow
                              placement="bottom"
                              interactive
                              title={
                                <div style={{ width: "100%", boxSizing: "border-box" }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      marginBottom: 8,
                                      lineHeight: "28px",
                                    }}
                                  >
                                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600 }}>Learning Objectives:</div>
                                    {(() => {
                                      const keys = Object.keys(this.lesson?.learningObjectives || {});
                                      const mastered = keys.filter(
                                        (k) => (this.context.bktParams[k]?.probMastery ?? 0) >= MASTERY_THRESHOLD
                                      ).length;
                                      return (
                                        <div style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                                          <img src="/place-holder/static/images/icons/mastery-bolt.png" alt="" width={20} height={20} />
                                          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500 }}>
                                            {mastered}/{keys.length}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>

                                  {Object.entries(this.lesson?.learningObjectives || {}).map(([kc]) => {
                                    const mastery = this.context.bktParams[kc]?.probMastery ?? 0;
                                    const pct = Math.round(mastery * 100);
                                    const label = kc.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                                    return (
                                      <div key={kc} style={{ marginBottom: 12 }}>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: 4,
                                          }}
                                        >
                                          <div
                                            title={label}
                                            style={{
                                              fontFamily: "Inter, sans-serif",
                                              fontSize: 12,
                                              fontWeight: 500,
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                              marginRight: 8,
                                            }}
                                          >
                                            {label}
                                          </div>
                                          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>
                                            {pct}%
                                          </div>
                                        </div>

                                        <div
                                          style={{
                                            width: "100%",
                                            height: 8,
                                            backgroundColor: "#E8EDEC",
                                            borderRadius: 4,
                                            overflow: "hidden",
                                          }}
                                        >
                                          <div
                                            style={{
                                              width: `${pct}%`,
                                              height: "100%",
                                              backgroundColor: "#83CDC1",
                                              transition: "width 0.3s ease-in-out",
                                            }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              }
                            >
                              {/* Track fills the minmax column width (never 0, never > MAX) */}
                              <div
                                role="progressbar"
                                aria-valuenow={Math.round((this.state.mastery || 0) * 100)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{
                                  width: "100%",
                                  height: 16,
                                  backgroundColor: "#E8EDEC",
                                  borderRadius: 18,
                                  overflow: "hidden",
                                  cursor: "pointer",
                                }}
                              >
                                <div
                                    style={{
                                        textAlign: "right",
                                        paddingTop: "3px",
                                    }}
                                >
                                    {this.state.status !== "courseSelection" &&
                                    this.state.status !== "lessonSelection" &&
                                    (this.lesson.showStuMastery == null ||
                                        this.lesson.showStuMastery)
                                        ? this.studentNameDisplay +
                                        translate('platform.Mastery') +
                                          Math.round(this.state.mastery * 100) +
                                          "%"
                                        : ""}
                                </div>
                              </div>
                            </ProgressTooltip>
                          </div>
                        </div>
                      </div>
                    </Grid>
                  </Grid>
                </Toolbar>
              </AppBar>
            ) : (
              ""
            )}

            {/* Progress Bar */}
                {this.lesson?.enableCompletionMode && (
                    <div style={{ padding: "10px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                            <span>Progress</span>
                            <span>{this.getProgressBarData().percent}% ({this.getProgressBarData().completed}/{this.getProgressBarData().total})</span>
                        </div>
                        <LinearProgress
                            variant="determinate"
                            value={this.getProgressBarData().percent}
                            style={{ height: 10, borderRadius: 5 }}
                        />
                    </div>
                )}

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
                            progressPercent={this.getProgressBarData().percent / 100}
                          lessonMasteryMap={lessonMasteryMap}
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
          </div>
        </div>
        </>
      );
    }
}

// export default withRouter(withTranslation(Platform));

const StyledPlatform = withStyles(styles)(Platform);

export default withRouter(withTranslation((props) => (
    <LocalizationConsumer>
        {({ language, enterCourse, exitCourse }) => (
            <StyledPlatform
                {...props}
                language={language}
                enterCourse={enterCourse}
                exitCourse={exitCourse}
            />
        )}
    </LocalizationConsumer>
)));
