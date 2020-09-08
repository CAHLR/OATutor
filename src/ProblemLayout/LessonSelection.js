import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import styles from './commonStyles.js';
import { lessonPlans } from '../config/config.js';

class LessonSelection extends React.Component {
  constructor(props) {
    super(props);
    this.lessonPlans = lessonPlans;
    this.removedProgress = false;
    this.preparedRemoveProgress = false;
  }

  removeProgress = () => {
    this.removedProgress = true;
    this.props.removeProgress();
  }

  prepareRemoveProgress = () => {
    this.preparedRemoveProgress = true;
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
        >
          <Box width="75%" maxWidth={1500} >
            <center>
              <h1>Welcome to OpenITS!</h1>
              <h2>Please select a lesson plan</h2>
            </center>
            <Divider />
            <br />
            <Grid container spacing={3} >
              {this.lessonPlans.map((lesson, i) => {
                return (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <center>
                      <Paper className={classes.paper}>
                        <h2 style={{ marginTop: "5px", marginBottom: "10px" }}>{lesson.name}</h2>
                        <h3 style={{ marginTop: "5px" }}>{lesson.topics}</h3>
                        <Button variant="contained" color="primary" className={classes.button} style={{ marginBottom: "10px" }} onClick={() => this.props.selectLesson(lesson)}>
                          Select
										</Button>
                      </Paper>
                    </center>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        </Grid>
        <br />
        <Grid container spacing={3} >
          <Grid item xs={3} sm={3} md={5} key={1} />
          <Grid item xs={6} sm={6} md={2} key={2}>
            {this.preparedRemoveProgress ?
              <Button className={classes.button} style={{width: "100%"}} size="small" onClick={this.removeProgress} disabled={this.removedProgress}>{this.removedProgress ? "Progress Reset!" : "Are you sure?"}</Button> :
              <Button className={classes.button} style={{width: "100%"}} size="small" onClick={this.prepareRemoveProgress} disabled={this.preparedRemoveProgress}>{"Reset Progress"}</Button>}
          </Grid>
          <Grid item xs={3} sm={3} md={5} key={3} />

        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(LessonSelection);