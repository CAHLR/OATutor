import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HintTextbox from './HintTextbox.js';
import Latex from 'react-latex';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));
function HintSystem(props) {
  const classes = useStyles();

  var unlockHint = (event, expanded, i) => {
    if (expanded && i < props.hints.length - 1) {
      props.unlockStatus[i + 1] = 1;
    }
    console.log(props.unlockStatus);
  }

  return (
    <div className={classes.root}>
      {props.hints.map((hint, i) => {
        if (hint.type === "hint") {
          return <ExpansionPanel key={i} onChange={(event, expanded) => unlockHint(event, expanded, i)} disabled={props.unlockStatus[i] === 0}>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Hint {i + 1}: {hint.title}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Latex>
                {hint.text}
              </Latex>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        } else {
          return <ExpansionPanel key={i}>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Hint {i + 1}: {hint.title}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography>
                <Latex>
                  {hint.text}
                </Latex>
                <HintTextbox hintAnswer={hint.hintAnswer} />
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        }
      }
      )}
    </div>
  );
}

export default HintSystem;