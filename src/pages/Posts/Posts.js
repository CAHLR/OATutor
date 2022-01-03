import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import React, { useState } from "react";
import { AppBar, Box, Button, Menu, MenuItem, Toolbar } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import SetUpCanvasIntegration from "./SetUpCanvasIntegration";
import BrandLogoNav from "../../Components/_General/BrandLogoNav";

const POSTS = [
    {
        name: "Setting up Canvas Integration",
        paths: ['set-up-canvas-integration'],
        component: SetUpCanvasIntegration
    }
]

const Posts = () => {
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
                    <Grid container justifyContent={"space-between"} spacing={0} role={"navigation"}>
                        <Grid item xs={3} key={1}>
                            <BrandLogoNav noLink={true}/>
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
                                    dense
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    getContentAnchorEl={null}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                                    transformOrigin={{ vertical: "top", horizontal: "center" }}
                                    open={open}
                                    onClose={handleClose}
                                    MenuListProps={{
                                        'aria-labelledby': 'basic-button',
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
                    <Box width="75%" maxWidth={1500}>
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

export default Posts
