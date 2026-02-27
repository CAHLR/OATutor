import React from "react";
import { AppBar, Box, Toolbar, Button } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import { useHistory, useParams } from "react-router-dom";
import BrandLogoNav from "@components/BrandLogoNav";
import Spacer from "@components/Spacer";

const LessonComplete = () => {
  const history = useHistory();
  const { lessonID } = useParams();

  return (
    <>
      <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20 }}>
        <AppBar position="static">
          <Toolbar>
            <Grid container spacing={0} role={"navigation"}>
              <Grid item xs={3} key={1}>
                <BrandLogoNav noLink={true} />
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
                <h1>Lesson complete</h1>
                <h2>You have finished lesson {lessonID}.</h2>
              </center>
              <Divider />
              <center>
                <Spacer />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => history.push("/")}
                >
                  Back to lessons
                </Button>
                <Spacer height={24 * 3} />
              </center>
            </Box>
          </Grid>
        </div>
      </div>
    </>
  );
};

export default LessonComplete;
