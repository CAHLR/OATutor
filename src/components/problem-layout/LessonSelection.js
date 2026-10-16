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
import { isFullChatLesson } from '../../util/officeHours.js';
import Spacer from "../Spacer";
import { Typography } from "@material-ui/core";
import { IS_STAGING_OR_DEVELOPMENT } from "../../util/getBuildType";
import BuildTimeIndicator from "@components/BuildTimeIndicator";
import withTranslation from "../../util/withTranslation.js";
import MenuBookIcon from '@material-ui/icons/MenuBook';
import { LocalizationConsumer } from '../../util/LocalizationContext';
import { withResponsive } from '../../util/ResponsiveContext';
import { getLastVisited, resolveResume } from '../../util/lastVisited';

class LessonSelection extends React.Component {
    static contextType = ThemeContext;

    constructor(props, context) {
        super(props);

        this.user = context.user || {}
        this.isPrivileged = !!this.user.privileged

        this.coursePlans = _coursePlansNoEditor;

        this.state = {
            preparedRemoveProgress: false,
            removedProgress: false,
            lastVisited: null,
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (this.props.courseNum == null) this.loadResume();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    // Saved mastery decides whether Resume reopens the last lesson or moves on to the next one.
    loadResume = async () => {
        try {
            await this.props.loadBktProgress?.();
        } catch (e) {
            console.debug("could not load saved progress for the resume card", e);
        }
        const lastVisited = await getLastVisited(this.context?.browserStorage);
        if (this._isMounted) this.setState({ lastVisited });
    }

    renderResumeCard() {
        const { translate, classes } = this.props;
        const isMobile = this.props.responsive?.isMobile ?? false;
        const resume = resolveResume(this.state.lastVisited, this.coursePlans, this.context?.bktParams);
        if (!resume) return null;

        const { kind, course, lesson, finished } = resume;
        const label = (l) => [String(l?.name || l?.id || "").replace(/##/g, "").trim(), l?.topics].filter(Boolean).join(" · ");

        return (
            <Grid item xs={12}>
                <Paper
                    className={classes.paper}
                    component="section"
                    aria-label={translate('lessonSelection.resumeTitle')}
                    style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "stretch" : "center",
                        gap: 16,
                        textAlign: "left",
                        border: "1.5px solid #3F7091",
                    }}
                >
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#3F7091" }}>
                            {translate('lessonSelection.resumeTitle')}
                        </div>
                        <h2 style={{ margin: "4px 0 2px", overflowWrap: "anywhere" }}>
                            {course.courseName} · {label(lesson)}
                        </h2>
                        {kind === "up-next" && (
                            <div style={{ color: "#5F6368" }}>
                                {translate('lessonSelection.upNextAfter')} {label(finished)}
                            </div>
                        )}
                    </div>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        style={{ minWidth: "8em", flexShrink: 0 }}
                        onClick={() => this.props.history.push(`/lessons/${lesson.id}`)}
                    >
                        {translate('lessonSelection.resume')}
                    </Button>
                </Paper>
            </Grid>
        );
    }
      
    removeProgress = () => {
        this.setState({ removedProgress: true });
        this.props.removeProgress();
    }

    prepareRemoveProgress = () => {
        this.setState({ preparedRemoveProgress: true });
    }

    handleCourseSelect = (course, courseIndex) => {
        const { history } = this.props;
        // localStorage.setItem("defaultLocale", course.language); 

        history.push(`/courses/${courseIndex}`);
    };

    render() {
        const { translate } = this.props;
        const { classes, courseNum } = this.props;
        const isMobile = this.props.responsive?.isMobile ?? false;
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
                        <Box
                            width={isMobile ? "100%" : "75%"}
                            maxWidth={1500}
                            style={isMobile ? { paddingLeft: 16, paddingRight: 16 } : undefined}
                            role={"main"}
                        >
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
                                {selectionMode === "course" && !this.isPrivileged && this.renderResumeCard()}
                                {selectionMode === "course"
                                    ? this.coursePlans
                                        .map((course, i) =>
                                            <Grid item xs={12} sm={6} md={4} key={course.courseName}>
                                                <center>
                                                    {/* card, text, and icon scale in proportion to one another */}
                                                    <Paper className={classes.paper} style={{ fontSize: "1rem", textAlign: "center" }}>
                                                        <h2 style={{
                                                            minHeight: "2.5em",
                                                            marginTop: "0.2em",
                                                            marginBottom: "0.4em",
                                                            textAlign: "center",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            wordBreak: "break-word",
                                                        }}>{course.courseName}</h2>
                                                        <IconButton aria-label={`View Course ${i}`}
                                                            aria-roledescription={`Navigate to course ${i}'s page to view available lessons`}
                                                            role={"link"}
                                                            onClick={() => {
                                                                this.props.selectCourse(course);
                                                                this.props.history.push(`/courses/${i}`)
                                                            }}>
                                                            <img
                                                                src={`${process.env.PUBLIC_URL}/static/images/icons/folder_outline_2.svg`}
                                                                // width="56px"
                                                                alt="folderIcon"
                                                                style= {{ width: "2.6em" }}
                                                            />
                                                        </IconButton>
                                                    </Paper>
                                                </center>
                                            </Grid>
                                        )
                                    : (() => {
                                        const course = this.coursePlans[this.props.courseNum];
                                        const metaLessons = Array.isArray(course.metaLessons) ? course.metaLessons : [];

                                        const metaLessonChildIds = new Set();
                                        metaLessons.forEach((m) => {
                                            (Array.isArray(m.lessons) ? m.lessons : []).forEach((childId) => metaLessonChildIds.add(childId));
                                        });

                                        // Students should only reach A/B variants through the meta-lesson, which
                                        // handles branch assignment. Selecting a variant directly would bypass it.
                                        // Lessons not referenced by any meta-lesson still show normally.
                                        const visibleLessons = course.lessons.filter(
                                            (lesson) => !metaLessonChildIds.has(lesson.metaId) && !metaLessonChildIds.has(lesson.id)
                                        );

                                        return (
                                            <Fragment>
                                                {visibleLessons.map((lesson, i) => {
                                        return (
                                            <Grid item xs={12} sm={6} md={4} key={i}>
                                            <center>
                                            <Paper className={classes.paper} style={{ position: "relative", height: "12rem" }}>
                                                {!isFullChatLesson(lesson) && (
                                                <IconButton
                                                    size="small"
                                                    style={{ position: 'absolute', top: 8, right: 8 }}
                                                    aria-label={`View all problems for lesson ${lesson.id}`}
                                                    onClick={() => this.props.history.push(`/lessons/${lesson.id}/problems`)}
                                                >
                                                    <MenuBookIcon fontSize="small" />
                                                </IconButton>
                                                )}

                                                <div
                                                    style={{
                                                        height: "2.5em",
                                                        marginTop: 5,
                                                        marginBottom: 10,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <h2 style={{ margin: 0 }}>{lesson.name.replace(/##/g, "")}</h2>
                                                </div>

                                                <div
                                                    style={{
                                                        height: "2em",
                                                        marginTop: 5,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <h3 style={{ margin: 0 }}>{lesson.topics}</h3>
                                                </div>

                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    className={classes.button}
                                                    style={{
                                                        width: "8em",
                                                        position: "absolute",
                                                        bottom: "1.2em",
                                                        left: "50%",
                                                        transform: "translateX(-50%)"
                                                    }}
                                                    onClick={() => this.props.history.push(`/lessons/${lesson.id}`)}
                                                >
                                                    {translate('lessonSelection.onlyselect')}
                                                </Button>
                                            </Paper>
                                            </center>
                                        </Grid>
                                        )
                                    })}
                                                {metaLessons.length > 0 && (
                                                    <Fragment>
                                                        <Grid item xs={12}>
                                                            <Typography variant="h5" component="h3" style={{ marginTop: 16, marginBottom: 8 }}>Meta Lessons</Typography>
                                                        </Grid>
                                                        {metaLessons.map((metaLesson) => (
                                                            <Grid item xs={12} sm={6} md={4} key={metaLesson.id}>
                                                                <center>
                                                                    <Paper className={classes.paper} style={{ position: "relative", height: "12rem" }}>
                                                                        <div
                                                                            style={{
                                                                                height: "2.5em",
                                                                                marginTop: 5,
                                                                                marginBottom: 10,
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                textAlign: "center",
                                                                            }}
                                                                        >
                                                                            <h2 style={{ margin: 0 }}>{metaLesson.name || metaLesson.id}</h2>
                                                                        </div>

                                                                        <div
                                                                            style={{
                                                                                height: "2em",
                                                                                marginTop: 5,
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                textAlign: "center",
                                                                            }}
                                                                        >
                                                                            <h3 style={{ margin: 0, color: "#5F6368" }}>Meta lesson</h3>
                                                                        </div>

                                                                        <Button
                                                                            variant="contained"
                                                                            color="primary"
                                                                            className={classes.button}
                                                                            style={{
                                                                                width: "8em",
                                                                                position: "absolute",
                                                                                bottom: "1.2em",
                                                                                left: "50%",
                                                                                transform: "translateX(-50%)"
                                                                            }}
                                                                            onClick={() => this.props.history.push(`/lessons/${metaLesson.id}`)}
                                                                        >
                                                                            {translate('lessonSelection.onlyselect')}
                                                                        </Button>
                                                                    </Paper>
                                                                </center>
                                                            </Grid>
                                                        ))}
                                                    </Fragment>
                                                )}
                                            </Fragment>
                                        );
                                    })()
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
                                <Button className={classes.button} size="small"
                                        style={{ 
                                            width: "100%", 
                                            color: "#3F7091",
                                            backgroundColor: "transparent",
                                            border: "1px solid #4F86A8",
                                            boxShadow: "none"
                                        }} 
                                    onClick={this.removeProgress}
                                    disabled={this.state.removedProgress}>{this.state.removedProgress ? translate('lessonSelection.reset') : translate('lessonSelection.aresure')}</Button> :
                                <Button className={classes.button} size="small"
                                    style={{ 
                                        width: "100%", 
                                        color: "#3F7091",
                                        backgroundColor: "transparent",
                                        border: "1px solid #4F86A8",
                                        boxShadow: "none"
                                    }} 
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
                    </div>
                </footer>




            </>
        )
    }
}

// export default withStyles(styles)(withTranslation(LessonSelection));

export default withStyles(styles)(withResponsive(withTranslation((props) => (
    <LocalizationConsumer>
        {({ language, platformLanguage }) => (
            <LessonSelection
                {...props}
                language={language}
                platformLanguage={platformLanguage}
            />
        )}
    </LocalizationConsumer>
))));