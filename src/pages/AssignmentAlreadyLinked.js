import React, { useContext } from "react";
import { lessonPlans, ThemeContext } from "../config/config";
import { AppBar, Box, Toolbar } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";

const AssignmentAlreadyLinked = (props) => {
  const context = useContext(ThemeContext)

  const _linkedLesson = +context.alreadyLinkedLesson
  const linkedLesson = !isNaN(_linkedLesson) && context.alreadyLinkedLesson.length > 0
    ? lessonPlans[+context.alreadyLinkedLesson]
    : null

  console.debug("linkedLesson", linkedLesson)

  return <>
    <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20 }}>
      <AppBar position="static">
        <Toolbar>
          <Grid container spacing={0}>
            <Grid item xs={3} key={1}>
              <div style={{ textAlign: 'left', paddingTop: "3px" }}>Open ITS (v{context.siteVersion})</div>
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
                ? <h1>This assignment has already been linked to
                  lesson {linkedLesson.lessonNum}.</h1>
                : <h1>This assignment has already been linked.</h1>
              }
              <h2>To link a new OATutor lesson, please create a new assignment on your LMS.</h2>
            </center>
            <Divider/>
            <center>
              <br/>
              {linkedLesson
              && <>
                <p>Course Name: {linkedLesson.courseName}</p>
                <p>Lesson Name: {linkedLesson.name} {linkedLesson.topics}</p>
              </>
              }
              <br/>
              <br/>
              <br/>
              <br/>
            </center>
          </Box>
        </Grid>
      </div>
    </div>
  </>
}

export default AssignmentAlreadyLinked
