import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import styles from './commonStyles.js';
import IconButton from '@material-ui/core/IconButton';
import { lessonPlans, coursePlans, ThemeContext } from '../config/config.js';
import {
    NavLink
} from "react-router-dom";
import Spacer from "../Components/_General/Spacer";

class LessonSelection extends React.Component {
    static contextType = ThemeContext;

    constructor(props, context) {
        super(props);

        this.user = context.user || {}
        this.isPrivileged = !!this.user.privileged

        this.lessonPlans = lessonPlans;
        this.coursePlans = coursePlans;
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
        //console.log("courseNum" + this.props.courseNum);
        if (this.props.courseNum == null) {
            return (
                <div>
                    <Grid
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Box width="75%" maxWidth={1500} role={"main"}>
                            <center>
                                {this.isPrivileged
                                    ? <h1>Welcome Instructor!</h1>
                                    : <h1>Welcome to OpenITS!</h1>
                                }
                                <h2>Please select a course</h2>
                                {this.isPrivileged
                                    && <h4>(for {this.user.resource_link_title})</h4>
                                }
                            </center>
                            <Divider/>
                            <Spacer/>
                            <Grid container spacing={3}>
                                {this.coursePlans.map((course, i) => {
                                    return (
                                        <Grid item xs={12} sm={6} md={4} key={i}>
                                            <center>
                                                <Paper className={classes.paper}>
                                                    <h2 style={{
                                                        marginTop: "5px",
                                                        marginBottom: "10px"
                                                    }}>{course.courseName}</h2>
                                                    <IconButton aria-label={`View Course ${i}`}
                                                                aria-roledescription={`Navigate to course ${i}'s page to view available lessons`}
                                                                role={"link"}
                                                                onClick={() => {
                                                                    this.props.history.push(`/courses/${i}`)
                                                                    this.props.selectCourse(course)
                                                                }}>
                                                        <img
                                                            src={`${process.env.PUBLIC_URL}/static/images/icons/folder.png`}
                                                            width="64px"
                                                            alt="folderIcon"/>
                                                    </IconButton>
                                                </Paper>
                                            </center>
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </Box>
                    </Grid>
                    <Spacer/>
                    <Grid container spacing={0}>
                        <Grid item xs={3} sm={3} md={5} key={1}/>
                        {!this.isPrivileged && <Grid item xs={6} sm={6} md={2} key={2}>
                            {this.state.preparedRemoveProgress ?
                                <Button className={classes.button} style={{ width: "100%" }} size="small"
                                        onClick={this.removeProgress}
                                        disabled={this.state.removedProgress}>{this.state.removedProgress ? "Progress Reset!" : "Are you sure?"}</Button> :
                                <Button className={classes.button} style={{ width: "100%" }} size="small"
                                        onClick={this.prepareRemoveProgress}
                                        disabled={this.state.preparedRemoveProgress}>{"Reset Progress"}</Button>}
                        </Grid>}
                        <Grid item xs={3} sm={3} md={4} key={3}/>
                    </Grid>
                    <Spacer/>
                </div>
            );
        } else {
            return (
                <div>
                    <Grid
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Box width="75%" maxWidth={1500} role={"main"}>
                            <center>
                                {this.isPrivileged
                                    ? <h1>Welcome Instructor!</h1>
                                    : <h1>Welcome to OpenITS!</h1>
                                }
                                <h2>Please select a lesson plan</h2>
                                {this.isPrivileged
                                    && <h4>(for {this.user.resource_link_title})</h4>
                                }
                            </center>
                            <Divider/>
                            <Spacer/>
                            <Grid container spacing={3}>
                                {this.coursePlans[this.props.courseNum].lessons.map((lesson, i) => {
                                    return (
                                        <Grid item xs={12} sm={6} md={4} key={i}>
                                            <center>
                                                <Paper className={classes.paper}>
                                                    <h2 style={{
                                                        marginTop: "5px",
                                                        marginBottom: "10px"
                                                    }}>{lesson.name}</h2>
                                                    <h3 style={{ marginTop: "5px" }}>{lesson.topics}</h3>
                                                    <NavLink activeClassName="active" className="link"
                                                             to={"/lessons/" + lesson.lessonNum}
                                                             type="menu">
                                                        <Button variant="contained" color="primary"
                                                                className={classes.button}
                                                                style={{ marginBottom: "10px" }}
                                                                onClick={() => {
                                                                    this.props.history.push(`/lessons/${lesson.lessonNum}`)
                                                                    this.props.selectLesson(lesson)
                                                                }}>
                                                            Select
                                                        </Button>
                                                    </NavLink>
                                                </Paper>
                                            </center>
                                        </Grid>
                                    )
                                })}
                            </Grid>
                            <Spacer/>
                        </Box>
                    </Grid>
                    <Spacer/>
                    <Grid container spacing={0}>
                        <Grid item xs={3} sm={3} md={5} key={1}/>
                        {!this.isPrivileged && <Grid item xs={6} sm={6} md={2} key={2}>
                            {this.state.preparedRemoveProgress ?
                                <Button className={classes.button} style={{ width: "100%" }} size="small"
                                        onClick={this.removeProgress}
                                        disabled={this.state.removedProgress}>{this.state.removedProgress ? "Progress Reset!" : "Are you sure?"}</Button> :
                                <Button className={classes.button} style={{ width: "100%" }} size="small"
                                        onClick={this.prepareRemoveProgress}
                                        disabled={this.state.preparedRemoveProgress}>{"Reset Progress"}</Button>}
                        </Grid>}
                        <Grid item xs={3} sm={3} md={4} key={3}/>
                    </Grid>
                    <Spacer/>
                </div>
            );
        }
    }
}

export default withStyles(styles)(LessonSelection);
