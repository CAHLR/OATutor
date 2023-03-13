import React, { useContext } from "react";
import { findLessonById, _lessonPlansNoEditor, ThemeContext } from "../config/config";
import { AppBar, Box, Toolbar } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import BrandLogoNav from "@components/BrandLogoNav";
import Spacer from "@components/Spacer";

const AssignmentAlreadyLinked = (props) => {
    const lessonPlans = _lessonPlansNoEditor;
    const context = useContext(ThemeContext)

    const _linkedLesson = +context.alreadyLinkedLesson
    const linkedLesson = !isNaN(_linkedLesson)
        ? lessonPlans[+context.alreadyLinkedLesson]
        : context.alreadyLinkedLesson.length > 1 ?
            findLessonById(context.alreadyLinkedLesson) :
            null

    console.debug("linkedLesson", linkedLesson)

    return <>
        <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20 }}>
            <AppBar position="static">
                <Toolbar>
                    <Grid container spacing={0} role={"navigation"}>
                        <Grid item xs={3} key={1}>
                            <BrandLogoNav noLink={true}/>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
            <div>
                <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Box width="75%" maxWidth={1500}>
                        <center>
                            {linkedLesson
                                ? <h1>This assignment has been linked to
                                    lesson {linkedLesson.name} {linkedLesson.topic} successfully!</h1>
                                : <h1>This assignment has been linked successfully!</h1>
                            }
                            <h2>To link a new OATutor lesson, please create a new assignment on your LMS.</h2>
                            <h2>To preview the lesson, click on "Student View" on Canvas.</h2>
                        </center>
                        <Divider/>
                        <center>
                            <Spacer/>
                            {linkedLesson
                                && <>
                                    <p>Course Name: {linkedLesson.courseName}</p>
                                    <p>Lesson Name: {linkedLesson.name} {linkedLesson.topics}</p>
                                </>
                            }
                            <Spacer height={24 * 4}/>
                        </center>
                    </Box>
                </Grid>
            </div>
        </div>
    </>
}

export default AssignmentAlreadyLinked
