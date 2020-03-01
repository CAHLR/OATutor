import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import HintSystem from './HintSystem.js';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));
function HintWrapper(props) {
  const classes = useStyles();
  var unlockStatus = new Array(props.hints.length).fill(0);
  unlockStatus[0] = 1;


  return (
    <div className={classes.root}>
      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}>View available Hints</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <HintSystem hints={props.hints} unlockStatus={unlockStatus}/>
        </ExpansionPanelDetails>
      </ExpansionPanel>

    </div>
  );
}

export default HintWrapper;