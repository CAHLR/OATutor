import React, { useContext } from "react";
import { ThemeContext } from "../config/config";
import { AppBar, Box, Toolbar } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";

const SessionExpired = (props) => {
  const context = useContext(ThemeContext)

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
              <h1>Oops, something went wrong!</h1>
              <h2>It looks like your session has expired.</h2>
            </center>
            <Divider/>
            <center>
              <br/>
              <p>If you are a student, please reload the page or open the page from your LMS again.</p>
              <br/>
              <p>If you are an instructor, please reload the page or create a new assignment.</p>
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

export default SessionExpired