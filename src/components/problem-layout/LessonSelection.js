import React, { Fragment } from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import styles from './common-styles.js';
import IconButton from '@material-ui/core/IconButton';
import { _coursePlansNoEditor, ThemeContext, SITE_NAME, SHOW_COPYRIGHT } from '../../config/config.js';
import Spacer from "../Spacer";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import { Typography } from "@material-ui/core";
import { IS_STAGING_OR_DEVELOPMENT } from "../../util/getBuildType";
import BuildTimeIndicator from "@components/BuildTimeIndicator";
import withTranslation from "../../util/withTranslation.js"

class LessonSelection extends React.Component {
    static contextType = ThemeContext;

    constructor(props, context) {
        super(props);

        this.user = context.user || {}
        this.isPrivileged = !!this.user.privileged

        this.coursePlans = _coursePlansNoEditor;
        this.state = {
            preparedRemoveProgress: false,
            removedProgress: false
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
        const { translate } = this.props;
        const { classes, courseNum } = this.props;
        const selectionMode = courseNum == null ? "course" : "lesson"

        if (selectionMode === "lesson" && courseNum >= this.coursePlans.length) {
            return <Box width={'100%'} textAlign={'center'} pt={4} pb={4}>
                <Typography variant={'h3'}>Course <code>{courseNum}</code> is not valid!</Typography>
            </Box>
        }

        return (
            <>
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
                                    ? <h1>{translate('lessonSelection.welcomeInstructor')}</h1>
                                    : <h1>{translate('lessonSelection.welcomeTo')} {SITE_NAME.replace(/\s/, "")}!</h1>
                                }

                                <h2>{translate('lessonSelection.select')} {selectionMode === "course" ? translate('lessonSelection.course') : translate('lessonSelection.lessonplan')}</h2>
                                {this.isPrivileged
                                    && <h4>(for {this.user.resource_link_title})</h4>
                                }
                                {
                                    IS_STAGING_OR_DEVELOPMENT && <BuildTimeIndicator/>
                                }
                            </center>
                            <Divider/>
                            <Spacer/>
                            <Grid container spacing={3}>
                                {selectionMode === "course"
                                    ? this.coursePlans
                                        .map((course, i) =>
                                            <Grid item xs={12} sm={6} md={4} key={course.courseName}>
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
                                    : this.coursePlans[this.props.courseNum].lessons.map((lesson, i) => {
                                        return (
                                            <Grid item xs={12} sm={6} md={4} key={i}>
                                                <center>
                                                    <Paper className={classes.paper}>
                                                        <h2 style={{
                                                            marginTop: "5px",
                                                            marginBottom: "10px"
                                                        }}>
                                                            {lesson.name.toString().replace(/##/g, "")}
                                                        </h2>
                                                        <h3 style={{ marginTop: "5px" }}>{lesson.topics}</h3>
                                                        <Button variant="contained" color="primary"
                                                            className={classes.button}
                                                            aria-label={`View Lesson ${lesson.id}`}
                                                            aria-roledescription={`Navigate to lesson ${lesson.id}'s page to start working on problems`}
                                                            role={"link"}
                                                            style={{ marginBottom: "10px", minWidth: "auto", width: "auto"}}
                                                            onClick={() => {
                                                                this.props.history.push(`/lessons/${lesson.id}`)
                                                            }}>
                                                            {translate('lessonSelection.onlyselect')}
                                                        </Button>
                                                    </Paper>
                                                </center>
                                            </Grid>
                                        )
                                    })
                                }
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
                                    disabled={this.state.preparedRemoveProgress}>{translate('lessonSelection.resetprogress')}</Button>}
                        </Grid>}
                        <Grid item xs={3} sm={3} md={4} key={3}/>
                    </Grid>
                    <Spacer/>
                </div>
                <footer>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <div style={{ marginLeft: 20, fontSize: 16 }}>
                            {SHOW_COPYRIGHT && <>© {new Date().getFullYear()} {SITE_NAME}</>}
                        </div>
                        <div style={{ display: "flex", flexGrow: 1, marginRight: 20, justifyContent: "flex-end" }}>
                            <IconButton aria-label="help" title={`How to use ${SITE_NAME}?`}
                                href={`${window.location.origin}${window.location.pathname}#/posts/how-to-use`}>
                                <HelpOutlineOutlinedIcon htmlColor={"#000"} style={{
                                    fontSize: 36,
                                    margin: -2
                                }}/>
                            </IconButton>
                        </div>
                    </div>
                </footer>
            </>
        )
    }
}

export default withStyles(styles)(withTranslation(LessonSelection));
