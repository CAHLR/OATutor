import React from 'react';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import ProblemWrapper from "@components/problem-layout/ProblemWrapper.js";

import { ThemeContext } from '../config/config.js';
import Box from "@material-ui/core/Box";
import BrandLogoNav from "@components/BrandLogoNav";
import { CONTENT_SOURCE } from "@common/global-config";
import Popup from "../components/Popup/Popup";
import About from "../pages/Posts/About.js";
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import styles from "../components/problem-layout/common-styles.js";
import { isMobileWidth } from "../util/responsive";

let problemPool = require(`@generated/processed-content-pool/${CONTENT_SOURCE}.json`)

let seed = Date.now().toString();
console.log("Generated seed");

export class DebugPlatform extends React.Component {
    static contextType = ThemeContext;

    constructor(props, context) {
        context.debug = true;
        super(props);
        this.problemIndex = {
            problems: problemPool
        };
        this.completedProbs = new Set();
        this.lesson = null;

        let chosenProblem = null;
        const problemIDs = [];
        // Add each Q Matrix skill model attribute to each step
        for (const problem of this.problemIndex.problems) {
            problemIDs.push(problem.id)
            if (problem.id === this.props.problemID) {
                chosenProblem = problem;
            }
            for (let stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
                const step = problem.steps[stepIndex];
                step.knowledgeComponents = context.skillModel[step.id];
            }
        }
        context.problemID = this.props.problemID
        context.problemIDs = problemIDs.sort(this.__compareProblemID)

        this.state = {
            currProblem: chosenProblem,
            status: "learning",
            seed: seed,
            showPopup: false
        }

    }

    componentDidMount() {
        this.onComponentUpdate(null, null, null)
    }

    componentWillUnmount() {
        this.context.problemID = "n/a"
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.problemID !== this.props.problemID) {
            this.selectProblem(this.props.problemID, this.context)
            return
        }
        this.onComponentUpdate(prevProps, prevState, snapshot)
    }

    onComponentUpdate(prevProps, prevState, snapshot){
        if (Boolean(this.state.currProblem?.id) && this.context.problemID !== this.state.currProblem.id) {
            this.context.problemID = this.state.currProblem.id
        }
    }

    selectProblem = (problemID, context) => {
        seed = Date.now().toString();
        context.debug = true;
        this.problemIndex = {
            problems: problemPool
        };
        this.completedProbs = new Set();
        this.lesson = null;

        let chosenProblem = null;
        const problemIDs = [];
        // Add each Q Matrix skill model attribute to each step
        for (const problem of this.problemIndex.problems) {
            problemIDs.push(problem.id)
            if (problem.id === problemID) {
                chosenProblem = problem;
            }
            for (let stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
                const step = problem.steps[stepIndex];
                step.knowledgeComponents = context.skillModel[step.id];
            }
        }
        context.problemID = problemID;
        context.problemIDs = problemIDs.sort(this.__compareProblemID);

        this.setState({
            currProblem: chosenProblem,
            status: "learning",
            seed: seed
        })
    }

    __compareProblemID = (a, b) => {
        var aNum = a.match(/\d+$/);
        if (aNum) {
            aNum = parseInt(aNum[0]);
        }

        var bNum = b.match(/\d+$/);
        if (bNum) {
            bNum = parseInt(bNum[0]);
        }

        var aName = a.match(/^[^0-9]+/);
        if (aName) {
            aName = aName[0];
        }

        var bName = b.match(/^[^0-9]+/);
        if (bName) {
            bName = bName[0];
        }

        if (aName !== bName) {
            return aName.localeCompare(bName);
        } else {
            return aNum - bNum;
        }
    }

    _nextProblem = (context, problemID) => {
        seed = Date.now().toString();
        this.setState({ seed: seed });
        this.props.saveProgress();
        var chosenProblem = null;

        for (var problem of this.problemIndex.problems) {
            // Calculate the mastery for this problem
            var probMastery = 1;
            var isRelevant = false;
            for (var step of problem.steps) {
                if (typeof step.knowledgeComponents === "undefined") {
                    continue;
                }
                for (var kc of step.knowledgeComponents) {
                    if (typeof context.bktParams[kc] === "undefined") {
                        console.log("BKT Parameter " + kc + " does not exist.");
                        continue;
                    }
                    // Multiply all the mastery priors
                    if (!(kc in context.bktParams)) {
                        console.log("Missing BKT parameter: " + kc);
                    }
                    probMastery *= context.bktParams[kc].probMastery;
                }
            }
            if (isRelevant) {
                problem.probMastery = probMastery;
            } else {
                problem.probMastery = null;
            }
        }

        chosenProblem = context.heuristic(this.problemIndex.problems, this.completedProbs);
        //console.log(Object.keys(context.bktParams).map((skill) => (context.bktParams[skill].probMastery <= this.lesson.learningObjectives[skill])));


        this.setState({ currProblem: chosenProblem, status: "learning" });
        console.log("Next problem: ", chosenProblem.id)
        return chosenProblem;
    }

    problemComplete = (context) => {
        this.completedProbs.add(this.state.currProblem.id);
        return this._nextProblem(context);
    }

    togglePopup = () => {
        this.setState((state) => ({ showPopup: !state.showPopup }));
    }

    getAdjacentProblemID = (offset) => {
        const problemIDs = this.context.problemIDs || [];
        const currentIndex = problemIDs.indexOf(this.state.currProblem?.id);
        return problemIDs[currentIndex + offset] || null;
    }

    navigateToDebugProblem = (problemID) => {
        if (problemID) {
            this.props.history.push(`/debug/${problemID}`);
        }
    }

    render() {
        const isMobile = isMobileWidth(this.props.width);
        const primaryBarHeight = isMobile ? 56 : 64;
        const secondaryBarHeight = isMobile ? 56 : 64;
        const previousProblemID = this.getAdjacentProblemID(-1);
        const nextProblemID = this.getAdjacentProblemID(1);

        return (
            <div style={{ backgroundColor: "#F6F6F6", minHeight: "100vh", paddingBottom: 20 }}>
                <AppBar position="fixed" style={{ backgroundColor: "#FFFFFF", color: "#344054", boxShadow: "0 1px 3px rgba(16, 24, 40, 0.12)" }}>
                    <Toolbar style={{ minHeight: primaryBarHeight, paddingLeft: isMobile ? 8 : 24, paddingRight: isMobile ? 8 : 24 }}>
                        <Grid container spacing={0} role={"navigation"} alignItems="center">
                            <Grid item xs={isMobile ? 6 : 4}>
                                <BrandLogoNav noLink={true}/>
                            </Grid>
                            {!isMobile && (
                                <Grid item xs={4}>
                                    <div style={{ textAlign: "center", fontSize: 14, fontWeight: 600, color: "#667085" }}>
                                        Content QA
                                    </div>
                                </Grid>
                            )}
                            <Grid item xs={isMobile ? 6 : 4}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                                    <div
                                        style={{
                                            color: "#344054",
                                            fontSize: isMobile ? 12 : 14,
                                            fontWeight: 600,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Debug mode
                                    </div>
                                    <IconButton aria-label="about" title="About OATutor" onClick={this.togglePopup} size="small">
                                        <HelpOutlineOutlinedIcon htmlColor="#344054" style={{ fontSize: isMobile ? 24 : 28 }} />
                                    </IconButton>
                                </div>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
                <div style={{ height: primaryBarHeight }} />

                <AppBar position="fixed" style={{ top: primaryBarHeight, backgroundColor: "#243B53", color: "#F8FAFC", boxShadow: "0 1px 3px rgba(16, 24, 40, 0.18)" }}>
                    <Toolbar style={{ minHeight: secondaryBarHeight, paddingLeft: isMobile ? 8 : 24, paddingRight: isMobile ? 8 : 24 }}>
                        <Grid container spacing={0} role={"secondary-navigation"} alignItems="center" style={{ position: "relative" }}>
                            <Grid item xs={isMobile ? 5 : 7}>
                                <div style={{ display: "flex", alignItems: "center", minWidth: 0, gap: isMobile ? 8 : 12 }}>
                                    <Button
                                        aria-label="Return to home"
                                        aria-roledescription="Return to the home page"
                                        role="link"
                                        variant="contained"
                                        color="primary"
                                        onClick={() => {
                                            this.props.history.push("/")
                                            this.setState({ status: "lessonSelection" })
                                        }}
                                        style={{
                                            width: isMobile ? 92 : 176,
                                            minWidth: isMobile ? 92 : 176,
                                            height: isMobile ? 38 : 48,
                                            flexShrink: 0,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Home
                                    </Button>
                                    {isMobile && <div style={{ width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.45)" }} />}
                                    <div
                                        style={{
                                            position: isMobile ? "static" : "absolute",
                                            left: isMobile ? undefined : "50%",
                                            transform: isMobile ? undefined : "translateX(-50%)",
                                            maxWidth: isMobile ? undefined : "45vw",
                                            minWidth: 0,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Debug Link: {this.props.problemID}
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={isMobile ? 7 : 5}>
                                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: isMobile ? 0 : 8 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        disabled={!previousProblemID}
                                        onClick={() => this.navigateToDebugProblem(previousProblemID)}
                                        style={{
                                            minWidth: isMobile ? 92 : 176,
                                            height: isMobile ? 38 : 48,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {isMobile ? "Previous" : "Previous Problem"}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        disabled={!nextProblemID}
                                        onClick={() => this.navigateToDebugProblem(nextProblemID)}
                                        style={{
                                            minWidth: isMobile ? 92 : 176,
                                            height: isMobile ? 38 : 48,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {isMobile ? "Next" : "Next Problem"}
                                    </Button>
                                </div>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
                <div style={{ height: secondaryBarHeight }} />

                <Popup isOpen={this.state.showPopup} onClose={this.togglePopup}>
                    <About />
                </Popup>

                {this.state.currProblem
                    ? <div
                        style={{
                            width: "100%",
                            maxWidth: 960,
                            margin: "0 auto",
                            padding: isMobile ? "0 8px" : "0 32px",
                            boxSizing: "border-box",
                        }}
                    >
                        <ProblemWrapper key={this.state.currProblem.id}
                                   problem={this.state.currProblem} problemComplete={this.problemComplete}
                                   lesson={this.lesson}
                                   seed={this.state.seed}
                                   showDebugNavigation={false}
                                   debugCenteredLayout/>
                    </div>
                    : <Box width={'100%'} textAlign={'center'} pt={8} pb={4}>
                        <Typography variant={'h3'}>Problem id <code>{this.props.problemID}</code> is not
                            valid!</Typography>
                    </Box>
                }
            </div>

        );
    }

}

export default withWidth()(withStyles(styles)(DebugPlatform));
