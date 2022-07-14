import React from 'react';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import { checkAnswer } from '../ProblemLogic/checkAnswer.js';
import styles from './commonStyles.js';
import { withStyles } from '@material-ui/core/styles';
import HintSystem from './HintSystem.js';
import { chooseVariables, renderText } from '../ProblemLogic/renderText.js';
import { ENABLE_BOTTOM_OUT_HINTS, ThemeContext } from '../config/config.js';

import "./ProblemCard.css";
import ProblemInput from "./ProblemInput/ProblemInput";
import Spacer from "../Components/_General/Spacer";
import { toast } from "react-toastify";
import { stagingProp } from "../util/addStagingProperty";
import ErrorBoundary from "../Components/_General/ErrorBoundary";


class ProblemCard extends React.Component {
    static contextType = ThemeContext;

    constructor(props, context) {
        super(props);
        //console.log("Reconstructing");
        this.step = props.step;
        this.index = props.index;
        console.debug('this.step', this.step, 'hintPathway', context.hintPathway)
        this.hints = this.step.hints[context.hintPathway];

        for (let hint of this.hints) {
            hint.dependencies = hint.dependencies.map(dependency => this._findHintId(this.hints, dependency));
            if (hint.subHints) {
                for (let subHint of hint.subHints) {
                    subHint.dependencies = subHint.dependencies.map(dependency => this._findHintId(hint.subHints, dependency));
                }
            }
        }

        // Bottom out hints option
        if (ENABLE_BOTTOM_OUT_HINTS && context.debug && !context["use_expanded_view"]) {
            // Bottom out hints
            this.hints.push({
                id: this.step.id + "-h" + (this.hints.length),
                title: "Answer",
                text: "The answer is " + this.step.stepAnswer,
                type: "bottomOut",
                dependencies: Array.from(Array(this.hints.length).keys())
            });
            // Bottom out sub hints
            this.hints.map((hint, i) => {
                if (hint.type === "scaffold") {
                    if (hint.subHints == null) {
                        hint.subHints = [];
                    }
                    hint.subHints.push({
                        id: this.step.id + "-h" + i + "-s" + (hint.subHints.length),
                        title: "Answer",
                        text: "The answer is " + hint.hintAnswer[0],
                        type: "bottomOut",
                        dependencies: Array.from(Array(hint.subHints.length).keys())
                    });
                }
                return null;
            })
        }

        this.state = {
            inputVal: "",
            isCorrect: context.use_expanded_view && context.debug ? true : null ,
            checkMarkOpacity: context.use_expanded_view && context.debug ? '100' : '0',
            showHints: false,
            hintsFinished: new Array(this.hints.length).fill(0),
            equation: '',
            usedHints: false
        }
    }

    _findHintId = (hints, targetId) => {
        for (var i = 0; i < hints.length; i++) {
            if (hints[i].id === targetId) {
                return i;
            }
        }
        return -1;
    }

    submit = () => {
        console.debug('submitting problem')
        const { inputVal, hintsFinished } = this.state;
        const { variabilization, knowledgeComponents, precision, stepAnswer, answerType } = this.step;
        const { seed, problemVars, problemID, courseName, answerMade, lesson } = this.props;

        const [parsed, correctAnswer] = checkAnswer(inputVal, stepAnswer, answerType, precision, chooseVariables(Object.assign({}, problemVars, variabilization), seed));

        this.context.firebase.log(
            parsed,
            problemID,
            this.step,
            null,
            correctAnswer,
            hintsFinished,
            "answerStep",
            chooseVariables(Object.assign({}, problemVars, variabilization), seed),
            lesson,
            courseName
        )

        if (correctAnswer) {
            toast.success("Correct Answer!", {
                autoClose: 3000
            })
        } else {
            toast.error("Incorrect Answer!", {
                autoClose: 3000
            })
        }

        this.setState({
            isCorrect: correctAnswer,
            checkMarkOpacity: correctAnswer === true ? '100' : '0'
        });
        answerMade(this.index, knowledgeComponents, correctAnswer);
    }

    editInput = (event) => {
        this.setInputValState(event.target.value)
    }

    setInputValState = (inputVal) => {
        this.setState(({ isCorrect }) => ({ inputVal, isCorrect: isCorrect ? true : null }))
    }

    handleKey = (event) => {
        if (event.key === 'Enter') {
            this.submit();
        }
    }

    toggleHints = (event) => {
        this.setState(prevState => ({
            showHints: !prevState.showHints
        }), () => {
            this.props.answerMade(this.index, this.step.knowledgeComponents, false);
        });
    }

    unlockHint = (hintNum, hintType) => {
        // Mark question as wrong if hints are used (on the first time)
        const { seed, problemVars, problemID, courseName, answerMade, lesson } = this.props;
        const { isCorrect, hintsFinished } = this.state;
        const { knowledgeComponents, variabilization } = this.step;

        if (hintsFinished.reduce((a, b) => a + b) === 0 && isCorrect !== true) {
            this.setState({ usedHints: true });
            answerMade(this.index, knowledgeComponents, false);
        }

        // If the user has not opened a scaffold before, mark it as in-progress.
        if (hintsFinished[hintNum] !== 1) {
            this.setState(prevState => {
                prevState.hintsFinished[hintNum] = (hintType !== "scaffold" ? 1 : 0.5);
                return { hintsFinished: prevState.hintsFinished }
            }, () => {
                const { firebase } = this.context;

                firebase.log(
                    null,
                    problemID,
                    this.step,
                    this.hints[hintNum],
                    null,
                    hintsFinished,
                    "unlockHint",
                    chooseVariables(Object.assign({}, problemVars, variabilization), seed),
                    lesson,
                    courseName
                );
            });
        }

    }

    submitHint = (parsed, hint, correctAnswer, hintNum) => {
        if (correctAnswer) {
            this.setState(prevState => {
                prevState.hintsFinished[hintNum] = 1;
                return { hintsFinished: prevState.hintsFinished }
            });
        }
        this.context.firebase.hintLog(
            parsed,
            this.props.problemID,
            this.step,
            hint,
            correctAnswer,
            this.state.hintsFinished,
            chooseVariables(Object.assign({}, this.props.problemVars, this.step.variabilization), this.props.seed),
            this.props.lesson,
            this.props.courseName
        )
    }

    render() {
        const { classes } = this.props;
        const { showHints } = this.state;
        const { debug, use_expanded_view } = this.context;
        return (
            <Card className={classes.card}>
                <CardContent>
                    <h2 className={classes.stepHeader}>
                        {renderText(this.step.stepTitle, this.props.problemID, chooseVariables(Object.assign({}, this.props.problemVars, this.step.variabilization), this.props.seed))}
                        <hr/>
                    </h2>

                    <div className={classes.stepBody}>
                        {renderText(this.step.stepBody, this.props.problemID, chooseVariables(Object.assign({}, this.props.problemVars, this.step.variabilization), this.props.seed))}
                    </div>

                    {(showHints || (debug && use_expanded_view)) && (
                        <div className="Hints">
                            <ErrorBoundary componentName={"HintSystem"} descriptor={"hint"}>
                                <HintSystem
                                    problemID={this.props.problemID}
                                    index={this.props.index}
                                    step={this.step}
                                    hints={this.hints}
                                    unlockHint={this.unlockHint}
                                    hintStatus={this.state.hintsFinished}
                                    submitHint={this.submitHint}
                                    seed={this.props.seed}
                                    stepVars={Object.assign({}, this.props.problemVars, this.step.variabilization)}
                                    answerMade={this.props.answerMade}
                                    lesson={this.props.lesson}
                                    courseName={this.props.courseName}
                                />
                            </ErrorBoundary>
                            <Spacer/>
                        </div>
                    )}

                    <div className={classes.root}>
                        <ProblemInput
                            classes={classes}
                            state={this.state}
                            step={this.step}
                            seed={this.props.seed}
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
                    <Grid container spacing={0} justifyContent="center" alignItems="center">
                        <Grid item xs={false} sm={false} md={4}/>
                        <Grid item xs={4} sm={4} md={1}>
                            <center>
                                <IconButton aria-label="delete" onClick={this.toggleHints} title="View available hints"
                                            {...stagingProp({
                                                "data-selenium-target": `hint-button-${this.props.index}`
                                            })}
                                >
                                    <img src={`${process.env.PUBLIC_URL}/static/images/icons/raise_hand.png`}
                                         alt="hintToggle"/>
                                </IconButton>
                            </center>
                        </Grid>
                        <Grid item xs={4} sm={4} md={2}>
                            <center>
                                <Button className={classes.button} style={{ width: "80%" }} size="small"
                                        onClick={this.submit}
                                        disabled={(use_expanded_view && debug)}
                                        {...stagingProp({
                                            "data-selenium-target": `submit-button-${this.props.index}`
                                        })}>
                                    Submit
                                </Button>
                            </center>
                        </Grid>
                        <Grid item xs={4} sm={3} md={1}>
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                alignContent: "center",
                                justifyContent: "center"
                            }}>
                                {this.state.isCorrect &&
                                    <img className={classes.checkImage}
                                         style={{ opacity: this.state.checkMarkOpacity, width: "45%" }}
                                         alt=""
                                         {...stagingProp({
                                             "data-selenium-target": `step-correct-img-${this.props.index}`
                                         })}
                                         src={`${process.env.PUBLIC_URL}/static/images/icons/green_check.svg`}/>
                                }
                                {this.state.isCorrect === false &&
                                    <img className={classes.checkImage}
                                         style={{ opacity: 100 - this.state.checkMarkOpacity, width: "45%" }}
                                         alt=""
                                         {...stagingProp({
                                             "data-selenium-target": `step-correct-img-${this.props.index}`
                                         })}
                                         src={`${process.env.PUBLIC_URL}/static/images/icons/error.svg`}/>
                                }
                            </div>
                        </Grid>
                        <Grid item xs={false} sm={1} md={4}/>
                    </Grid>
                </CardActions>
            </Card>


        )
    };
}

export default withStyles(styles)(ProblemCard);
