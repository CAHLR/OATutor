import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HintTextbox from './HintTextbox.js';
import { renderText, chooseVariables } from '../ProblemLogic/renderText.js';
import Spacer from "../Components/_General/Spacer";


class SubHintSystem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            latestStep: 0,
            currentExpanded: -1,
            hintAnswer: ""
        }
    }

    unlockHint = (event, expanded, i) => {
        if (this.state.currentExpanded === i) {
            this.setState({ currentExpanded: -1 });
        } else {
            this.setState({ currentExpanded: i });
            if (expanded && i < this.props.hintStatus.length) {
                this.props.unlockHint(i, this.props.parent);
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

    render() {
        const { classes } = this.props;
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
                            >
                                <Typography className={classes.heading}>
                                    Hint {i + 1}: {renderText(hint.title, this.props.problemID,
                                    chooseVariables(Object.assign({}, this.props.hintVars, hint.variabilization), this.props.seed))} </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography component={'span'} style={{ width: "100%" }}>
                                    {renderText(hint.text, this.props.problemID, chooseVariables(Object.assign({}, this.props.hintVars, hint.variabilization), this.props.seed))}
                                    {hint.type === "scaffold" ?
                                        <div>
                                            <Spacer/>
                                            <HintTextbox hint={hint} type={"subHintTextbox"}
                                                         submitHint={(parsed, hint, correctAnswer, hintNum) => this.props.submitHint(parsed, hint, correctAnswer, i, hintNum)}/>
                                        </div> : ""}
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


export default withStyles(styles)(SubHintSystem);
