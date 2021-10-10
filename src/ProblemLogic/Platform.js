import React from 'react';
import { AppBar, Toolbar } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Problem from "../ProblemLayout/Problem.js";
import LessonSelection from "../ProblemLayout/LessonSelection.js";
import {
  HashRouter as Router, Link,
  NavLink
} from "react-router-dom";

import problemPool from '../ProblemPool/problemPool.js'
import { ThemeContext, lessonPlans, coursePlans } from '../config/config.js';

var seed = Date.now().toString();
console.log("Generated seed");

class Platform extends React.Component {
  static contextType = ThemeContext;

  constructor(props, context) {
    super(props);
    if (this.props.location.search.startsWith('?lis_person_name_full=')) {
      var name = this.props.location.search.replace('?lis_person_name_full=', '')
      context.studentName = name;
      //console.log(context.studentName);
    }
    this.problemIndex = {
      problems: problemPool
    };
    this.completedProbs = new Set();
    this.lesson = null;
    //console.log(this.props.lessonNum);

    this.studentNameDisplay = context.studentName ? (context.studentName + " : ") : "Not logged in : ";

    // Add each Q Matrix skill model attribute to each step
    for (var problem of this.problemIndex.problems) {
      for (var stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
        var step = problem.steps[stepIndex];
        step.knowledgeComponents = context.skillModel[step.id];
      }
    }
    if (this.props.lessonNum == null) {
      this.state = {
        currProblem: null,
        status: "courseSelection",
        seed: seed
      }
    } else {
      this.state = {
        currProblem: null,
        status: "courseSelection",
        seed: seed
      }
    }
  }

  componentDidMount() {
    this._isMounted = true
    if (this.props.lessonNum != null) {
      this.selectLesson(lessonPlans[parseInt(this.props.lessonNum)]).then(_ => {
        console.log("loaded lesson " + this.props.lessonNum, this.lesson);
      });
    } else if (this.props.courseNum != null) {
      this.selectCourse(coursePlans[parseInt(this.props.courseNum)]);
    }
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  selectLesson = async (lesson, context) => {
    this.lesson = lesson;
    await this.props.loadProgress();
    if(!this._isMounted){
      return
    }
    this.setState({
      currProblem: this._nextProblem(this.context ? this.context : context),
    }, () => {
      //console.log(this.state.currProblem);
      //console.log(this.lesson);
    });
  }

  selectCourse = (course, context) => {
    this.course = course;
    this.setState({
      status: "lessonSelection",
    });
  }

  _nextProblem = (context) => {
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

    var objectives = Object.keys(this.lesson.learningObjectives);
    objectives.unshift(0);
    console.debug('objectives', objectives)
    var score = objectives.reduce((x, y) => {
      return x + context.bktParams[y].probMastery
    });
    score /= objectives.length - 1;
    this.displayMastery(score);
    //console.log(Object.keys(context.bktParams).map((skill) => (context.bktParams[skill].probMastery <= this.lesson.learningObjectives[skill])));

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
      console.log("Next problem: ", chosenProblem.id)
      return chosenProblem;
    }
  }

  problemComplete = (context) => {
    this.completedProbs.add(this.state.currProblem.id);
    return this._nextProblem(context);
  }

  displayMastery = (mastery) => { //TODO fix
    var MASTERED = 0.85;
    var score = Math.min(mastery / (MASTERED), 1.0);
    this.setState({ mastery: score });
    this.props.saveProgress();
  }

  render() {
    return (
      <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20 }}>
        <AppBar position="static">
          <Toolbar>
            <Grid container spacing={0}>
              <Grid item xs={3} key={1}>
                <Link to={"/"} style={{ color: 'unset', textDecoration: 'unset' }}>
                  <div style={{ textAlign: 'left', paddingTop: "3px" }}>Open ITS (v{this.context.siteVersion})</div>
                </Link>
              </Grid>
              <Grid item xs={6} key={2}>
                <div style={{ textAlign: 'center', textAlignVertical: 'center', paddingTop: "3px" }}>
                  {lessonPlans[parseInt(this.props.lessonNum)] != null ? lessonPlans[parseInt(this.props.lessonNum)].name + " " + lessonPlans[parseInt(this.props.lessonNum)].topics : ""}
                </div>
              </Grid>
              <Grid item xs={3} key={3}>
                <div style={{ textAlign: 'right', paddingTop: "3px" }}>
                  {this.state.status !== "courseSelection" && this.state.status !== "lessonSelection" ? this.studentNameDisplay + "Mastery: " + Math.round(this.state.mastery * 100) + "%" : ""}
                  {false ?
                    <Router>
                      <NavLink activeClassName="active" className="link" to={"/"} type="menu"
                               style={{ marginRight: '10px' }}>
                        <Button color="inherit"
                                onClick={() => this.setState({ status: "lessonSelection" })}>Home</Button>
                      </NavLink>
                    </Router> : ""}
                </div>
              </Grid>
            </Grid>

          </Toolbar>
        </AppBar>
        {this.state.status === "courseSelection" ?
          <LessonSelection selectLesson={this.selectLesson} selectCourse={this.selectCourse}
                           removeProgress={this.props.removeProgress}/> : ""}
        {this.state.status === "lessonSelection" ?
          <LessonSelection selectLesson={this.selectLesson} removeProgress={this.props.removeProgress}
                           courseNum={this.props.courseNum}/> : ""}
        {this.state.status === "learning" ?
          <Problem problem={this.state.currProblem} problemComplete={this.problemComplete} lesson={this.lesson}
                   seed={this.state.seed} lessonNum={this.props.lessonNum} displayMastery={this.displayMastery}/> : ""}
        {this.state.status === "exhausted" ?
          <center><h2>Thank you for learning with OpenITS. You have finished all problems.</h2></center> : ""}
        {this.state.status === "graduated" ?
          <center><h2>Thank you for learning with OpenITS. You have mastered all the skills for this session!</h2>
          </center> : ""}
      </div>

    );
  }
}

export default Platform;
