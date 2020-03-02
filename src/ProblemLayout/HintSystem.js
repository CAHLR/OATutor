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
      latestPart: 0
    }
  }


  unlockHint = (event, expanded, i) => {
    if (expanded && i < this.props.hints.length - 1) {
      this.props.unlockStatus[i + 1] = 1;
    }
    this.setState({ latestPart: i });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        {this.props.hints.map((hint, i) => {
          return <ExpansionPanel key={i}
            onChange={(event, expanded) => this.unlockHint(event, expanded, i)}
            disabled={this.props.unlockStatus[i] === 0}>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>
                Hint {i + 1}: {hint.title} {this.props.unlockStatus[i] === 0 ? " [LOCKED]" : ""}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
            <Typography component={'span'}>
              <Latex>
                {hint.text}
              </Latex>
              {hint.type === "scaffold" ? <div><br/><HintTextbox hintAnswer={hint.hintAnswer} /></div> : "" }
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