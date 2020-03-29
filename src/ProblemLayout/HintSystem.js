import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HintTextbox from './HintTextbox.js';
import Latex from 'react-latex';

// Step types: hint, scaffold, answer

class HintSystem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latestStep: 0,
      hintAnswer: ""
    }
  }


  finishHint = (event, expanded, i) => {
    if (expanded && i < this.props.hintStatus.length - 1) {
      this.props.finishHint(i);
    }
    this.setState({ latestStep: i });
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
            onChange={(event, expanded) => this.finishHint(event, expanded, i)}
            disabled={this.isLocked(i)}>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>
                Hint {i + 1}: {hint.title} {this.isLocked(i) ? " [LOCKED]" : ""}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
            <Typography component={'span'}>
              <Latex>
                {hint.text}
              </Latex>
              {hint.type === "scaffold" ? <div><br/><HintTextbox hint={hint}/></div> : "" }
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