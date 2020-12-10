import React from 'react';
import { AppBar, Toolbar } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Problem from "../ProblemLayout/Problem.js";
import LessonSelection from "../ProblemLayout/LessonSelection.js";
import {
  HashRouter as Router,
  NavLink
} from "react-router-dom";

import problemPool from '../ProblemPool/problemPool.js'
import { ThemeContext, lessonPlans } from '../config/config.js';

var seed = Date.now().toString();
console.log("Generated seed");

class Platform extends React.Component {
  static contextType = ThemeContext;

  constructor(props, context) {
    super(props);
    if (this.props.location.search.startsWith('?name=')) {
      var name = this.props.location.search.replace('?name=', '')
      context.studentName = name;
      console.log(context.studentName);
    }
    this.problemIndex = {
      problems: problemPool
    };
    this.completedProbs = new Set();
    this.lesson = null;
    console.log(this.props.lessonNum);

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
    if (this.props.lessonNum == null) {
      this.state = {
        currProblem: null,
        status: "lessonSelection",
        seed: seed
      }
    } else {
      this.state = {
        currProblem: null,
        status: "lessonSelection",
        seed: seed
      }
    }
  }

  componentDidMount() {
    if (this.props.lessonNum != null) {
      this.selectLesson(lessonPlans[parseInt(this.props.lessonNum)]);
      console.log("loaded lesson "+ this.props.lessonNum);
    }
  }

  selectLesson = (lesson, context) => {
    this.lesson = lesson;
    this.props.loadProgress();
    this.setState({
      currProblem: this._nextProblem(this.context ? this.context : context),
    }, () => {
      console.log(this.state.currProblem);
      console.log(this.lesson);
    });
  }

  _nextProblem = (context) => {
    seed = Date.now().toString();
    this.setState({seed: seed});
    this.props.saveProgress();
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
    return this._nextProblem(context);
  }

  render() {
    return (
      <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20 }}>
        <AppBar position="static" >
          <Toolbar>
            <div style={{ flex: 1 }}>Open ITS</div>
            <Router>
              <NavLink activeClassName="active" className="link" to={"/"} type="menu" style={{ marginRight: '10px' }}>
                <Button color="inherit" onClick={() => this.setState({ status: "lessonSelection" })}>Home</Button>
              </NavLink>
            </Router>


          </Toolbar>
        </AppBar>
        {this.state.status === "lessonSelection" ?
          <LessonSelection selectLesson={this.selectLesson} removeProgress={this.props.removeProgress} /> : ""}
        {this.state.status === "learning" ?
          <Problem problem={this.state.currProblem} problemComplete={this.problemComplete} lesson={this.lesson} seed={this.state.seed}/> : ""}
        {this.state.status === "exhausted" ?
          <center><h2>Thank you for learning with OpenITS. You have finished all problems.</h2></center> : ""}
        {this.state.status === "graduated" ?
          <center><h2>Thank you for learning with OpenITS. You have mastered all the skills for this session!</h2></center> : ""}
      </div>

    );
  }
}

export default Platform;
