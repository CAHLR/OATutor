import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './common-styles.js';
import { checkAnswer } from '../../platform-logic/checkAnswer.js';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { chooseVariables } from '../../platform-logic/renderText.js';
import { ThemeContext } from '../../config/config.js';
import ProblemInput from "../problem-input/ProblemInput";
import { stagingProp } from "../../util/addStagingProperty";
import { toastNotifyCorrectness } from "./ToastNotifyCorrectness";
import { joinList } from "../../util/formListString";

class HintTextbox extends React.Component {
    static contextType = ThemeContext;

    constructor(props, context) {
        super(props);
        this.hint = props.hint;
        this.index = props.index;
        this.giveStuFeedback = props.giveStuFeedback
        this.allowRetry = this.giveStuFeedback
        this.showCorrectness = this.giveStuFeedback
        this.state = {
            inputVal: "",
            isCorrect: context.use_expanded_view && context.debug ? true : null,
            checkMarkOpacity: context.use_expanded_view && context.debug ? '100' : '0',
            showHints: false,
        }
    }

    handleKey = (event) => {
        if (event.key === 'Enter') {
            this.submit();
        }
    }

    submit = () => {
        const [parsed, correctAnswer, reason] = checkAnswer({
            attempt: this.state.inputVal,
            actual: this.hint.hintAnswer,
            answerType: this.hint.answerType,
            precision: this.hint.precision,
            variabilization: chooseVariables(this.props.hintVars, this.props.seed),
            questionText: this.hint.text
        });
        this.props.submitHint(parsed, this.hint, correctAnswer, this.props.hintNum);

        const isCorrect = !!correctAnswer

        toastNotifyCorrectness(isCorrect, reason);

        this.setState({
            isCorrect,
            checkMarkOpacity: isCorrect ? '100' : '0'
        }, () => parsed);
    }

    editInput = (event) => {
        this.setInputValState(event.target.value)
    }

    setInputValState = (inputVal) => {
        // console.debug("new inputVal state: ", inputVal)
        this.setState(({ isCorrect }) => ({ inputVal, isCorrect: isCorrect ? true : null }))
    }

    render() {
        const { classes, index, hintNum } = this.props;
        const { isCorrect } = this.state;
        const { debug, use_expanded_view } = this.context;

        const hintIndex = `${hintNum}-${index}`
        const problemAttempted = isCorrect != null

        return (
            <div>
                <ProblemInput
                    variabilization={chooseVariables(this.props.hintVars, this.props.seed)}
                    allowRetry={this.allowRetry}
                    giveStuFeedback={this.giveStuFeedback}
                    showCorrectness={this.showCorrectness}
                    classes={classes}
                    state={this.state}
                    step={this.hint}
                    seed={this.props.seed}
                    _setState={(state) => this.setState(state)}
                    context={this.context}
                    editInput={this.editInput}
                    setInputValState={this.setInputValState}
                    handleKey={this.handleKey}
                    index={hintIndex}
                />

                <Grid container spacing={0} justifyContent="center" alignItems="center">
                    <Grid item xs={false} sm={false} md={4}/>
                    <Grid item xs={4} sm={4} md={1}>
                        {this.props.type !== "subHintTextbox" && this.hint.subHints !== undefined ?
                            <center>
                                <IconButton aria-label="delete" onClick={this.props.toggleHints}
                                            title="View available hints"
                                            disabled={(use_expanded_view && debug)}
                                            {...stagingProp({
                                                "data-selenium-target": `hint-button-${hintIndex}`
                                            })}
                                >
                                    <img src={`${process.env.PUBLIC_URL}/static/images/icons/raise_hand.png`}
                                         alt="hintToggle"/>
                                </IconButton>
                            </center> :
                            <img src={'/static/images/icons/raise_hand.png'}
                                 alt="hintToggle"
                                 style={{ visibility: "hidden" }}/>
                        }
                    </Grid>
                    <Grid item xs={4} sm={4} md={2}>
                        <center>
                            <Button className={classes.button} style={{ width: "80%" }} size="small"
                                    onClick={this.submit}
                                    disabled={(use_expanded_view && debug) || (!this.allowRetry && problemAttempted)}
                                    {...stagingProp({
                                        "data-selenium-target": `submit-button-${hintIndex}`
                                    })}
                            >
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
                            {(!this.showCorrectness || !this.allowRetry) &&
                                <img className={classes.checkImage}
                                    style={{ opacity: this.state.isCorrect == null ? 0 : 1, width: "45%" }}
                                    alt="Exclamation Mark Icon"
                                    title={`The instructor has elected to ${joinList(!this.showCorrectness && 'hide correctness', !this.allowRetry && "disallow retries")}`}
                                    {...stagingProp({
                                        "data-selenium-target": `step-correct-img-${hintIndex}`
                                    })}
                                    src={`${process.env.PUBLIC_URL}/static/images/icons/exclamation.svg`}/>
                            }
                            {this.state.isCorrect && this.showCorrectness && this.allowRetry &&
                                <img className={classes.checkImage}
                                    style={{ opacity: this.state.checkMarkOpacity, width: "45%" }}
                                    alt="Green Checkmark Icon"
                                    {...stagingProp({
                                        "data-selenium-target": `step-correct-img-${hintIndex}`
                                    })}
                                    src={`${process.env.PUBLIC_URL}/static/images/icons/green_check.svg`}/>
                            }
                            {this.state.isCorrect === false && this.showCorrectness && this.allowRetry &&
                                <img className={classes.checkImage}
                                    style={{ opacity: 100 - this.state.checkMarkOpacity, width: "45%" }}
                                    alt="Red X Icon"
                                    {...stagingProp({
                                        "data-selenium-target": `step-correct-img-${hintIndex}`
                                    })}
                                    src={`${process.env.PUBLIC_URL}/static/images/icons/error.svg`}/>
                            }
                        </div>
                    </Grid>
                    <Grid item xs={false} sm={1} md={4}/>
                </Grid>

            </div>
        );
    }
}

export default withStyles(styles)(HintTextbox);
