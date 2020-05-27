import React from 'react';
import { AppBar, Toolbar } from '@material-ui/core';
import Problem from "../ProblemLayout/Problem.js";
import LessonSelection from "../ProblemLayout/LessonSelection.js";

import problemPool from '../ProblemPool/problemPool.js'
import { ThemeContext } from '../config/config.js';


class Platform extends React.Component {
  static contextType = ThemeContext;

  constructor(props, context) {
    super(props);
    this.problemIndex = {
      problems: problemPool
    };
    this.completedProbs = new Set();
    this.learningObjectives = null;

    // Add each Q Matrix skill model attribute to each step
    for (var problem of this.problemIndex.problems) {
      for (var stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
        var step = problem.steps[stepIndex];
        step.knowledgeComponents = context.skillModel[step.id];
        if (context.debug) { // Debug purposes set all step answers to 0
          step.stepAnswer = ["0"]
        }
      }
    }
    this.state = {
      currProblem: null,
      status: "lessonSelection"
    }
  }

  selectLesson = (learningObjectives) => {
    this.learningObjectives = learningObjectives;
    this.setState({
      currProblem: this._nextProblem(this.context),
      status: "learning"
    })
  }

  _nextProblem = (context) => {
    var chosenProblem = null;
    var chosenLevel = null;

    for (var problem of this.problemIndex.problems) {
      // Calculate the mastery for this problem
      var probMastery = 1;
      var isRelevant = false;
      for (var step of problem.steps) {
        for (var kc of step.knowledgeComponents) {
          if (context.bktParams[kc] === null) {
            console.log("BKT Parameter " + kc + " does not exist.");
          }
          if (kc in this.learningObjectives) {
            isRelevant = true;
          }
          // Multiply all the mastery priors
          probMastery *= context.bktParams[kc].probMastery;
        }
      }
      if (isRelevant) {
        [chosenProblem, chosenLevel] = context.heuristic(problem, probMastery, this.completedProbs, chosenProblem, chosenLevel);
      }
    }
    console.log(context.bktParams);

    // There exists a skill that has not yet been mastered (a True)
    // Note (number <= null) returns false
    if (chosenProblem == null) {
      // We have finished all the problems
      this.setState({ status: "exhausted" });
      return null;
    } else if (Object.keys(context.bktParams).some((skill) => (context.bktParams[skill].probMastery <= this.learningObjectives[skill]))) {
      this.setState({ currProblem: chosenProblem });
      return chosenProblem;
    } else {
      this.setState({ status: "graduated" });
      return null;
    }
  }

  problemComplete = (context) => {
    this.completedProbs.add(this.state.currProblem.id);
    return this._nextProblem(context);
  }

  render() {
    return (
      <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20 }}>
        <AppBar position="static" >
          <Toolbar>Open ITS</Toolbar>
        </AppBar>
        {this.state.status === "lessonSelection" ?
          <LessonSelection selectLesson={this.selectLesson} /> : ""}
        {this.state.status === "learning" ?
          <Problem problem={this.state.currProblem} problemComplete={this.problemComplete} /> : ""}
        {this.state.status === "exhausted" ?
          <center><h2>Thank you for learning with OpenITS. You have finished all problems.</h2></center> : ""}
        {this.state.status === "graduated" ?
          <center><h2>Thank you for learning with OpenITS. You have mastered all the skills for this session!</h2></center> : ""}
      </div>

    );
  }
}

export default Platform;
