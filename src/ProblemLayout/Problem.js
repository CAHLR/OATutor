import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ProblemCard from './ProblemCard'
import Grid from '@material-ui/core/Grid';
import { animateScroll as scroll, scroller, Element } from "react-scroll";
import update from '../BKT/BKTBrains.js'
import renderText from '../ProblemLogic/renderText.js';
import styles from './commonStyles.js';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import { ThemeContext } from '../config/config.js';

class Problem extends React.Component {
  static contextType = ThemeContext;

  constructor(props, context) {
    super(props);
    this.bktParams = context.bktParams;
    this.heuristic = context.heuristic;
    this.stepStates = {};
    this.numCorrect = 0;
    this.state = {
      problem: this.props.problem,
      steps: this.refreshSteps(props.problem),
      problemFinished: false,
      showFeedback: false,
      feedback: "",
      feedbackSubmitted: false
    }
  }

  refreshSteps = (problem) => {
    if (problem === null) {
      return (<div></div>);
    }
    return problem.steps.map((step, index) => {
      this.stepStates[index] = null;
      return <Element name={index.toString()} key={Math.random()}>
        <ProblemCard problemID={problem.id} step={step} index={index} answerMade={this.answerMade} />
      </Element>
    })
  }

  answerMade = (cardIndex, kcArray, isCorrect) => {
    if (this.stepStates[cardIndex] === true) { return }

    if (this.stepStates[cardIndex] === null) {
      for (var kc of kcArray) {
        console.log(kc);
        update(this.bktParams[kc], isCorrect);
        console.log(this.bktParams[kc].probMastery);
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
    console.log(this.state.feedback);
    this.context.firebase.submitFeedback(this.state.problem.id, this.state.feedback, this.state.problemFinished);
    this.setState({feedback: "", feedbackSubmitted: true});
  }

  toggleFeedback = () => {
    scroll.scrollToBottom({ duration: 900, smooth: true });
    this.setState( prevState => ({showFeedback: !prevState.showFeedback}))
  }

  render() {
    const { classes } = this.props;
    if (this.state.problem === null) {
      return (<div></div>);
    }
    return (
      <div>
        <div className={classes.prompt} >
          <Card className={classes.titleCard}>
            <CardContent>
              <h2 className={classes.problemStepHeader}>
                {this.props.problem.title}
                <hr />
              </h2>
              <div className={classes.problemStepBody}>
                {renderText(this.props.problem.body, this.props.problem.id)}
              </div>
            </CardContent>
          </Card>
          <hr />
        </div>
        {this.state.steps}
        <div width="100%">
          <Grid container spacing={0}>
            <Grid item xs={3} sm={3} md={5} key={1} />
            <Grid item xs={6} sm={6} md={2} key={2}>
              <Button className={classes.button} style={{ width: "100%" }} size="small" onClick={this.clickNextProblem} disabled={!this.state.problemFinished}>Next Problem</Button>
            </Grid>
            <Grid item xs={3} sm={3} md={5} key={3} />
          </Grid>
        </div>

        <div style={{ display: "flex", flexDirection: "row-reverse", justifyContent: "right", marginRight: "20px" }}>
          <IconButton aria-label="report" onClick={this.toggleFeedback}>
            <img src={require('./report_problem.png')} title="Report problem" alt="report" width="32px" />
          </IconButton>

        </div>
        {this.state.showFeedback ? <div className="Feedback">
          <center><h1>Feedback</h1></center>
          <div className={classes.textBox}>
            <div className={classes.textBoxHeader}>
              <center>{this.state.feedbackSubmitted ? "Thank you for your feedback!" : "Feel free to submit feedback about this problem if you encounter any bugs. Submit feedback for all parts of the problem at once."}</center>
            </div>
            {this.state.feedbackSubmitted ? <br /> : <Grid container spacing={0}>
              <Grid item xs={1} sm={2} md={2} key={1} />
              <Grid item xs={10} sm={8} md={8} key={2}>
                <TextField
                  id="outlined-multiline-flexible"
                  label="Response"
                  multiline
                  fullWidth
                  rows="6"
                  rowsMax="20"
                  value={this.state.feedback}
                  onChange={(event) => this.setState({feedback: event.target.value})}
                  className={classes.textField}
                  margin="normal"
                  variant="outlined"
                /> </Grid>
              <Grid item xs={1} sm={2} md={2} key={3} />
            </Grid>}
          </div>
          {this.state.feedbackSubmitted ? "" :
          <div className="submitFeedback"> 
          <Grid container spacing={0}>
            <Grid item xs={3} sm={3} md={5} key={1} />
            <Grid item xs={6} sm={6} md={2} key={2}>
              <Button className={classes.button} style={{ width: "100%" }} size="small" onClick={this.submitFeedback} disabled={this.state.feedback === ""}>Submit</Button>
            </Grid>
            <Grid item xs={3} sm={3} md={5} key={3} />
          </Grid>
          <br /> </div>}
          

        </div> : ""}

      </div>

    );
  }
}

export default withStyles(styles)(Problem);