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
    if (this.props.lessonID != null) {
      const lesson = findLessonById(this.props.lessonID);
      this.selectLesson(lesson).then((_) => {});
      const { setLanguage } = this.props;
      if (lesson.courseName == "Matematik 4") {
        setLanguage("se");
      } else {
        const defaultLocale = localStorage.getItem("defaultLocale");
        setLanguage(defaultLocale);
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
    const lessonIdChanged = this.props.lessonID !== prevProps.lessonID && this.props.lessonID != null;
    const movedIntoLesson = !Boolean(prevProps.lessonID) && Boolean(this.props.lessonID);
    if (lessonIdChanged) {
      const lesson = findLessonById(this.props.lessonID);
      if (lesson) {
        this.selectLesson(lesson).then(() => {});
      }
    }
    if (movedIntoLesson) {
      let saved = null;
      try {
        saved = localStorage.getItem(TOC_DRAWER_OPEN_KEY);
      } catch (e) {}
      if (saved === null && !this.state.drawerOpen) {
        this.toggleDrawer(true);
      }
    }
    this.onComponentUpdate(prevProps, prevState, snapshot);
  }

  handleLessonClick = (lesson) => {
    if (lesson && lesson.id) {
      this.props.history.push(`/lessons/${lesson.id}`);
    }
  };

  onComponentUpdate(prevProps, prevState, snapshot) {
    if (Boolean(this.state.currProblem?.id) && this.context.problemID !== this.state.currProblem.id) {
      this.context.problemID = this.state.currProblem.id;
    }
    if (this.state.status !== "learning") {
      this.context.problemID = "n/a";
    }
  }

  async selectLesson(lesson, updateServer = true) {
    const context = this.context;
    if (!this._isMounted) return;
    if (this.isPrivileged) {
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
        toast.error(`Error setting lesson for assignment "${this.user.resource_link_title}"`);
        return;
      } else {
        if (response.status !== 200) {
          switch (response.status) {
            case 400: {
              const responseText = await response.text();
              let [message, ...addInfo] = responseText.split("|");
              if (Array.isArray(addInfo) && addInfo[0].length > 1) {
                addInfo = JSON.parse(addInfo[0]);
              }
              switch (message) {
                case "resource_already_linked":
                  toast.error(`${addInfo.from} has already been linked to lesson ${addInfo.to}. Please create a new assignment.`, {
                    toastId: ToastID.set_lesson_duplicate_error.toString(),
                  });
                  return;
                default:
                  toast.error(`Error: ${responseText}`, {
                    toastId: ToastID.expired_session.toString(),
                    closeOnClick: true,
                  });
                  return;
              }
            }
            case 401:
              toast.error(`Your session has either expired or been invalidated, please reload the page to try again.`, {
                toastId: ToastID.expired_session.toString(),
              });
              this.props.history.push("/session-expired");
              return;
            case 403:
              toast.error(`You are not authorized to make this action. (Are you an instructor?)`, {
                toastId: ToastID.not_authorized.toString(),
              });
              return;
            default:
              toast.error(
                `Error setting lesson for assignment "${this.user.resource_link_title}." If reloading does not work, please contact us.`,
                {
                  toastId: ToastID.set_lesson_unknown_error.toString(),
                }
              );
              return;
          }
        } else {
          toast.success(`Successfully linked assignment "${this.user.resource_link_title}" to lesson ${lesson.id} "${lesson.topics}"`, {
            toastId: ToastID.set_lesson_success.toString(),
          });
          const responseText = await response.text();
          let [message, ...addInfo] = responseText.split("|");
          this.props.history.push(`/assignment-already-linked?to=${addInfo.to}`);
        }
      }
    }

    this.lesson = lesson;

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
    await setByKey(LESSON_PROGRESS_STORAGE_KEY(this.lesson.id), this.completedProbs).catch((error) => {
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
    const drawerWidth = 356;

    this.studentNameDisplay = this.context.studentName ? decodeURIComponent(this.context.studentName) : translate("platform.LoggedIn");

    const tocCourseName = this.state.selectedCourse?.courseName || findLessonById(this.props.lessonID)?.courseName;

    const lessonMasteryMap = this.getLessonMasteryMap(tocCourseName);
    const inLesson = Boolean(this.props.lessonID);

    // Shared, centered max-width container for BOTH progress area and problem area
    const CONTAINER_MAX_WIDTH = 1032;
    const CONTAINER_STYLE = {
      maxWidth: CONTAINER_MAX_WIDTH,
      width: "100%",
      margin: "0 auto",
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

          <div
            style={{
              marginLeft: inLesson && this.state.drawerOpen ? drawerWidth : 0,
              transition: "margin 0.1s ease",
            }}
          >
            {this.state.status === "learning" ? (
              <AppBar position="static" style={{ backgroundColor: "#F6F8FA", boxShadow: "none" }}>
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
                                    width: `${Math.round((this.state.mastery || 0) * 100)}%`,
                                    height: "100%",
                                    backgroundColor: "#67CDBC",
                                    borderRadius: 18,
                                    transition: "width 0.3s ease",
                                  }}
                                />
                              </div>
                            </ProgressTooltip>
                          </div>

                          {/* Right: info icon */}
                          <InfoTooltip
                            arrow
                            placement="bottom"
                            enterTouchDelay={0}
                            leaveTouchDelay={3000}
                            title={
                              <div style={{ width: "100%", boxSizing: "border-box" }}>
                                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                                  What is Mastery?
                                </div>
                                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 400, lineHeight: "16px" }}>
                                  Mastery estimates your understanding based on lesson objectives completed.
                                </div>
                              </div>
                            }
                          >
                            <img
                              src="/place-holder/static/images/icons/information-icon.png"
                              alt="Info"
                              width={20}
                              height={20}
                              style={{ display: "block", cursor: "pointer" }}
                            />
                          </InfoTooltip>
                        </div>
                      </div>
                    </Grid>
                  </Grid>
                </Toolbar>
              </AppBar>
            ) : (
              ""
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
              <ErrorBoundary componentName={"Problem"} descriptor={"problem"}>
                <div style={CONTAINER_STYLE}>
                  <ProblemWrapper
                    problem={this.state.currProblem}
                    problemComplete={this.problemComplete}
                    lesson={this.lesson}
                    seed={this.state.seed}
                    lessonID={this.props.lessonID}
                    displayMastery={this.displayMastery}
                    drawerOpen={this.state.drawerOpen}
                  />
                </div>
              </ErrorBoundary>
            ) : (
              ""
            )}
            {this.state.status === "exhausted" ? (
              <center>
                <h2>Thank you for learning with {SITE_NAME}. You have finished all problems.</h2>
              </center>
            ) : (
              ""
            )}
            {this.state.status === "graduated" ? (
              <center>
                <h2>Thank you for learning with {SITE_NAME}. You have mastered all the skills for this session!</h2>
              </center>
            ) : (
              ""
            )}

            {this.state.showFeedback && (
              <div
                className="Feedback"
                style={{
                  marginBottom: 100,
                  marginTop: -70,
                }}
              >
                <center>
                  <h1>{translate("problem.Feedback")}</h1>
                </center>
                <div className={classes.textBox}>
                  <div className={classes.textBoxHeader}>
                    <center>{this.state.feedbackSubmitted ? translate("problem.Thanks") : translate("problem.Description")}</center>
                  </div>
                  {this.state.feedbackSubmitted ? (
                    <Spacer />
                  ) : (
                    <Grid container spacing={0}>
                      <Grid item xs={1} sm={2} md={2} key={1} />
                      <Grid item xs={10} sm={8} md={8} key={2}>
                        <TextField
                          id="outlined-multiline-flexible"
                          label={translate("problem.Response")}
                          multiline
                          fullWidth
                          minRows="6"
                          maxRows="20"
                          value={this.state.feedback}
                          onChange={(event) => this.setState({ feedback: event.target.value })}
                          className={classes.textField}
                          margin="normal"
                          variant="outlined"
                        />{" "}
                      </Grid>
                      <Grid item xs={1} sm={2} md={2} key={3} />
                    </Grid>
                  )}
                </div>
                {this.state.feedbackSubmitted ? (
                  ""
                ) : (
                  <div className="submitFeedback">
                    <Grid container spacing={0}>
                      <Grid item xs={3} sm={3} md={5} key={1} />
                      <Grid item xs={6} sm={6} md={2} key={2}>
                        <Button
                          className={classes.button}
                          onClick={this.submitFeedback}
                          style={{ width: "100%" }}
                          disabled={this.state.feedback.trim() === ""}
                        >
                          {translate("problem.Submit")}
                        </Button>
                      </Grid>
                      <Grid item xs={3} sm={3} md={5} key={3} />
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

export default withWidth()(withStyles(styles)(withRouter(withTranslation(Platform))));
