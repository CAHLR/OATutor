import React from 'react';
import { AppBar, Toolbar } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Problem from "../ProblemLayout/Problem.js";
import LessonSelection from "../ProblemLayout/LessonSelection.js";
import {
  HashRouter as Router,
  NavLink
} from "react-router-dom";

import problemPool from '../ProblemPool/problemPool.js'
import { ThemeContext, lessonPlans, coursePlans } from '../config/config.js';

var seed = Date.now().toString();
console.log("Generated seed");

class DebugPlatform extends React.Component {
  static contextType = ThemeContext;

  constructor(props, context) {
    context.debug = true;
    super(props);
    this.problemIndex = {
      problems: problemPool
    };
    this.completedProbs = new Set();
    this.lesson = null;
    //console.log(this.props.lessonNum);

    var chosenProblem = null;
    var problemIDs = [];
    // Add each Q Matrix skill model attribute to each step
    for (var problem of this.problemIndex.problems) {
      problemIDs.push(problem.id)
      if (problem.id === this.props.problemID) {
        chosenProblem = problem;
      }
      for (var stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
        var step = problem.steps[stepIndex];
        step.knowledgeComponents = context.skillModel[step.id];
      }
    }
    context.problemIDs = problemIDs.sort(this.__compareProblemID)

    this.state = {
      currProblem: chosenProblem,
      status: "learning",
      seed: seed
    }
    
  }

  componentDidMount() {
    if (this.context.needRefresh) {
      this.context.needRefresh = false;
      window.location.reload();
    }
  }

  selectProblem = (problemID, context) => {
    seed = Date.now().toString();
    this.setState({ seed: seed }, () => console.log(seed));
    context.debug = true;
    this.problemIndex = {
      problems: problemPool
    };
    this.completedProbs = new Set();
    this.lesson = null;
    //console.log(this.props.lessonNum);

    var chosenProblem = null;
    var problemIDs = [];
    // Add each Q Matrix skill model attribute to each step
    for (var problem of this.problemIndex.problems) {
      problemIDs.push(problem.id)
      if (problem.id === this.props.problemID) {
        chosenProblem = problem;
      }
      for (var stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
        var step = problem.steps[stepIndex];
        step.knowledgeComponents = context.skillModel[step.id];
      }
    }
    context.problemIDs = problemIDs.sort(this.__compareProblemID);
    console.log(context.problemIDs)


    this.state = {
      currProblem: chosenProblem,
      status: "learning",
      seed: seed
    }
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

    if (aName != bName) {
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

  render() {
    return (
      <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20 }}>
        <AppBar position="static" >
          <Toolbar>
            <Grid container spacing={0}>
              <Grid item xs={3} key={1}> <div style={{ textAlign: 'left', paddingTop: "6px", paddingBototm: "6px" }}>Open ITS</div></Grid>
              <Grid item xs={6} key={2}>
              <div style={{ textAlign: 'center', textAlignVertical: 'center', paddingTop: "6px", paddingBototm: "6px" }}>
                {"Debug Mode: " + this.props.problemID}
                </div></Grid>
              <Grid item xs={3} key={3} >
              <div style={{ textAlign: 'right' }}>
                {true ?
                  <Router>
                    <NavLink activeClassName="active" className="link" to={"/"} type="menu" style={{ marginRight: '10px' }}>
                      <Button color="inherit" onClick={() => this.setState({ status: "lessonSelection" })}>Home</Button>
                    </NavLink>
                  </Router> : ""}
                  </div>
              </Grid>
            </Grid>

          </Toolbar>
        </AppBar>
          <Problem problem={this.state.currProblem} problemComplete={this.problemComplete} lesson={this.lesson} seed={this.state.seed} lessonNum={this.props.lessonNum} />

      </div>

    );
  }
}

export default DebugPlatform;
