import React from "react";
import { AppBar, Toolbar } from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";
import Grid from "@material-ui/core/Grid";
import ProblemWrapper from "@components/problem-layout/ProblemWrapper.js";
import LessonSelectionWrapper from "@components/problem-layout/LessonSelectionWrapper.js";
import { withRouter } from "react-router-dom";

import {
    coursePlans,
    _coursePlansNoEditor,
    findLessonById,
    LESSON_PROGRESS_STORAGE_KEY,
    MIDDLEWARE_URL,
    SITE_NAME,
    ThemeContext,
    MASTERY_THRESHOLD,
    getNormalizedMastery,
} from "../config/config.js";
import {
    resolveMetaLesson,
    resolveMetaLessonBranchAware,
    resolveMetaLessonDeterministic,
    applyMetaLessonLogic,
} from "../util/metaLessonUtils.js";
import to from "await-to-js";
import { toast } from "react-toastify";
import ToastID from "../util/toastIds";
import BrandLogoNav from "@components/BrandLogoNav";
import { cleanArray } from "../util/cleanObject";
import ErrorBoundary from "@components/ErrorBoundary";
import { CONTENT_SOURCE } from "@common/global-config";
import withTranslation from "../util/withTranslation";
import confetti from "canvas-confetti";

import userIcon from "../assets/UserThumb.svg";
import IconButton from "@material-ui/core/IconButton";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import FeedbackOutlinedIcon from "@material-ui/icons/FeedbackOutlined";
import leftArrow from "../assets/chevron-left.svg";

import Popup from "../components/Popup/Popup";
import About from "../pages/Posts/About.js";

import { animateScroll as scroll } from "react-scroll";
import { chooseVariables } from "../platform-logic/renderText.js";
import Button from "@material-ui/core/Button";

import ToCButton from "../assets/layoutLeft.svg";

import { withStyles } from "@material-ui/core/styles";
import styles from "../components/problem-layout/common-styles.js";

import Drawer from "@material-ui/core/Drawer";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import TableOfContents from "../components/tableOfContents.js";

import withWidth from "@material-ui/core/withWidth";

import { ProgressTooltip, InfoTooltip } from "@components/Tooltip";
import { isMobileWidth } from "../util/responsive";

let problemPool = require(`@generated/processed-content-pool/${CONTENT_SOURCE}.json`);

let seed = Date.now().toString();
console.log("Generated seed");

const TOC_DRAWER_OPEN_KEY = "toc:drawer-open:v1";

const findMetaLessonById = (ID) => {
    for (const course of coursePlans) {
        if (course.editor) {
            continue;
        }
        const metaLessons = course.metaLessons || [];
        const foundInMetaLessons = metaLessons.find((metaLesson) => metaLesson.id === ID);
        if (foundInMetaLessons) {
            return foundInMetaLessons;
        }
        const foundInLessons = (course.lessons || []).find(
            (lesson) => lesson.id === ID && lesson.type === "meta_lesson"
        );
        if (foundInLessons) {
            return foundInLessons;
        }
    }
};

class Platform extends React.Component {
  static contextType = ThemeContext;

  constructor(props, context) {
    super(props);

    this.problemIndex = {
      problems: problemPool,
    };
    this.completedProbs = new Set();
    this.lesson = null;

    // Tracks the platform-level language captured just before we override it
    // for a course/lesson. `null` means "not currently inside a course" —
    // used both to know what to restore to, and to guard against re-capturing
    // an already-overridden value on lesson-to-lesson navigation.
    // this._originalLanguage = null;

    this.user = context.user || {};
    this.isPrivileged = !!this.user.privileged;
    this.isFromCanvas =
      String(this.user.tool_consumer_info_product_family_code || "")
        .toLowerCase() === "canvas";
    this.context = context;
    const saved = typeof window !== "undefined" ? localStorage.getItem(TOC_DRAWER_OPEN_KEY) : null;
    const isMobileInitial =
      typeof window !== "undefined" && window.innerWidth < 960;
    const defaultOpenIfNoPref = Boolean(props.lessonID) && !isMobileInitial;
    // Canvas launches are one lesson at a time — never show TOC.
    const initialDrawerOpen = this.isFromCanvas
      ? false
      : saved === null
        ? defaultOpenIfNoPref
        : saved === "1";

    this.togglePopup = this.togglePopup.bind(this);
    this.toggleFeedback = this.toggleFeedback.bind(this);

    for (const problem of this.problemIndex.problems) {
      for (let stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
        const step = problem.steps[stepIndex];
        step.knowledgeComponents = cleanArray(context.skillModel[step.id] || []);
      }
    }

    this.selectLesson = this.selectLesson.bind(this);

    this.state = {
      showPopup: false,
      feedback: "",
      feedbackSubmitted: false,
      drawerOpen: initialDrawerOpen,
      metaCollapsed: false,
      currProblem: null,
      status: this.props.lessonID ? "loading" : "courseSelection",
      seed: seed,
    }
  }



  // Resolves the language a given lesson should be shown in.
  // language resolution 
  _resolveLessonLanguage(lesson) {
      return lesson?.language || null;
  }

  componentDidMount() {
    this._isMounted = true;
    if (this.props.lessonID != null) {
      const lesson = findLessonById(this.props.lessonID) || findMetaLessonById(this.props.lessonID);
      this.selectLesson(lesson).then((_) => {});
      this.props.enterCourse?.(lesson?.courseName, this._resolveLessonLanguage(lesson));
    } else if (this.props.courseNum != null) {
      this.selectCourse(coursePlans[parseInt(this.props.courseNum)]);
    }
    this.onComponentUpdate(null, null, null);
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.context.problemID = "n/a";
    // Safety net for genuine unmounts (full page nav, etc). The more common
    // "back to home" case is handled in componentDidUpdate below, since this
    // component is usually kept mounted across route changes with lessonID
    // simply changing to null as a prop.

    // this._restorePlatformLanguage();
    this.props.exitCourse?.();
    this.course = null;
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
      const lessonIdChanged = this.props.lessonID !== prevProps.lessonID && this.props.lessonID != null;
      const movedIntoLesson = !Boolean(prevProps.lessonID) && Boolean(this.props.lessonID);
      const leftLesson = Boolean(prevProps.lessonID) && !Boolean(this.props.lessonID);
      const leftCourseSelection = Boolean(prevProps.courseNum != null) && this.props.courseNum == null && this.props.lessonID == null;

      if (lessonIdChanged) {
        const lesson = findLessonById(this.props.lessonID) || findMetaLessonById(this.props.lessonID);
        if (lesson) {
          this.selectLesson(lesson).then(() => {});
          this.props.enterCourse?.(lesson.courseName, this._resolveLessonLanguage(lesson));
        }
      }

      if (leftLesson || leftCourseSelection) {
        this.props.exitCourse?.();
        this.course = null;
        this.setState({ selectedCourse: null });
      }

      if (movedIntoLesson && !this.isFromCanvas) {
        let saved = null;
        try {
          saved = localStorage.getItem(TOC_DRAWER_OPEN_KEY);
        } catch (e) {}
        if (saved === null && !this.state.drawerOpen && !isMobileWidth(this.props.width)) {
          this.toggleDrawer(true);
        }
      }
      if (prevState.status !== "completed" && this.state.status === "completed") {
        this.fireConfetti();
      }
      this.onComponentUpdate(prevProps, prevState, snapshot);
  }


  fireConfetti = () => {
    try {
      confetti({
        particleCount: 240,
        spread: 120,
        origin: { x: 0.6, y: 0.6 },
      });
    } catch (e) {}
  };

  handleLessonClick = (lesson) => {
    if (lesson && lesson.id) {
      this.props.history.push(`/lessons/${lesson.id}`);
    }
  };

  handleHierarchyBack = () => {
    if (this.props.lessonID) {
      const lesson = findLessonById(this.props.lessonID);
      const courseIndex = _coursePlansNoEditor.findIndex(
        (course) => course.courseName === lesson?.courseName
      );

      this.props.history.push(courseIndex >= 0 ? `/courses/${courseIndex}` : "/");
      return;
    }

    if (this.props.courseNum != null) {
      this.props.history.push("/");
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

  async linkPrivilegedAssignment(lesson) {
    const context = this.context;
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
      return false;
    }
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
              return false;
            default:
              toast.error(`Error: ${responseText}`, {
                toastId: ToastID.expired_session.toString(),
                closeOnClick: true,
              });
              return false;
          }
        }
        case 401:
          toast.error(`Your session has either expired or been invalidated, please reload the page to try again.`, {
            toastId: ToastID.expired_session.toString(),
          });
          this.props.history.push("/session-expired");
          return false;
        case 403:
          toast.error(`You are not authorized to make this action. (Are you an instructor?)`, {
            toastId: ToastID.not_authorized.toString(),
          });
          return false;
        default:
          toast.error(
            `Error setting lesson for assignment "${this.user.resource_link_title}." If reloading does not work, please contact us.`,
            {
              toastId: ToastID.set_lesson_unknown_error.toString(),
            }
          );
          return false;
      }
    }
    const lessonLabel = lesson.topics || lesson.name || lesson.id;
    toast.success(`Successfully linked assignment "${this.user.resource_link_title}" to lesson ${lesson.id} "${lessonLabel}"`, {
      toastId: ToastID.set_lesson_success.toString(),
    });
    const responseText = await response.text();
    let [, ...addInfo] = responseText.split("|");
    this.props.history.push(`/assignment-already-linked?to=${addInfo.to}`);
    return true;
  }

  async selectLesson(lesson, updateServer = true) {
    if (lesson && lesson.type === "meta_lesson") {
      if (this.isPrivileged && updateServer) {
        if (!this._isMounted) {
          return;
        }
        await this.linkPrivilegedAssignment(lesson);
        return;
      }
      return this.selectMetaLesson(lesson, updateServer);
    }

    const context = this.context;
    if (!this._isMounted) return;
    if (this.isPrivileged) {
      const linked = await this.linkPrivilegedAssignment(lesson);
      if (!linked) {
        return;
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

  async selectMetaLesson(metaLesson, updateServer = true) {
    const order = metaLesson.order || "sequence";
    const choose = metaLesson.choose || "all";

    const stableUserId = this.user?.user_id;
    const useDeterministicAssignment = Boolean(stableUserId);

    const resolvedLessonIds = useDeterministicAssignment
      ? resolveMetaLessonDeterministic(metaLesson, stableUserId, findLessonById, findMetaLessonById)
      : resolveMetaLessonBranchAware(metaLesson, findLessonById, findMetaLessonById);

    if (resolvedLessonIds.length === 0) {
      console.error("Meta lesson contains no valid lessons:", metaLesson);
      toast.error("Meta lesson contains no valid lessons.");
      this.props.history.push("/");
      return;
    }

    this.metaLesson = metaLesson;
    this.completedMetaLessonLessons = new Set();

    const META_LESSON_PATH_KEY = `meta_lesson_path_${metaLesson.id}`;
    const { getByKey, setByKey } = this.context.browserStorage;

    const loadMetaLessonProgress = async () => {
      return await getByKey(LESSON_PROGRESS_STORAGE_KEY(metaLesson.id)).catch(() => {});
    };

    const loadSavedMetaLessonPath = async () => {
      return await getByKey(META_LESSON_PATH_KEY).catch(() => {});
    };

    const [, prevMetaLessonProgress, savedPathRaw] = await Promise.all([
      this.props.loadBktProgress(),
      loadMetaLessonProgress(),
      loadSavedMetaLessonPath(),
    ]);

    if (prevMetaLessonProgress) {
      this.completedMetaLessonLessons = new Set(prevMetaLessonProgress);
    }

    const getValidRandomChoose1Paths = (targetMetaLesson) => {
      const validPaths = [];
      const childLessonIds = Array.isArray(targetMetaLesson.lessons) ? targetMetaLesson.lessons : [];

      for (const childId of childLessonIds) {
        const lesson = findLessonById(childId);
        if (lesson && !lesson.type) {
          validPaths.push([childId]);
          continue;
        }

        const nestedMetaLesson = findMetaLessonById(childId);
        if (nestedMetaLesson && nestedMetaLesson.type === "meta_lesson") {
          const nestedPath = resolveMetaLesson(nestedMetaLesson, findLessonById, findMetaLessonById);
          if (nestedPath.length > 0) {
            validPaths.push(nestedPath);
          }
        }
      }

      return validPaths;
    };

    const isValidRandomChoose1Path = (path, targetMetaLesson) => {
      if (!Array.isArray(path) || path.length === 0) {
        return false;
      }
      if (!path.every((id) => typeof id === "string" && findLessonById(id))) {
        return false;
      }

      const validPaths = getValidRandomChoose1Paths(targetMetaLesson);
      return validPaths.some(
        (validPath) =>
          validPath.length === path.length &&
          validPath.every((id, index) => id === path[index])
      );
    };

    const isValidSequenceAllPath = (path, resolvedIds) => {
      if (!Array.isArray(path) || path.length !== resolvedIds.length) {
        return false;
      }
      const sortedPath = [...path].sort();
      const sortedResolved = [...resolvedIds].sort();
      const sameElements = sortedPath.every((id, i) => id === sortedResolved[i]);
      const allExist = path.every((id) => findLessonById(id));
      return sameElements && allExist;
    };

    let lessonsToShow;

    if (order === "random" && choose === "all") {
      lessonsToShow = applyMetaLessonLogic(resolvedLessonIds, order, choose);
    } else if (order === "random" && choose === "1") {
      if (useDeterministicAssignment) {
        // The branch is a pure function of the student's stable LMS id, so it
        // recomputes identically on every launch -- persisting it adds nothing.
        // Skipping the saved path also avoids a real bug: META_LESSON_PATH_KEY is
        // not user-scoped, so on a shared browser (or after a Canvas "Reset
        // Student") a previous user's saved branch would override the correct
        // deterministic assignment for the next user.
        lessonsToShow = [...resolvedLessonIds];
      } else if (isValidRandomChoose1Path(savedPathRaw, metaLesson)) {
        lessonsToShow = [...savedPathRaw];
      } else {
        lessonsToShow = [...resolvedLessonIds];
        await setByKey(META_LESSON_PATH_KEY, lessonsToShow).catch(() => {});
      }
    } else if (order === "sequence" && choose === "all") {
      if (isValidSequenceAllPath(savedPathRaw, resolvedLessonIds)) {
        lessonsToShow = [...savedPathRaw];
      } else {
        lessonsToShow = applyMetaLessonLogic(resolvedLessonIds, order, choose);
        await setByKey(META_LESSON_PATH_KEY, lessonsToShow).catch(() => {});
      }
    } else {
      lessonsToShow = applyMetaLessonLogic(resolvedLessonIds, order, choose);
    }

    console.log("[selectMetaLesson TEST] rootMetaLessonId:", metaLesson.id);
    console.log("[selectMetaLesson TEST] order:", order);
    console.log("[selectMetaLesson TEST] choose:", choose);
    console.log("[selectMetaLesson TEST] resolvedLessonIds:", resolvedLessonIds);
    console.log("[selectMetaLesson TEST] finalSelectedLessonPath:", lessonsToShow);

    this.metaLessonLessons = lessonsToShow;
    this.currentMetaLessonIndex = 0;

    if (this.completedMetaLessonLessons.size > 0) {
      for (let i = 0; i < this.metaLessonLessons.length; i++) {
        if (!this.completedMetaLessonLessons.has(this.metaLessonLessons[i])) {
          this.currentMetaLessonIndex = i;
          break;
        }
      }
    }

    if (this.currentMetaLessonIndex < this.metaLessonLessons.length) {
      const firstLessonId = this.metaLessonLessons[this.currentMetaLessonIndex];
      const firstLesson = findLessonById(firstLessonId);
      console.log("[FindLesson TEST] firstLessonId:", firstLessonId, "| firstLesson found:", !!firstLesson, "| firstLesson:", firstLesson);
      if (firstLesson) {
        return this.selectLesson(
          {
            ...firstLesson,
            isPartOfMetaLesson: true,
            metaLessonId: metaLesson.id,
            metaLessonName: metaLesson.name,
          },
          updateServer
        );
      }
    }

    this.setState({ status: "graduated" });
  }

  hasRemainingMetaLessonLessons() {
    return (
      this.metaLesson &&
      this.metaLessonLessons.length > 0 &&
      this.currentMetaLessonIndex < this.metaLessonLessons.length - 1
    );
  }

  handleMetaSubLessonComplete = async () => {
    const currentLessonId = this.metaLessonLessons[this.currentMetaLessonIndex];
    this.completedMetaLessonLessons.add(currentLessonId);
    const { setByKey } = this.context.browserStorage;
    await setByKey(
      LESSON_PROGRESS_STORAGE_KEY(this.metaLesson.id),
      Array.from(this.completedMetaLessonLessons)
    ).catch(() => {});

    if (this.hasRemainingMetaLessonLessons()) {
      this.setState({ status: "metaLessonProgress", currProblem: null });
      return;
    }

    this.setState({ status: "graduated", currProblem: null });
    this.metaLesson = null;
    this.metaLessonLessons = [];
    this.currentMetaLessonIndex = -1;
    this.completedMetaLessonLessons = new Set();
  };

  continueMetaLesson = async () => {
    await this.nextMetaLessonLesson();
  };

  async nextMetaLessonLesson() {
    if (!this.metaLesson || this.metaLessonLessons.length === 0) return;

    this.currentMetaLessonIndex++;

    while (this.currentMetaLessonIndex < this.metaLessonLessons.length) {
      const nextLessonId = this.metaLessonLessons[this.currentMetaLessonIndex];
      const nextLesson = findLessonById(nextLessonId);

      if (nextLesson) {
        this.completedProbs = new Set();

        await this.selectLesson(
          {
            ...nextLesson,
            isPartOfMetaLesson: true,
            metaLessonId: this.metaLesson.id,
            metaLessonName: this.metaLesson.name,
          },
          false
        );

        if (this._isMounted) {
          this.setState({ status: "learning" });
        }
        return;
      }
      this.currentMetaLessonIndex++;
    }

    this.setState({ status: "graduated", currProblem: null });
    this.metaLesson = null;
    this.metaLessonLessons = [];
    this.currentMetaLessonIndex = -1;
    this.completedMetaLessonLessons = new Set();
  }

  selectCourse = (course, context) => {
    this.course = course;
    this.setState({
      status: "lessonSelection",
      selectedCourse: course,
    });
    this.props.enterCourse?.(course.courseName, course?.language || null);
  };

  _nextProblem = (context) => {
    seed = Date.now().toString();
    this.setState({ seed: seed });
    this.props.saveProgress();
    const problems = this.problemIndex.problems.filter(({ courseName, lessonId }) => {
      if (courseName.toString().startsWith("!!")) return false;
      if (lessonId && lessonId !== this.lesson.id) return false;
      return true;
    });
    let chosenProblem;

    for (const problem of problems) {
      let probMastery = 1;
      let isRelevant = false;
      if (problem.lessonId === this.lesson.id) {
        isRelevant = true;
      }
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
    score = getNormalizedMastery(score / objectives.length, this.lesson);
    this.displayMastery(score);

    const allMastered = score >= 1;
    if (this.lesson?.isPartOfMetaLesson) {
      console.log("[NextProblem TEST] allMastered:", allMastered, "| chosenProblem:", chosenProblem, "| isPartOfMetaLesson:", this.lesson?.isPartOfMetaLesson, "| hasMetaLesson:", !!this.metaLesson);
    }

    if (allMastered) {
      if (this.lesson?.isPartOfMetaLesson && this.metaLesson) {
        console.log("[NextProblem TEST] EXIT: meta-lesson guard, no status set");
        return null;
      }
      this.setState({ status: "completed" });
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

    if (this.lesson.enableCompletionMode) {
        const relevantKc = {};
        Object.keys(this.lesson.learningObjectives).forEach((x) => {
            relevantKc[x] = context.bktParams[x]?.probMastery ?? 0;
        });

        const progressData = this.getProgressBarData();
        const progressPercent = progressData.percent / 100;
        const allProblemsCompleted = progressData.completed === progressData.total;

        this.updateCanvas(progressPercent, relevantKc);

        if (allProblemsCompleted) {
            console.debug("Lesson complete; showing completion screen");
            this.setState({ status: "completed" });
        } else {
            const nextProblem = this._nextProblem(context);
            if (!nextProblem && this.lesson?.isPartOfMetaLesson && this.metaLesson) {
              await this.handleMetaSubLessonComplete();
            }
        }
    } else {
        const nextProblem = this._nextProblem(context);
        if (!nextProblem && this.lesson?.isPartOfMetaLesson && this.metaLesson) {
          await this.handleMetaSubLessonComplete();
        }
    }


    // this._nextProblem(context);
  };

  displayMastery = (mastery) => {
    this.setState({ mastery: mastery });
    if (!this.lesson?.enableCompletionMode && mastery >= 1) {
      if (this.lesson?.isPartOfMetaLesson && this.metaLesson) {
        return;
      }
      // toast.success("You've successfully completed this assignment!", {
      //   toastId: ToastID.successfully_completed_lesson.toString(),
      // });
      this.setState({ status: "completed" });
    }
  };

  updateCanvas = async (mastery, components) => {
    if (!this.context.jwt) return;

    console.debug("updating canvas with score", mastery);
    const [err, response] = await to(
      fetch(`${MIDDLEWARE_URL}/postScore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        { toastId: ToastID.submit_grade_unknown_error.toString() }
      );
      console.debug(err, response);
      return;
    }

    if (response.status === 200) {
      console.debug("successfully submitted grade to Canvas");
      return;
    }

    let responseText = "";
    try {
      responseText = await response.text();
    } catch (_) {}

    switch (response.status) {
      case 400: {
        let [message, ...addInfo] = responseText.split("|");
        if (Array.isArray(addInfo) && addInfo.length > 0 && addInfo[0]) {
          try {
            addInfo = JSON.parse(addInfo[0]);
          } catch (_) {}
        }
        switch (message) {
          case "lost_link_to_lms":
            toast.error(
              "It seems like the link back to your LMS has been lost. Please re-open the assignment to make sure your score is saved.",
              { toastId: ToastID.submit_grade_link_lost.toString() }
            );
            break;
          case "unable_to_handle_score":
            toast.warn(
              "Something went wrong and we can't update your score right now. Your progress will be saved locally so you may continue working.",
              { toastId: ToastID.submit_grade_unable.toString(), closeOnClick: true }
            );
            break;
          default:
            toast.error(`Error: ${responseText}`, { closeOnClick: true });
        }
        break;
      }
      case 401:
        toast.error(
          `Your session has either expired or been invalidated, please reload the page to try again.`,
          { toastId: ToastID.expired_session.toString() }
        );
        break;
      case 403:
        toast.error(
          `You are not authorized to make this action. (Are you a registered student?)`,
          { toastId: ToastID.not_authorized.toString() }
        );
        break;
      default:
        toast.error(
          `An unknown error occurred trying to submit this problem. If reloading does not work, please contact us.`,
          { toastId: ToastID.set_lesson_unknown_error.toString() }
        );
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
    this.setState({ drawerOpen: open });
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

  getProgressBarData = () => {
    if (!this.lesson) return { completed: 0, total: 0, percent: 0 };

    const problems = this.problemIndex.problems.filter(
      ({ lesson }) => String(lesson).includes(this.lesson.topics)
    );
    const completed = this.completedProbs.size;
    const total = problems.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  };

  isMetaLessonSidebarMode() {
    return Boolean(
      this.metaLesson &&
      this.metaLessonLessons.length > 0 &&
      (this.lesson?.isPartOfMetaLesson ||
        findMetaLessonById(this.props.lessonID)?.id === this.metaLesson.id ||
        this.state.status === "metaLessonProgress")
    );
  }

  renderMetaLessonSidebar() {
    const metaName = this.metaLesson?.name || "Meta lesson";
    const totalCount = this.metaLessonLessons.length;
    const currentIndex = this.currentMetaLessonIndex;
    // Match the width of the problem column below (Problem.js renders the problem in
    // a Grid item of md={drawerOpen ? 8 : 7} out of 12, with the hints panel beside it),
    // so this header doesn't stretch the full container width and look detached.
    const isMobileWidthView = isMobileWidth(this.props.width);
    const headerWidth = isMobileWidthView ? "100%" : `${((this.state.drawerOpen ? 8 : 7) / 12) * 100}%`;
    // Progress counts are intentionally hidden from students during the study.
    // The per-lesson chips are also hidden when the resolved path is a single
    // lesson (as in the Data 100 A/B meta-lessons), where they add no information.
    const showLessonChips = totalCount > 1;

    return (
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EBEFF2",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 16,
          width: headerWidth,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{metaName}</div>
        </div>
        <div style={{ display: showLessonChips ? "flex" : "none", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {this.metaLessonLessons.map((lessonId, index) => {
            const lesson = findLessonById(lessonId);
            const label = lesson?.name || lesson?.topics || (lesson ? lesson.id : null) || "Unavailable lesson";
            const isCompleted = this.completedMetaLessonLessons.has(lessonId);
            const isCurrent = index === currentIndex;
            const borderColor = isCurrent ? "#0B9B8A" : isCompleted ? "#0B9B8A" : "#EBEFF2";
            const backgroundColor = isCurrent ? "#F0FAF8" : "#FFFFFF";
            const opacity = isCompleted && !isCurrent ? 0.75 : 1;

            return (
              <div
                key={lessonId}
                style={{
                  backgroundColor,
                  padding: "6px 12px",
                  borderRadius: 16,
                  border: `1.5px solid ${borderColor}`,
                  opacity,
                  fontSize: 13,
                  fontWeight: isCurrent ? 600 : 400,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {label}
                {isCompleted && <span style={{ color: "#0B9B8A", fontSize: 12 }}>&#10003;</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  renderMetaLessonProgressScreen() {
    const completedCount = this.completedMetaLessonLessons.size;
    const totalCount = this.metaLessonLessons.length;
    const metaName = this.metaLesson?.name || "Meta lesson";

    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <h1>Sub-lesson complete</h1>
        <p>{metaName}</p>
        <p>{completedCount} of {totalCount} lessons completed</p>
        <div style={{ display: "flex", gap: 20, marginTop: 36 }}>
          <Button variant="contained" color="primary" onClick={this.continueMetaLesson}>
            Continue to Next Lesson
          </Button>
          <Button variant="outlined" color="primary" onClick={() => this.props.history.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  isMetaLessonGradingContext() {
    return Boolean(
      this.lesson?.isPartOfMetaLesson &&
        this.metaLesson &&
        Array.isArray(this.metaLessonLessons) &&
        this.metaLessonLessons.length > 0
    );
  }

  getMetaLessonMasteryScore(context, fallbackScore) {
    if (!this.isMetaLessonGradingContext()) {
      return fallbackScore;
    }

    const objectiveKeys = new Set();
    for (const subLessonId of this.metaLessonLessons) {
      const lesson = findLessonById(subLessonId);
      if (!lesson?.learningObjectives) {
        continue;
      }
      Object.keys(lesson.learningObjectives).forEach((kc) => objectiveKeys.add(kc));
    }

    if (objectiveKeys.size === 0) {
      return fallbackScore;
    }

    let sum = 0;
    let count = 0;
    for (const kc of objectiveKeys) {
      const probMastery = context?.bktParams?.[kc]?.probMastery;
      if (typeof probMastery === "number") {
        sum += probMastery;
        count += 1;
      }
    }

    if (count === 0) {
      return fallbackScore;
    }

    return sum / count;
  }

  getMetaLessonComponents(context, fallbackComponents) {
    if (!this.isMetaLessonGradingContext()) {
      return fallbackComponents;
    }

    const objectiveKeys = new Set();
    for (const subLessonId of this.metaLessonLessons) {
      const lesson = findLessonById(subLessonId);
      if (!lesson?.learningObjectives) {
        continue;
      }
      Object.keys(lesson.learningObjectives).forEach((kc) => objectiveKeys.add(kc));
    }

    const components = {};
    for (const kc of objectiveKeys) {
      const probMastery = context?.bktParams?.[kc]?.probMastery;
      if (typeof probMastery === "number") {
        components[kc] = probMastery;
      }
    }

    if (Object.keys(components).length === 0) {
      return fallbackComponents;
    }

    return components;
  }

  getMetaLessonAdjustedScore = (mastery, components) => {
    if (!this.isMetaLessonGradingContext()) {
      return { mastery, components };
    }
    return {
      mastery: this.getMetaLessonMasteryScore(this.context, mastery),
      components: this.getMetaLessonComponents(this.context, components),
    };
  };

  render() {
    const { translate, width } = this.props;
    const { showPopup } = this.state;
    const { classes } = this.props;
    const drawerWidth = 340;
    const isMobile = isMobileWidth(width);

    this.studentNameDisplay = this.context.studentName ? decodeURIComponent(this.context.studentName) : translate("platform.LoggedIn");

    const tocCourseName = this.state.selectedCourse?.courseName || findLessonById(this.props.lessonID)?.courseName;
    const currentLesson = findLessonById(this.props.lessonID);
    const mobileCourseTitle =
      this.state.selectedCourse?.courseName ||
      currentLesson?.courseName ||
      currentLesson?.name ||
      "";

    const lessonMasteryMap = this.getLessonMasteryMap(tocCourseName);
    const inLesson = Boolean(this.props.lessonID);
    const showToc = inLesson && !this.isFromCanvas;
    const progressData = this.getProgressBarData();
    const isCompletionMode = this.lesson?.enableCompletionMode;
    const barPercent = isCompletionMode
      ? progressData.percent
      : Math.round((this.state.mastery || 0) * 100);

    const CONTAINER_MAX_WIDTH = "100vw";
    const CONTAINER_STYLE = {
      maxWidth: CONTAINER_MAX_WIDTH,
      width: "100%",
      margin: showToc && !isMobile
        ? (this.state.drawerOpen ? "0 0 0 16px" : "0 0 0 32px")
        : "0",
      padding: isMobile ? "0 12px" : "0 16px",
      boxSizing: "border-box",
    };
    const PROGRESS_GAP = 20;
    const MAX_PROGRESS_BAR_WIDTH = 900;
    const MIN_PROGRESS_BAR_WIDTH = isMobile ? 0 : 200;
    const progressStickyTop = isMobile ? 56 : 120;

    return (
      <>
        {showToc && (
          isMobile ? (
          <SwipeableDrawer
            anchor="left"
            open={this.state.drawerOpen}
            onClose={() => this.toggleDrawer(false)}
            onOpen={() => this.toggleDrawer(true)}
            classes={{
              paper: classes.drawerPaperMobile,
            }}
            style={{
              position: "fixed",
              width: "min(320px, 85vw)",
              flexShrink: 0,
              zIndex: this.state.drawerOpen ? 4 : 0,
            }}
            PaperProps={{ style: { padding: 0, width: "min(320px, 85vw)" } }}
            ModalProps={{ keepMounted: true }}
          >
            <div style={{ width: "100%", padding: 16 }}>
              <TableOfContents
                courseName={tocCourseName}
                courseMastery={this.state.mastery || 0}
                mastery={lessonMasteryMap}
                onLessonClick={this.handleLessonClick}
                selectedLessonId={this.props.lessonID}
                drawerOpen={this.state.drawerOpen}
              />
            </div>
          </SwipeableDrawer>
          ) : (
          <Drawer
            variant="persistent"
            anchor="left"
            open={this.state.drawerOpen}
            classes={{
              paper: classes.drawerPaper,
            }}
            style={{
              position: "fixed",
              width: 320,
              flexShrink: 0,
              zIndex: this.state.drawerOpen ? 4 : 0,
            }}
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
          )
        )}

        <div
          style={{
            backgroundColor: "#F6F6F6",
            paddingBottom: 20,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top bar */}
          <AppBar position="fixed" style={{ backgroundColor: "#FFFFFF" }}>
            <Toolbar className={isMobile ? classes.mobileCompactToolbar : undefined}>
              {isMobile ? (
                <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 4, minWidth: 0 }}>
                  {showToc && (
                    <IconButton
                      aria-label="Table of Contents Toggle"
                      onClick={() => this.toggleDrawer(!this.state.drawerOpen)}
                      size="small"
                    >
                      <img src={ToCButton} alt="Table of Contents" style={{ width: 24, height: 24 }} />
                    </IconButton>
                  )}
                  <BrandLogoNav isPrivileged={this.isPrivileged} />
                  {inLesson && mobileCourseTitle && (
                    <div
                      className={classes.mobileCourseTitle}
                      title={mobileCourseTitle}
                      style={{ fontSize: 12, color: "#667085", marginLeft: 4 }}
                    >
                      {mobileCourseTitle}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", marginLeft: "auto", flexShrink: 0 }}>
                    <IconButton aria-label="about" title={`About ${SITE_NAME}`} onClick={this.togglePopup} size="small">
                      <HelpOutlineOutlinedIcon htmlColor={"#344054"} style={{ fontSize: 28 }} />
                    </IconButton>
                    {this.state.status === "learning" && (
                      <IconButton aria-label="report problem" onClick={this.toggleFeedback} title={"Report Problem"} size="small">
                        <FeedbackOutlinedIcon htmlColor={"#344054"} style={{ fontSize: 26 }} />
                      </IconButton>
                    )}
                    <img src={userIcon} alt="User Icon" style={{ width: 28, height: 28, marginLeft: 4 }} />
                  </div>
                  <Popup isOpen={showPopup} onClose={this.togglePopup}>
                    <About />
                  </Popup>
                </div>
              ) : (
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
              )}
            </Toolbar>
          </AppBar>

          <div className={classes.toolbarOffset} />

          {/* Second top bar (desktop only) */}
          {!isMobile && (
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
                        gap: "8xpx",
                      }}
                    >
                      {!this.isFromCanvas && (
                      <IconButton onClick={this.handleHierarchyBack} aria-label="Back" style={{ padding: 2 }}>
                        <img src={leftArrow} alt="Back Arrow" />
                      </IconButton>
                      )}

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
                      {!this.isFromCanvas && (
                      <IconButton onClick={this.handleHierarchyBack} aria-label="Back" style={{ padding: 2 }}>
                        <img src={leftArrow} alt="Back Arrow" />
                      </IconButton>
                      )}

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
          )}

          {!isMobile && <div style={{ height: 56 }} />}

          {/* Progress Bar */}
          <div
            style={{
              marginLeft: showToc && this.state.drawerOpen && !isMobile ? drawerWidth : 0,
              marginBottom: 0,
              transition: "margin 0.1s ease",
            }}
          >
            {this.state.status === "learning" ? (
              <AppBar position="sticky"
                      style={{ top: progressStickyTop, backgroundColor: "#F6F6F6", boxShadow: "none", zIndex: 3 }}>
                <Toolbar disableGutters style={{ minHeight: isMobile ? 64 : 80, paddingLeft: isMobile ? 8 : 16, paddingRight: isMobile ? 8 : 32 }}>
                  <Grid container spacing={0} role="progress-bar" alignItems="center" style={{ width: "100%" }}>
                    {showToc && !this.state.drawerOpen && !isMobile && (
                      <IconButton
                        aria-label="Table of Contents Toggle"
                        onClick={() => this.toggleDrawer(true)}
                        disabled={this.state.drawerOpen}
                        style={{ position: "absolute", top: "50%", transform: "translateY(-50%)" }}
                      >
                        <img src={ToCButton} alt="Table of Contents" style={{ width: 24, height: 24 }} />
                      </IconButton>
                    )}
                    
                    <Grid item xs={12}>
                      <div style={CONTAINER_STYLE}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                              ? "1fr"
                              : `auto minmax(${MIN_PROGRESS_BAR_WIDTH}px, ${MAX_PROGRESS_BAR_WIDTH}px) auto`,
                            alignItems: "center",
                            justifyContent: "center",
                            columnGap: PROGRESS_GAP,
                            rowGap: isMobile ? 8 : 0,
                            width: "100%",
                            maxWidth: "100%",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: isMobile ? "center" : "flex-start" }}>
                            <img
                              src={`${process.env.PUBLIC_URL}/static/images/icons/mastery-bolt.png`}
                              alt="Mastery Icon"
                              width={20}
                              height={20}
                              style={{ display: "block" }}
                            />
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 500, color: "#000" }}>
                              {isCompletionMode
                                ? `Lesson Completion: ${barPercent}%`
                                : `Lesson Mastery: ${barPercent}%`}
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
                                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600 }}>
                                      {isCompletionMode ? "Progress" : "Learning Objectives:"}
                                    </div>
                                    {isCompletionMode ? (
                                      <div style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                                        <img src={`${process.env.PUBLIC_URL}/static/images/icons/mastery-bolt.png`} alt="" width={20} height={20} />
                                        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500 }}>
                                          {progressData.completed}/{progressData.total}
                                        </div>
                                      </div>
                                    ) : (
                                      (() => {
                                        const keys = Object.keys(this.lesson?.learningObjectives || {});
                                        const mastered = keys.filter(
                                          (k) => (this.context.bktParams[k]?.probMastery ?? 0) >= MASTERY_THRESHOLD
                                        ).length;
                                        return (
                                          <div style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                                            <img src={`${process.env.PUBLIC_URL}/static/images/icons/mastery-bolt.png`} alt="" width={20} height={20} />
                                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500 }}>
                                              {mastered}/{keys.length}
                                            </div>
                                          </div>
                                        );
                                      })()
                                    )}
                                  </div>

                                  {!isCompletionMode && Object.entries(this.lesson?.learningObjectives || {}).map(([kc]) => {
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
                                aria-valuenow={barPercent}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{
                                  position: "relative",
                                  width: "100%",
                                  height: 30,
                                  backgroundColor: "#C9D3D8",
                                  borderRadius: 24,
                                  padding: "2px",
                                  overflow: "hidden",
                                  cursor: "pointer",
                                }}
                              >
                                {/* Filled progress */}
                                <div
                                  style={{
                                    width: `${barPercent}%`,
                                    height: "100%",
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: 24,
                                    transition: "width 0.4s ease",
                                  }}
                                />

                                {/* Avatar rider on progress bar */}
                                <img
                                  src={`${process.env.PUBLIC_URL}/static/images/icons/avatar_progress_bar.svg`}
                                  alt=""
                                  style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: `${barPercent}%`,
                                    transform: "translate(-110%, -50%)",
                                    height: 24,
                                    width: 24,
                                    transition: "left 0.4s ease",
                                  }}
                                />
                              </div>
                            </ProgressTooltip>
                          </div>

                          {/* Right: info icon (desktop grid column) */}
                          {!isMobile && (
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
                              src={`${process.env.PUBLIC_URL}/static/images/icons/information-icon.png`}
                              alt="Info"
                              width={20}
                              height={20}
                              style={{ display: "block", cursor: "pointer" }}
                            />
                          </InfoTooltip>
                          )}
                          {isMobile && (
                            <div style={{ display: "flex", justifyContent: "center" }}>
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
                                  src={`${process.env.PUBLIC_URL}/static/images/icons/information-icon.png`}
                                  alt="Info"
                                  width={20}
                                  height={20}
                                  style={{ display: "block", cursor: "pointer" }}
                                />
                              </InfoTooltip>
                            </div>
                          )}
                        </div>
                      </div>
                    </Grid>
                  </Grid>
                </Toolbar>
              </AppBar>
            ) : (
              ""
            )}


            {this.isMetaLessonSidebarMode() &&
            (this.state.status === "learning" || this.state.status === "metaLessonProgress") ? (
              <div style={CONTAINER_STYLE}>{this.renderMetaLessonSidebar()}</div>
            ) : null}

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
                    getMetaLessonAdjustedScore={this.getMetaLessonAdjustedScore}
                    drawerOpen={showToc && this.state.drawerOpen}
                    showFeedback={this.state.showFeedback}
                    feedback={this.state.feedback}
                    feedbackSubmitted={this.state.feedbackSubmitted}
                    onFeedbackChange={(feedback) => this.setState({ feedback })}
                    submitFeedback={this.submitFeedback}
                  />
                </div>
              </ErrorBoundary>
            ) : (
              ""
            )}
            {this.state.status === "metaLessonProgress" ? (
              this.renderMetaLessonProgressScreen()
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
            {this.state.status === "completed" ? (
              <div
                style={{
                  minHeight: "60vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  // gap: 16,
                }}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/static/images/icons/completion_avatar.svg`}
                  alt="Completion Avatar"
                  width={120}
                />
                <h1>Well done! You've completed the lesson!</h1>
                <p>You've taken a big step forward in mastering this topic. Keep up with the great work!</p>
                {!this.isFromCanvas && (
                  <div style={{ display: "flex", gap: 20, marginTop: 36 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        const curr = findLessonById(this.props.lessonID);
                        const course = coursePlans.find((c) => c.courseName === curr?.courseName);
                        const lessons = course?.lessons || [];
                        const idx = lessons.findIndex((l) => l.id === curr?.id);
                        const nextLesson = idx >= 0 ? lessons[idx + 1] : null;
                        if (nextLesson?.id) {
                          this.props.history.push(`/lessons/${nextLesson.id}`);
                        }
                      }}
                    >
                      Next Lesson
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => this.props.history.push("/")}
                    >
                      Back to Home
                    </Button>
                  </div>
                )}
              </div>
              
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

// const StyledPlatform = withStyles(styles)(Platform);

// export default withRouter(withTranslation((props) => (
//     <LocalizationConsumer>
//         {({ language, enterCourse, exitCourse }) => (
//             <StyledPlatform
//                 {...props}
//                 language={language}
//                 enterCourse={enterCourse}
//                 exitCourse={exitCourse}
//             />
//         )}
//     </LocalizationConsumer>
// )));
export default withWidth()(withStyles(styles)(withRouter(withTranslation(Platform))));