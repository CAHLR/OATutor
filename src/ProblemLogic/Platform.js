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
    this.lesson = null;

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

  selectLesson = (lesson) => {
    this.lesson = lesson;
    var progress = this.props.loadProgress();
    console.log(progress);
    if (progress && progress[lesson.id]) {
      this.context.bktParams = progress[lesson.id].mastery;
      this.completedProbs = new Set(progress[lesson.id].completedProblems);
      console.log("Successfully loaded progress.");
      console.log(this.context.bktParams);
      console.log(this.completedProbs);
    }
   
    this.setState({
      currProblem: this._nextProblem(this.context),
    })
  }

  _nextProblem = (context) => {
    this.props.saveProgress(this.lesson, context.bktParams, this.completedProbs);
    var chosenProblem = null;

    for (var problem of this.problemIndex.problems) {
      // Calculate the mastery for this problem
      var probMastery = 1;
      var isRelevant = false;
      for (var step of problem.steps) {
        for (var kc of step.knowledgeComponents) {
          if (context.bktParams[kc] === null) {
            console.log("BKT Parameter " + kc + " does not exist.");
          }
          if (kc in this.lesson.learningObjectives) {
            isRelevant = true;
          }
          // Multiply all the mastery priors
          probMastery *= context.bktParams[kc].probMastery;
        }
      }
      if (isRelevant) {
        problem.probMastery = probMastery;
      }
    }
    
    chosenProblem = context.heuristic(this.problemIndex.problems, this.completedProbs);
    console.log(context.bktParams);
    console.log(Object.keys(context.bktParams).map((skill) => (context.bktParams[skill].probMastery <= this.lesson.learningObjectives[skill])));

    // There exists a skill that has not yet been mastered (a True)
    // Note (number <= null) returns false
    if (!(Object.keys(context.bktParams).some((skill) => (context.bktParams[skill].probMastery <= this.lesson.learningObjectives[skill])))) {
      this.setState({ status: "graduated" });
      console.log("Graduated");
      return null;
    } else if (chosenProblem == null) {
      // We have finished all the problems
      if (this.lesson && !this.lesson.allowRecycle) {
        // If we do not allow problem recycle then we have exhausted the pool
        this.setState({ status: "exhausted" });
        return null;
      } else {
        this.completedProbs = new Set();
      }
    } else {
      this.setState({ currProblem: chosenProblem, status: "learning" });
      return chosenProblem;
    }
  }

  problemComplete = (context) => {
    this.completedProbs.add(this.state.currProblem.id);
    console.log(this.completedProbs);
    return this._nextProblem(context);
  }

  render() {
    return (
      <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20 }}>
        <AppBar position="static" >
          <Toolbar>Open ITS</Toolbar>
        </AppBar>
        {this.state.status === "lessonSelection" ?
          <LessonSelection selectLesson={this.selectLesson} removeProgress={this.props.removeProgress}/> : ""}
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
