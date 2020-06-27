import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ProblemCard from './ProblemCard'
import { animateScroll as scroll, scroller, Element } from "react-scroll";
import update from '../BKT/BKTBrains.js'
import renderText from '../ProblemLogic/renderText.js';
import styles from './commonStyles.js';

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
      steps: this.refreshSteps(props.problem)
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
      }
    }
  }

  clickNextProblem = () => {
    scroll.scrollToTop({ duration: 900, smooth: true });
    this.stepStates = {};
    this.numCorrect = 0;

    this.setState({ problem: this.props.problemComplete(this.context) },
      () => this.setState({
        steps: this.refreshSteps(this.props.problem)
      }));
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
        <center>
          <Button className={classes.button} size="small" onClick={this.clickNextProblem} disabled={this.numCorrect !== Object.keys(this.stepStates).length}>Next Problem</Button>
        </center>
      </div>

    );
  }
}

export default withStyles(styles)(Problem);