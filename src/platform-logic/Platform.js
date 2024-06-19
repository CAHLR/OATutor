import React from "react";
import { AppBar, Toolbar } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Problem from "@components/problem-layout/Problem.js";
import LessonSelection from "@components/problem-layout/LessonSelection.js";
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
            };
        } else {
            this.state = {
                currProblem: null,
                status: "courseSelection",
                seed: seed,
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

    render() {
        const { translate } = this.props;
        this.studentNameDisplay = this.context.studentName
        ? decodeURIComponent(this.context.studentName) + " | "
        : translate('platform.LoggedIn') + " | ";
        return (
            <div
                style={{
                    backgroundColor: "#F6F6F6",
                    paddingBottom: 20,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <AppBar position="static">
                    <Toolbar>
                        <Grid
                            container
                            spacing={0}
                            role={"navigation"}
                            alignItems={"center"}
                        >
                            <Grid item xs={3} key={1}>
                                <BrandLogoNav
                                    isPrivileged={this.isPrivileged}
                                />
                            </Grid>
                            <Grid item xs={6} key={2}>
                                <div
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
                                </div>
                            </Grid>
                            <Grid item xs={3} key={3}>
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
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
                {this.state.status === "courseSelection" ? (
                    <LessonSelection
                        selectLesson={this.selectLesson}
                        selectCourse={this.selectCourse}
                        history={this.props.history}
                        removeProgress={this.props.removeProgress}
                    />
                ) : (
                    ""
                )}
                {this.state.status === "lessonSelection" ? (
                    <LessonSelection
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
                        <Problem
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
            </div>
        );
    }
}

export default withRouter(withTranslation(Platform));
