import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import React, { useState } from "react";
import { AppBar, Box, Button, makeStyles, Menu, MenuItem, Toolbar } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import BrandLogoNav from "@components/BrandLogoNav";
import { SITE_NAME, SITE_VERSION } from "../../config/config";

import HowToUse from "./HowToUse";
import CanvasAssignments from "./CanvasAssignments";
import SetUpCanvasIntegration from "./SetUpCanvasIntegration";

const POSTS = [
    {
        name: "Setting up Canvas Integration",
        paths: ['set-up-canvas-integration'],
        component: SetUpCanvasIntegration
    },
    {
        name: "Creating Canvas Assignments",
        paths: ['canvas-assignments'],
        component: CanvasAssignments
    },
    {
        name: `How to use ${SITE_NAME} v${SITE_VERSION}`,
        paths: [`how-to-use`],
        component: HowToUse
    }
]


const useStyles = makeStyles({
    button: {
        textDecoration: "underline",
        "&:hover": {
            cursor: "pointer"
        }
    },
    fullWidth: {
        width: "100%"
    },
    textCenter: {
        textAlign: "center",
    },
    unselectable: {
        userSelect: "none"
    },
    image: {
        maxWidth: "100%",
        marginBottom: 8
    },
    "p-8": {
        padding: "2rem"
    },
    "p-16": {
        padding: "4rem"
    },
    "pt-2": {
        paddingTop: "0.5rem"
    },
    "pt-8": {
        paddingTop: "2rem"
    },
    contentContainer: {
        width: "75%",
        maxWidth: "75ch"
    }
});


const Posts = () => {
    const classes = useStyles()

    const { path, url } = useRouteMatch();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return <>
        <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 50 }}>
            <AppBar position="static">
                <Toolbar>
                    <Grid container justifyContent={"space-between"} spacing={0} role={"navigation"} alignItems={"center"}>
                        <Grid item xs={3} key={1}>
                            <BrandLogoNav/>
                        </Grid>
                        <Grid item xs={3} key={3}>
                            <div style={{ textAlign: 'right', paddingTop: "3px" }}>
                                <Button
                                    variant={"contained"}
                                    id="basic-button"
                                    aria-controls="basic-menu"
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}
                                    onClick={handleClick}
                                >
                                    All Posts
                                </Button>
                                <Menu
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    getContentAnchorEl={null}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                                    transformOrigin={{ vertical: "top", horizontal: "center" }}
                                    open={open}
                                    onClose={handleClose}
                                    MenuListProps={{
                                        'aria-labelledby': 'basic-button',
                                        dense: true
                                    }}
                                >
                                    {POSTS.map(post => {
                                        return <MenuItem key={post.paths[0]} onClick={handleClose}>
                                            <Link to={`${url}/${post.paths[0]}`}>{post.name}</Link>
                                        </MenuItem>
                                    })}
                                </Menu>
                            </div>
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
                    <Box className={classes.contentContainer} role={"main"}>
                        <Switch>
                            <Route exact path={path}>
                                <h3>Click the top right corner to select a post.</h3>
                            </Route>
                            {
                                POSTS.map(post => <Route key={post.paths[0]}
                                                         path={post.paths.map(_path => `${path}/${_path}`)}>
                                    {post.component()}
                                </Route>)
                            }
                            <Route>
                                <h3>Post not found :(</h3>
                            </Route>
                        </Switch>
                    </Box>
                </Grid>
            </div>
        </div>
    </>
}

export { Posts, useStyles }
