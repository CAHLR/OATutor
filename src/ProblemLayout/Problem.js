import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ProblemCard from './ProblemCard'
import Grid from '@material-ui/core/Grid';
import { animateScroll as scroll, scroller, Element } from "react-scroll";
import update from '../BKT/BKTBrains.js'
import { renderText, chooseVariables } from '../ProblemLogic/renderText.js';
import styles from './commonStyles.js';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import {
  HashRouter as Router,
  NavLink
} from "react-router-dom";

import { ThemeContext } from '../config/config.js';

class Problem extends React.Component {
  static contextType = ThemeContext;

  constructor(props, context) {
    super(props);
    this.bktParams = context.bktParams;
    this.heuristic = context.heuristic;
    this.stepStates = {};
    this.numCorrect = 0;

    const { lesson } = this.props;

    this.state = {
      problem: this.props.problem,
      steps: this.refreshSteps(props.problem),
      problemFinished: false,
      showFeedback: false,
      feedback: "",
      feedbackSubmitted: false,
      textbookName: lesson?.courseName.substring((lesson?.courseName || "").indexOf(":") + 1).trim() || ""
    }

    document["oats-meta-textbookName"] = this.state.textbookName
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.textbookName !== this.state.textbookName) {
      document["oats-meta-textbookName"] = this.state.textbookName
    }
  }

  componentDidMount() {
    document["oats-meta-courseName"] = this.props.lesson?.courseName || "";
  }

  componentWillUnmount() {
    document["oats-meta-courseName"] = "";
  }

  refreshSteps = (problem) => {
    if (problem == null) {
      return (<div></div>);
    }
    return problem.steps.map((step, index) => {
      this.stepStates[index] = null;
      return <Element name={index.toString()} key={Math.random()}>
        <ProblemCard problemID={problem.id} step={step} index={index} answerMade={this.answerMade}
                     seed={this.props.seed} problemVars={this.props.problem.variabilization}/>
      </Element>
    })
  }

  updateCanvas = (name, mastery, components, lessonNum) => {
    //console.log(name, mastery);
    if (name !== '') {
      fetch(this.context.middlewareURL + '/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "lis_person_name_full": name !== 'test' ? name : 'Test Student',
          "score": mastery.toString(),
          "components": components,
          "lessonNum": lessonNum
        })
      });
    }
  }

  answerMade = (cardIndex, kcArray, isCorrect) => {
    if (this.stepStates[cardIndex] === true) {
      return
    }

    if (this.stepStates[cardIndex] == null) {
      if (kcArray == null) {
        kcArray = []
      }
      for (const kc of kcArray) {
        //console.log(kc);
        update(this.bktParams[kc], isCorrect);
        //console.log(this.bktParams[kc].probMastery);
      }
    }

    if (!this.context.debug) {
      var objectives = Object.keys(this.props.lesson.learningObjectives);
      objectives.unshift(0);
      var score = objectives.reduce((x, y) => {
        return x + this.bktParams[y].probMastery
      });
      score /= objectives.length - 1;
      //console.log(this.context.studentName + " " + score);
      this.props.displayMastery(score);

      var relevantKc = {}
      Object.keys(this.props.lesson.learningObjectives).map(x => {
        relevantKc[x] = this.bktParams[x].probMastery
      });
      try {
        this.updateCanvas(this.context.studentName, score, relevantKc, this.props.lessonNum);
      } catch {
        console.log("Error sending scores to canvas.");
      }
    }
    this.stepStates[cardIndex] = isCorrect;

    if (isCorrect) {
      this.numCorrect += 1;
      if (this.numCorrect !== Object.keys(this.stepStates).length) {
        scroller.scrollTo((cardIndex + 1).toString(), {
          duration: 500,
          smooth: true,
          offset: -100
        })
      } else {
        this.setState({ problemFinished: true });
      }
    }
  }

  clickNextProblem = () => {
    scroll.scrollToTop({ duration: 900, smooth: true });
    this.stepStates = {};
    this.numCorrect = 0;

    this.setState({ problem: this.props.problemComplete(this.context) },
      () => this.setState({
        steps: this.refreshSteps(this.props.problem),
        problemFinished: false,
        feedback: "",
        feedbackSubmitted: false
      }));
  }

  submitFeedback = () => {
    this.context.firebase.submitFeedback(this.state.problem.id, this.state.feedback, this.state.problemFinished, chooseVariables(this.props.problem.variabilization, this.props.seed), this.context.studentName);
    this.setState({ feedback: "", feedbackSubmitted: true });
  }

  toggleFeedback = () => {
    scroll.scrollToBottom({ duration: 900, smooth: true });
    this.setState(prevState => ({ showFeedback: !prevState.showFeedback }))
  }

  _getNextDebug = (offset) => {
    return this.context.problemIDs[this.context.problemIDs.indexOf(this.state.problem.id) + offset] || "/"
  }


  render() {
    const { classes, lesson } = this.props;
    if (this.state.problem == null) {
      return (<div></div>);
    }

    const { textbookName } = this.state

    return (
      <div>
        <div className={classes.prompt}>
          <Card className={classes.titleCard}>
            <CardContent>
              <h2 className={classes.problemHeader}>
                {renderText(this.props.problem.title, this.props.problem.id, chooseVariables(this.props.problem.variabilization, this.props.seed))}
                <hr/>
              </h2>
              <div className={classes.problemBody}>
                {renderText(this.props.problem.body, this.props.problem.id, chooseVariables(this.props.problem.variabilization, this.props.seed))}
              </div>
            </CardContent>
          </Card>
          <hr/>
        </div>
        {this.state.steps}
        <div width="100%">
          {this.context.debug ?
            <Grid container spacing={0}>
              <Grid item xs={2} key={0}/>
              <Grid item xs={2} key={1}>
                <NavLink activeClassName="active" className="link" to={this._getNextDebug(-1)} type="menu"
                         style={{ marginRight: '10px' }}>
                  <Button className={classes.button} style={{ width: "100%" }} size="small"
                          onClick={() => this.context.needRefresh = true}>Previous Problem</Button>
                </NavLink>
              </Grid>
              <Grid item xs={4} key={2}/>
              <Grid item xs={2} key={3}>
                <NavLink activeClassName="active" className="link" to={this._getNextDebug(1)} type="menu"
                         style={{ marginRight: '10px' }}>
                  <Button className={classes.button} style={{ width: "100%" }} size="small"
                          onClick={() => this.context.needRefresh = true}>Next Problem</Button>
                </NavLink>
              </Grid>
              <Grid item xs={2} key={4}/>
            </Grid>
            :
            <Grid container spacing={0}>
              <Grid item xs={3} sm={3} md={5} key={1}/>
              <Grid item xs={6} sm={6} md={2} key={2}>
                <Button className={classes.button} style={{ width: "100%" }} size="small"
                        onClick={this.clickNextProblem}
                        disabled={!(this.state.problemFinished || this.state.feedbackSubmitted)}>Next Problem</Button>
              </Grid>
              <Grid item xs={3} sm={3} md={5} key={3}/>
            </Grid>}
        </div>

        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <div style={{ marginLeft: 20, fontSize: 12 }}>
            {this.state.problem.oer && this.state.problem.oer.includes("openstax") && textbookName && textbookName.length > 0 ?
              <div>
                "{this.state.problem.title}" is a derivative of&nbsp;
                <a href="https://openstax.org/" target="_blank" rel="noreferrer">
                  "{textbookName}"
                </a>
                &nbsp;by OpenStax, used under&nbsp;
                <a href="https://creativecommons.org/licenses/by/4.0" target="_blank" rel="noreferrer">CC BY 4.0</a>
              </div>
              : ""}
          </div>
          <div style={{ display: "flex", flexDirection: "row-reverse", flexGrow: 1, marginRight: 20 }}>
            <IconButton aria-label="report" onClick={this.toggleFeedback}>
              <img src={`${process.env.PUBLIC_URL}/static/images/icons/report_problem.png`} title="Report problem"
                   alt="report" width="32px"/>
            </IconButton>
          </div>

        </div>
        {this.state.showFeedback ? <div className="Feedback">
          <center><h1>Feedback</h1></center>
          <div className={classes.textBox}>
            <div className={classes.textBoxHeader}>
              <center>{this.state.feedbackSubmitted ? "Thank you for your feedback!" : "Feel free to submit feedback about this problem if you encounter any bugs. Submit feedback for all parts of the problem at once."}</center>
            </div>
            {this.state.feedbackSubmitted ? <br/> : <Grid container spacing={0}>
              <Grid item xs={1} sm={2} md={2} key={1}/>
              <Grid item xs={10} sm={8} md={8} key={2}>
                <TextField
                  id="outlined-multiline-flexible"
                  label="Response"
                  multiline
                  fullWidth
                  rows="6"
                  rowsMax="20"
                  value={this.state.feedback}
                  onChange={(event) => this.setState({ feedback: event.target.value })}
                  className={classes.textField}
                  margin="normal"
                  variant="outlined"
                /> </Grid>
              <Grid item xs={1} sm={2} md={2} key={3}/>
            </Grid>}
          </div>
          {this.state.feedbackSubmitted ? "" :
            <div className="submitFeedback">
              <Grid container spacing={0}>
                <Grid item xs={3} sm={3} md={5} key={1}/>
                <Grid item xs={6} sm={6} md={2} key={2}>
                  <Button className={classes.button} style={{ width: "100%" }} size="small"
                          onClick={this.submitFeedback} disabled={this.state.feedback === ""}>Submit</Button>
                </Grid>
                <Grid item xs={3} sm={3} md={5} key={3}/>
              </Grid>
              <br/></div>}


        </div> : ""}

      </div>

    );
  }
}

export default withStyles(styles)(Problem);
