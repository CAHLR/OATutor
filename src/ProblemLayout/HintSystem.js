import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HintTextbox from './HintTextbox.js';
import { renderText, chooseVariables } from '../ProblemLogic/renderText.js';
import SubHintSystem from './SubHintSystem.js';
import { DO_LOG_DATA, ThemeContext } from "../config/config";
import Spacer from "../Components/_General/Spacer";
import { stagingProp } from "../util/addStagingProperty";

class HintSystem extends React.Component {
    static contextType = ThemeContext;

    constructor(props) {
        super(props);
        var subHintsFinished = [];
        for (var i = 0; i < this.props.hints.length; i++) {
            subHintsFinished.push(new Array((this.props.hints[i].subHints !== undefined ? this.props.hints[i].subHints.length : 0)).fill(0));
        }
        this.state = {
            latestStep: 0,
            currentExpanded: -1,
            hintAnswer: "",
            showSubHints: new Array(this.props.hints.length).fill(false),
            subHintsFinished: subHintsFinished
        }
    }

    unlockHint = (event, expanded, i) => {
        if (this.state.currentExpanded === i) {
            this.setState({ currentExpanded: -1 });
        } else {
            this.setState({ currentExpanded: i });
            if (expanded && i < this.props.hintStatus.length) {
                this.props.unlockHint(i, this.props.hints[i].type);
            }
            this.setState({ latestStep: i });
        }
    }

    isLocked = (hintNum) => {
        if (hintNum === 0) {
            return false;
        }
        var dependencies = this.props.hints[hintNum].dependencies;
        var isSatisfied = dependencies.every(dependency => this.props.hintStatus[dependency] === 1);
        return !isSatisfied;
    }

    toggleSubHints = (event, i) => {
        this.setState(prevState => {
            var displayHints = prevState.showSubHints;
            displayHints[i] = !displayHints[i];
            return ({
                showSubHints: displayHints
            })
        }, () => {
            if (DO_LOG_DATA) {
                this.props.answerMade(this.index, this?.step?.knowledgeComponents, false);
            }
        });
    }

    unlockSubHint = (hintNum, i, isScaffold) => {
        this.setState(prevState => {
            prevState.subHintsFinished[i][hintNum] = (!isScaffold ? 1 : 0.5);
            return { subHintsFinished: prevState.subHintsFinished }
        }, () => {
            if (DO_LOG_DATA) {
                this.context.firebase.log(null, this.props.problemID, this.step, null, this.state.subHintsFinished, "unlockSubHint", chooseVariables(this.props.stepVars, this.props.seed), this.context.studentName);
            }
        });
    }

    submitSubHint = (parsed, hint, correctAnswer, i, hintNum) => {
        if (correctAnswer) {
            this.setState(prevState => {
                prevState.subHintsFinished[i][hintNum] = 1;
                return { subHintsFinished: prevState.subHintsFinished }
            });
        }
        if (DO_LOG_DATA) {
            this.context.firebase.hintLog(parsed, this.props.problemID, this.step, hint, correctAnswer, this.state.hintsFinished, chooseVariables(Object.assign({}, this.props.stepVars, hint.variabilization), this.props.seed), this.context.studentName);
        }
    }

    render() {
        const { classes, index } = this.props;
        return (
            <div className={classes.root}>
                {this.props.hints.map((hint, i) => {
                        return <Accordion key={i}
                                          onChange={(event, expanded) => this.unlockHint(event, expanded, i)}
                                          disabled={this.isLocked(i)}
                                          expanded={this.state.currentExpanded === i}
                                          defaultExpanded={false}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon/>}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                                {...stagingProp({
                                    "data-selenium-target": `hint-expand-${i}-${index}`
                                })}
                            >
                                <Typography className={classes.heading}>
                                    Hint {i + 1}: {renderText((hint.title === "nan" ? "" : hint.title), this.props.problemID, chooseVariables(Object.assign({}, this.props.stepVars, hint.variabilization), this.props.seed))}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography component={'span'} style={{ width: "100%" }}>
                                    {renderText(hint.text, this.props.problemID, chooseVariables(Object.assign({}, this.props.stepVars, hint.variabilization), this.props.seed))}
                                    {hint.type === "scaffold" ?
                                        <div>
                                            <Spacer/>
                                            <HintTextbox hintNum={i} hint={hint}
                                                         index={index}
                                                         submitHint={this.props.submitHint}
                                                         seed={this.props.seed}
                                                         hintVars={Object.assign({}, this.props.stepVars, hint.variabilization)}
                                                         toggleHints={(event) => this.toggleSubHints(event, i)}/>
                                        </div> : ""}
                                    {this.state.showSubHints[i] && hint.subHints !== undefined ?
                                        <div className="SubHints">
                                            <Spacer/>
                                            <SubHintSystem
                                                problemID={this.props.problemID}
                                                hints={hint.subHints}
                                                unlockHint={this.unlockSubHint}
                                                hintStatus={this.state.subHintsFinished[i]}
                                                submitHint={this.submitSubHint}
                                                parent={i}
                                                index={index}
                                                seed={this.props.seed}
                                                hintVars={Object.assign({}, this.props.stepVars, hint.variabilization)}
                                            />
                                            <Spacer/>
                                        </div>
                                        : ""}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    }
                )}
            </div>
        )
    };

}

const styles = theme => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
});


export default withStyles(styles)(HintSystem);
