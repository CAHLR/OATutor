import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HintSystem from './HintSystem.js';

class HintWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.unlockStatus = new Array(props.hints.length).fill(0);
    this.unlockStatus[0] = 1;
  }

  render() {
    const { classes } = this.props;
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
            <HintSystem hints={this.props.hints} unlockStatus={this.unlockStatus} />
          </ExpansionPanelDetails>
        </ExpansionPanel>

      </div>
    );
  }
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


export default withStyles(styles)(HintWrapper);