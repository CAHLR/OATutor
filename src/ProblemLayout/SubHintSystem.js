import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HintTextbox from './HintTextbox.js';
import { renderText, chooseVariables } from '../ProblemLogic/renderText.js';


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
          return <ExpansionPanel key={i}
            onChange={(event, expanded) => this.unlockHint(event, expanded, i)}
            disabled={this.isLocked(i)}
            expanded={this.state.currentExpanded === i}
            defaultExpanded={false}>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>
                Hint {i + 1}: {renderText(hint.title, this.props.problemID,
                  chooseVariables(Object.assign({}, this.props.hintVars, hint.variabilization), this.props.seed))} </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography component={'span'}>
                {renderText(hint.text, this.props.problemID, chooseVariables(Object.assign({}, this.props.hintVars, hint.variabilization), this.props.seed))}
                {hint.type === "scaffold" ?
                  <div><br /><HintTextbox hint={hint} submitHint={(parsed, hint, correctAnswer, hintNum) => this.props.submitHint(parsed, hint, correctAnswer, i, hintNum)} /></div> : ""}
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
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