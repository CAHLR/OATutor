import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import styles from './commonStyles.js';
import { lessonPlans } from '../config/config.js';
import {
  HashRouter as Router,
  NavLink
} from "react-router-dom";

class LessonSelection extends React.Component {
  constructor(props) {
    super(props);
    this.lessonPlans = lessonPlans;
    this.state = {
      preparedRemoveProgress: false,
      removedProgerss: false
    }
  }

  removeProgress = () => {
    this.setState({ removedProgress: true });
    this.props.removeProgress();
  }

  prepareRemoveProgress = () => {
    this.setState({ preparedRemoveProgress: true });
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
                        <NavLink activeClassName="active" className="link" to={"/lessons/"+i} type="menu">
                          <Button variant="contained" color="primary" className={classes.button} style={{ marginBottom: "10px" }} onClick={() => this.props.selectLesson(lesson)}>
                            Select
										      </Button>
                        </NavLink>

                      </Paper>
                    </center>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        </Grid>
        <br />
        <Grid container spacing={0} >
          <Grid item xs={3} sm={3} md={5} key={1} />
          <Grid item xs={6} sm={6} md={2} key={2}>
            {this.state.preparedRemoveProgress ?
              <Button className={classes.button} style={{ width: "100%" }} size="small" onClick={this.removeProgress} disabled={this.state.removedProgress}>{this.state.removedProgress ? "Progress Reset!" : "Are you sure?"}</Button> :
              <Button className={classes.button} style={{ width: "100%" }} size="small" onClick={this.prepareRemoveProgress} disabled={this.state.preparedRemoveProgress}>{"Reset Progress"}</Button>}
          </Grid>
          <Grid item xs={3} sm={3} md={4} key={3} />
        </Grid>
        <br />
      </div>
    );
  }
}

export default withStyles(styles)(LessonSelection);