import React, { useContext } from "react";
import { ThemeContext } from "../config/config";
import { AppBar, Box, Toolbar } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";

const AssignmentNotLinked = (props) => {
  const context = useContext(ThemeContext)
  console.debug('context', context)

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
              <h1>Welcome to OpenITS!</h1>
              <h2>Your instructor has not linked a lesson to this assignment yet.</h2>
            </center>
            <Divider/>
            <center>
              <br/>
              <p>Please check back later.</p>
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

export default AssignmentNotLinked
