import React from "react";

import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

import { checkAnswer } from "../../platform-logic/checkAnswer.js";
import styles from "./common-styles.js";
import { withStyles } from "@material-ui/core/styles";
import HintSystem from "./HintSystem.js";
import {
    chooseVariables,
    renderText,
} from "../../platform-logic/renderText.js";
import {
    DYNAMIC_HINT_URL,
    DYNAMIC_HINT_TEMPLATE,
    ENABLE_BOTTOM_OUT_HINTS,
    ThemeContext,
} from "../../config/config.js";

import "./ProblemCard.css";
import ProblemInput from "../problem-input/ProblemInput";
import Spacer from "../Spacer";
import { stagingProp } from "../../util/addStagingProperty";
import ErrorBoundary from "../ErrorBoundary";
import {
    toastNotifyCompletion,
    toastNotifyCorrectness,
} from "./ToastNotifyCorrectness";
import { joinList } from "../../util/formListString";
import axios from "axios";
import withTranslation from "../../util/withTranslation.js"

class ProblemCard extends React.Component {
    static contextType = ThemeContext;

    constructor(props, context) {
        super(props);
        // console.log("problem lesson props:", props);
        this.step = props.step;
        this.index = props.index;
        this.giveStuFeedback = props.giveStuFeedback;
        this.giveStuHints = props.giveStuHints;
        this.unlockFirstHint = props.unlockFirstHint;
        this.giveHintOnIncorrect = props.giveHintOnIncorrect
        this.keepMCOrder = props.keepMCOrder;
        this.keyboardType = props.keyboardType;
        this.allowRetry = this.giveStuFeedback;

        this.giveStuBottomHint = props.giveStuBottomHint;
        this.giveDynamicHint = props.giveDynamicHint;
        this.showHints = this.giveStuHints == null || this.giveStuHints;
        this.showCorrectness = this.giveStuFeedback;
        this.expandFirstIncorrect = false;

        this.problemTitle = props.problemTitle;
        this.problemSubTitle = props.problemSubTitle;
        this.prompt_template = props.prompt_template
            ? props.prompt_template
            : DYNAMIC_HINT_TEMPLATE;
        console.debug(
            "this.step",
            this.step,
            "showHints",
            this.showHints,
            "hintPathway",
            context.hintPathway
        );
        this.hints = this.giveDynamicHint
            ? []
            : JSON.parse(JSON.stringify(this.step.hints[context.hintPathway]));

        for (let hint of this.hints) {
            hint.dependencies = hint.dependencies.map((dependency) =>
                this._findHintId(this.hints, dependency)
            );
            if (hint.subHints) {
                for (let subHint of hint.subHints) {
                    subHint.dependencies = subHint.dependencies.map(
                        (dependency) =>
                            this._findHintId(hint.subHints, dependency)
                    );
                }
            }
        }

        // Bottom out hints option
        if (
            this.giveStuBottomHint &&
            !(context.debug && context["use_expanded_view"])
        ) {
            // Bottom out hints
            this.hints.push({
                id: this.step.id + "-h" + (this.hints.length + 1),
                title: "Answer",
                text: "The answer is " + this.step.stepAnswer,
                type: "bottomOut",
                dependencies: Array.from(Array(this.hints.length).keys()),
            });
            // Bottom out sub hints
            this.hints.map((hint, i) => {
                if (hint.type === "scaffold") {
                    if (hint.subHints == null) {
                        hint.subHints = [];
                    }
                    hint.subHints.push({
                        id:
                            this.step.id +
                            "-h" +
                            i +
                            "-s" +
                            (hint.subHints.length + 1),
                        title: "Answer",
                        text: "The answer is " + hint.hintAnswer[0],
                        type: "bottomOut",
                        dependencies: Array.from(
                            Array(hint.subHints.length).keys()
                        ),
                    });
                }
                return null;
            });
        }

        this.state = {
            inputVal: "",
            isCorrect: context.use_expanded_view && context.debug ? true : null,
            checkMarkOpacity:
                context.use_expanded_view && context.debug ? "100" : "0",
            displayHints: false,
            hintsFinished: new Array(this.hints.length).fill(0),
            equation: "",
            usedHints: false,
            dynamicHint: "",
            bioInfo: "",
            enableHintGeneration: true,
        };
    }

    _findHintId = (hints, targetId) => {
        for (var i = 0; i < hints.length; i++) {
            if (hints[i].id === targetId) {
                return i;
            }
        }
        console.debug("hint not found..?", hints, "target:", targetId);
        return -1;
    };

    updateBioInfo() {
        const bioInfo = JSON.parse(localStorage.getItem("bioInfo"));
        if (bioInfo) {
            const {
                gender,
                age,
                confidenceQ1,
                confidenceQ2,
                judgementQ1,
                judgementQ2,
                judgementQ3,
                other,
            } = bioInfo;
            const bio = `I'm a ${gender} and I'm ${age} years old. ${confidenceQ1}. ${confidenceQ2}. 
            For the statement that "if I had more time for practice, I would be better in mathematics", my answer is ${judgementQ1}.
            For the statement that "if I was more patient while solving mathematical problems, I would be better in mathematics", my answer is ${judgementQ2}.
            For the statement that "No matter how much time I devote for studying mathematics, I can’t improve my grades", my answer is ${judgementQ3}. 
            ${other}
            `;
            this.setState({ bioInfo: bio });
        }
    }

    componentDidMount() {
        // Start an asynchronous task
        this.updateBioInfo();
        console.log("student show hints status: ", this.showHints);
    }

    componentDidUpdate(prevProps) {
        // Check if specific props have changed
        if (
            this.props.clearStateOnPropChange !==
            prevProps.clearStateOnPropChange
        ) {
            // Clear out state variables
            this.setState({
                dynamicHint: "",
            });
            this.updateBioInfo();
        }
    }

    submit = () => {
        console.debug("submitting problem");
        const { inputVal, hintsFinished } = this.state;
        const {
            variabilization,
            knowledgeComponents,
            precision,
            stepAnswer,
            answerType,
            stepBody,
            stepTitle,
        } = this.step;
        const { seed, problemVars, problemID, courseName, answerMade, lesson } =
            this.props;

        const [parsed, correctAnswer, reason] = checkAnswer({
            attempt: inputVal,
            actual: stepAnswer,
            answerType: answerType,
            precision: precision,
            variabilization: chooseVariables(
                Object.assign({}, problemVars, variabilization),
                seed
            ),
            questionText: stepBody.trim() || stepTitle.trim(),
        });

        const isCorrect = !!correctAnswer;

        if (!isCorrect) {
            this.expandFirstIncorrect = true;
            this.toggleHints('auto-expand');
        }

        this.context.firebase.log(
            parsed,
            problemID,
            this.step,
            null,
            isCorrect,
            hintsFinished,
            "answerStep",
            chooseVariables(
                Object.assign({}, problemVars, variabilization),
                seed
            ),
            lesson,
            courseName,
            this.giveDynamicHint ? "dynamic" : "regular",
            this.state.dynamicHint,
            this.state.bioInfo
        );

        if (this.showCorrectness) {
            toastNotifyCorrectness(isCorrect, reason);
        } else {
            toastNotifyCompletion();
        }

        this.setState({
            isCorrect,
            checkMarkOpacity: isCorrect ? "100" : "0",
        });
        answerMade(this.index, knowledgeComponents, isCorrect);
    };

    editInput = (event) => {
        this.setInputValState(event.target.value);
        this.setState({
            enableHintGeneration: true,
        });
    };

    setInputValState = (inputVal) => {
        this.setState(({ isCorrect }) => ({
            inputVal,
            isCorrect: isCorrect ? true : null,
        }));
    };

    handleKey = (event) => {
        if (event.key === "Enter") {
            this.submit();
        }
    };

    toggleHints = (event) => {
        this.setState({
            enableHintGeneration: false,
        });
        if (!this.state.displayHints) {
            this.setState(
                (prevState) => ({
                    displayHints: !prevState.displayHints,
                }),
                () => {
                    this.props.answerMade(
                        this.index,
                        this.step.knowledgeComponents,
                        false
                    );
                }
            );
        }
        this.generateHintFromGPT();
    };

    unlockHint = (hintNum, hintType) => {
        // Mark question as wrong if hints are used (on the first time)
        const { seed, problemVars, problemID, courseName, answerMade, lesson } =
            this.props;
        const { isCorrect, hintsFinished } = this.state;
        const { knowledgeComponents, variabilization } = this.step;

        if (hintsFinished.reduce((a, b) => a + b) === 0 && isCorrect !== true) {
            this.setState({ usedHints: true });
            answerMade(this.index, knowledgeComponents, false);
        }

        // If the user has not opened a scaffold before, mark it as in-progress.
        if (hintsFinished[hintNum] !== 1) {
            this.setState(
                (prevState) => {
                    prevState.hintsFinished[hintNum] =
                        hintType !== "scaffold" ? 1 : 0.5;
                    return { hintsFinished: prevState.hintsFinished };
                },
                () => {
                    const { firebase } = this.context;

                    firebase.log(
                        null,
                        problemID,
                        this.step,
                        this.hints[hintNum],
                        null,
                        hintsFinished,
                        "unlockHint",
                        chooseVariables(
                            Object.assign({}, problemVars, variabilization),
                            seed
                        ),
                        lesson,
                        courseName,
                        this.giveDynamicHint ? "dynamic" : "regular",
                        this.state.dynamicHint,
                        this.state.bioInfo
                    );
                }
            );
        }
    };

    submitHint = (parsed, hint, isCorrect, hintNum) => {
        if (isCorrect) {
            this.setState((prevState) => {
                prevState.hintsFinished[hintNum] = 1;
                return { hintsFinished: prevState.hintsFinished };
            });
        }
        this.context.firebase.hintLog(
            parsed,
            this.props.problemID,
            this.step,
            hint,
            isCorrect,
            this.state.hintsFinished,
            chooseVariables(
                Object.assign(
                    {},
                    this.props.problemVars,
                    this.step.variabilization
                ),
                this.props.seed
            ),
            this.props.lesson,
            this.props.courseName,
            this.giveDynamicHint ? "dynamic" : "regular",
            this.state.dynamicHint,
            this.state.bioInfo
        );
    };

    generateGPTHintParameters = (prompt_template, bio_info) => {
        var inputVal = "";
        if (
            typeof this.state.inputVal === "string" &&
            this.state.inputVal.length > 0
        ) {
            inputVal = this.state.inputVal;
        }
        var correctAnswer = "";
        if (
            Array.isArray(this.step.stepAnswer) &&
            this.step.stepAnswer.length > 0
        ) {
            correctAnswer = this.step.stepAnswer[0];
        }

        var quest = {
            problem_title: this.problemTitle,
            problem_subtitle: this.problemSubTitle,
            question_title: this.step.stepTitle,
            question_subtitle: this.step.stepBody,
            student_answer: inputVal,
            correct_answer: correctAnswer,
        };

        return { quest, prompt_template, bio_info };
    };

    generateHintFromGPT = async () => {
        // console.log(this.generateGPTHintParameters(this.prompt_template));
        this.setState({
            dynamicHint: "",
        });
        const [parsed, correctAnswer, reason] = checkAnswer({
            attempt: this.state.inputVal,
            actual: this.step.stepAnswer,
            answerType: this.step.answerType,
            precision: this.step.precision,
            variabilization: chooseVariables(
                Object.assign(
                    {},
                    this.props.problemVars,
                    this.props.variabilization
                ),
                this.props.seed
            ),
            questionText:
                this.step.stepBody.trim() || this.step.stepTitle.trim(),
        });

        const isCorrect = !!correctAnswer;

        axios
            .post(
                DYNAMIC_HINT_URL,
                this.generateGPTHintParameters(
                    this.prompt_template,
                    this.state.bioInfo
                )
            )
            .then((response) => {
                this.setState({
                    dynamicHint: response.data.hint,
                });
                this.context.firebase.log(
                    parsed,
                    this.props.problemID,
                    this.step,
                    "",
                    isCorrect,
                    this.state.hintsFinished,
                    "requestDynamicHint",
                    chooseVariables(
                        Object.assign(
                            {},
                            this.props.problemVars,
                            this.props.variabilization
                        ),
                        this.props.seed
                    ),
                    this.props.lesson,
                    this.props.courseName,
                    "dynamic",
                    this.state.dynamicHint,
                    this.state.bioInfo
                );
            })
            .catch((error) => {
                console.error(error);
            });
    };

    render() {
        const { translate } = this.props;
        const { classes, problemID, problemVars, seed } = this.props;
        const { displayHints, isCorrect } = this.state;
        const { debug, use_expanded_view } = this.context;

        const problemAttempted = isCorrect != null;

        return (
            <Card className={classes.card}>
                <CardContent>
                    <h2 className={classes.stepHeader}>
                        {renderText(
                            this.step.stepTitle,
                            problemID,
                            chooseVariables(
                                Object.assign(
                                    {},
                                    problemVars,
                                    this.step.variabilization
                                ),
                                seed
                            ),
                            this.context
                        )}
                        <hr />
                    </h2>

                    <div className={classes.stepBody}>
                        {renderText(
                            this.step.stepBody,
                            problemID,
                            chooseVariables(
                                Object.assign(
                                    {},
                                    problemVars,
                                    this.step.variabilization
                                ),
                                seed
                            ),
                            this.context
                        )}
                    </div>
                    {displayHints && this.giveDynamicHint && (
                        <div className="dynamicHintContainer">
                            <h3 className="dynamicHintTitle">
                                Hint From ChatGPT
                            </h3>
                            {this.state.dynamicHint ? (
                                <div className="dynamicHintContent">
                                    {renderText(
                                        this.state.dynamicHint,
                                        problemID,
                                        chooseVariables(
                                            Object.assign(
                                                {},
                                                problemVars,
                                                this.step.variabilization
                                            ),
                                            seed
                                        ),
                                        this.context
                                    )}
                                </div>
                            ) : (
                                <div className="dynamicHintContent">
                                    loading...
                                </div>
                            )}
                        </div>
                    )}
                    {(displayHints || (debug && use_expanded_view)) &&
                        this.showHints && (
                            <div className="Hints">
                                <ErrorBoundary
                                    componentName={"HintSystem"}
                                    descriptor={"hint"}
                                >
                                    <HintSystem
                                        giveHintOnIncorrect={this.giveHintOnIncorrect}
                                        giveDynamicHint={this.giveDynamicHint}
                                        giveStuFeedback={this.giveStuFeedback}
                                        unlockFirstHint={this.unlockFirstHint}
                                        problemID={this.props.problemID}
                                        index={this.props.index}
                                        step={this.step}
                                        hints={this.hints}
                                        unlockHint={this.unlockHint}
                                        hintStatus={this.state.hintsFinished}
                                        submitHint={this.submitHint}
                                        seed={this.props.seed}
                                        stepVars={Object.assign(
                                            {},
                                            this.props.problemVars,
                                            this.step.variabilization
                                        )}
                                        answerMade={this.props.answerMade}
                                        lesson={this.props.lesson}
                                        courseName={this.props.courseName}
                                        isIncorrect={this.expandFirstIncorrect}
                                    />
                                </ErrorBoundary>
                                <Spacer />
                            </div>
                        )}

                    <div className={classes.root}>
                        <ProblemInput
                            variabilization={chooseVariables(
                                Object.assign(
                                    {},
                                    this.props.problemVars,
                                    this.step.variabilization
                                ),
                                this.props.seed
                            )}
                            allowRetry={this.allowRetry}
                            giveStuFeedback={this.giveStuFeedback}
                            showCorrectness={this.showCorrectness}
                            classes={classes}
                            state={this.state}
                            step={this.step}
                            seed={this.props.seed}
                            keepMCOrder={this.props.keepMCOrder}
                            keyboardType={this.props.keyboardType}
                            _setState={(state) => this.setState(state)}
                            context={this.context}
                            editInput={this.editInput}
                            setInputValState={this.setInputValState}
                            handleKey={this.handleKey}
                            index={this.props.index}
                        />
                    </div>
                </CardContent>
                <CardActions>
                    <Grid
                        container
                        spacing={0}
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Grid item xs={false} sm={false} md={4} />
                        <Grid item xs={4} sm={4} md={1}>
                            {this.showHints && (
                                <center>
                                    <IconButton
                                        aria-label="delete"
                                        onClick={this.toggleHints}
                                        title="View available hints"
                                        disabled={
                                            !this.state.enableHintGeneration
                                        }
                                        className="image-container"
                                        {...stagingProp({
                                            "data-selenium-target": `hint-button-${this.props.index}`,
                                        })}
                                    >
                                        <img
                                            src={`${process.env.PUBLIC_URL}/static/images/icons/raise_hand.png`}
                                            className={
                                                this.state.enableHintGeneration
                                                    ? "image"
                                                    : "image image-grayed-out"
                                            }
                                            alt="hintToggle"
                                        />
                                    </IconButton>
                                </center>
                            )}
                        </Grid>
                        <Grid item xs={4} sm={4} md={2}>
                            <center>
                                <Button
                                    className={classes.button}
                                    style={{ width: "80%" }}
                                    size="small"
                                    onClick={this.submit}
                                    disabled={
                                        (use_expanded_view && debug) ||
                                        (!this.allowRetry && problemAttempted)
                                    }
                                    {...stagingProp({
                                        "data-selenium-target": `submit-button-${this.props.index}`,
                                    })}
                                >
                                    {translate('problem.Submit')}
                                </Button>
                            </center>
                        </Grid>
                        <Grid item xs={4} sm={3} md={1}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignContent: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {(!this.showCorrectness ||
                                    !this.allowRetry) && (
                                    <img
                                        className={classes.checkImage}
                                        style={{
                                            opacity:
                                                this.state.isCorrect == null
                                                    ? 0
                                                    : 1,
                                            width: "45%",
                                        }}
                                        alt="Exclamation Mark Icon"
                                        title={`The instructor has elected to ${joinList(
                                            !this.showCorrectness &&
                                                "hide correctness",
                                            !this.allowRetry &&
                                                "disallow retries"
                                        )}`}
                                        {...stagingProp({
                                            "data-selenium-target": `step-correct-img-${this.props.index}`,
                                        })}
                                        src={`${process.env.PUBLIC_URL}/static/images/icons/exclamation.svg`}
                                    />
                                )}
                                {this.state.isCorrect &&
                                    this.showCorrectness &&
                                    this.allowRetry && (
                                        <img
                                            className={classes.checkImage}
                                            style={{
                                                opacity:
                                                    this.state.checkMarkOpacity,
                                                width: "45%",
                                            }}
                                            alt="Green Checkmark Icon"
                                            {...stagingProp({
                                                "data-selenium-target": `step-correct-img-${this.props.index}`,
                                            })}
                                            src={`${process.env.PUBLIC_URL}/static/images/icons/green_check.svg`}
                                        />
                                    )}
                                {this.state.isCorrect === false &&
                                    this.showCorrectness &&
                                    this.allowRetry && (
                                        <img
                                            className={classes.checkImage}
                                            style={{
                                                opacity:
                                                    100 -
                                                    this.state.checkMarkOpacity,
                                                width: "45%",
                                            }}
                                            alt="Red X Icon"
                                            {...stagingProp({
                                                "data-selenium-target": `step-correct-img-${this.props.index}`,
                                            })}
                                            src={`${process.env.PUBLIC_URL}/static/images/icons/error.svg`}
                                        />
                                    )}
                            </div>
                        </Grid>
                        <Grid item xs={false} sm={1} md={4} />
                    </Grid>
                </CardActions>
            </Card>
        );
    }
}

export default withStyles(styles)(withTranslation(ProblemCard));
