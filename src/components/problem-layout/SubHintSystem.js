import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HintTextbox from './HintTextbox.js';
import { renderText, chooseVariables } from '../../platform-logic/renderText.js';
import Spacer from "../Spacer";
import { ThemeContext } from "../../config/config";


class SubHintSystem extends React.Component {
    static contextType = ThemeContext;

    constructor(props) {
        super(props);
        this.giveStuFeedback = props.giveStuFeedback;
        this.unlockFirstHint = props.unlockFirstHint;
        this.state = {
            latestStep: 0,
            currentExpanded: this.unlockFirstHint ? 0 : -1,
            hintAnswer: ""
        }
        if (this.unlockFirstHint && this.props.hintStatus.length > 0) {
            this.props.unlockHint(0, this.props.parent);
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
        const { classes, index, parent, hintVars, problemID, seed } = this.props;
        const { currentExpanded } = this.state;
        const { debug, use_expanded_view } = this.context;

        return (
            <div className={classes.root}>
                {this.props.hints.map((hint, i) => {
                        return <Accordion key={i}
                            onChange={(event, expanded) => this.unlockHint(event, expanded, i)}
                            disabled={this.isLocked(i) && !(use_expanded_view && debug)}
                            expanded={currentExpanded === i || (use_expanded_view != null && use_expanded_view && debug)}
                            defaultExpanded={false}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon/>}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography className={classes.heading}>
                                    Hint {i + 1}: {renderText(hint.title, problemID,
                                    chooseVariables(Object.assign({}, hintVars, hint.variabilization), seed), this.context)} </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography component={'span'} style={{ width: "100%" }}>
                                    {renderText(hint.text, problemID, chooseVariables(Object.assign({}, hintVars, hint.variabilization), seed), this.context)}
                                    {hint.type === "scaffold" ?
                                        <div>
                                            <Spacer/>
                                            <HintTextbox hint={hint} type={"subHintTextbox"}
                                                         hintNum={i}
                                                         index={`${index}-${parent}`}
                                                         submitHint={(parsed, hint, correctAnswer, hintNum) => this.props.submitHint(parsed, hint, correctAnswer, i, hintNum)}
                                                         giveStuFeedback={this.giveStuFeedback}
                                            />
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
