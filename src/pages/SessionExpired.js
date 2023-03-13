import React from "react";
import { AppBar, Box, Toolbar } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import BrandLogoNav from "@components/BrandLogoNav";
import Spacer from "@components/Spacer";

const SessionExpired = () => {

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
                            <h1>Oops, something went wrong!</h1>
                            <h2>It looks like your session has expired.</h2>
                        </center>
                        <Divider/>
                        <center>
                            <Spacer/>
                            <p>If you are a student, please reload the page or open the page from your LMS again.</p>
                            <Spacer/>
                            <p>If you are an instructor, please reload the page or create a new assignment.</p>
                            <Spacer height={24 * 3}/>
                        </center>
                    </Box>
                </Grid>
            </div>
        </div>
    </>
}

export default SessionExpired
