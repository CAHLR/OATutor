import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HintTextbox from './HintTextbox.js';
import renderText from '../ProblemLogic/renderText.js';
import SubHintSystem from './SubHintSystem.js';

class HintSystem extends React.Component {
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
      if (this.context.logData) {
        this.props.answerMade(this.index, this.step.knowledgeComponents, false);
      }
    });
  }

  unlockSubHint = (hintNum, i, isScaffold) => {
    this.setState(prevState => {
      prevState.subHintsFinished[i][hintNum] = (!isScaffold ? 1 : 0.5);
      return { subHintsFinished: prevState.subHintsFinished }
    }, () => {
      if (this.context.logData) {
        this.context.firebase.log(null, this.props.problemID, this.step, null, this.state.subHintsFinished, "unlockSubHint");
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
    if (this.context.logData) {
      this.context.firebase.hintLog(parsed, this.props.problemID, this.step, hint, correctAnswer, this.state.hintsFinished);
    }
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
                Hint {i + 1}: {hint.title}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography component={'span'} style={{ width: "100%" }}>
                {renderText(hint.text, this.props.problemID)}
                {hint.type === "scaffold" ?
                  <div><br /><HintTextbox hintNum={i} hint={hint} submitHint={this.props.submitHint}
                    toggleHints={(event) => this.toggleSubHints(event, i)} /></div> : ""}
                {this.state.showSubHints[i] && hint.subHints !== undefined ?
                  <div className="SubHints">
                    <br />
                    <SubHintSystem
                      problemID={this.props.problemID}
                      hints={hint.subHints}
                      unlockHint={this.unlockSubHint}
                      hintStatus={this.state.subHintsFinished[i]}
                      submitHint={this.submitSubHint}
                      parent={i}
                    />
                    <br /></div>
                  : ""}
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


export default withStyles(styles)(HintSystem);