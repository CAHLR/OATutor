import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HintTextbox from './HintTextbox.js';

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

  return (
    <div className={classes.root}>
      {props.hints.map((hint, i) => {
        if (hint.type === "hint") {
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
                {hint.text}
              </Typography>
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
                {hint.text}
                <HintTextbox hintAnswer={hint.hintAnswer}/>
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