import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ProblemCard from './ProblemCard'
import { animateScroll as scroll, scroller, Element } from "react-scroll";
import update from '../BKT/BKTBrains.js'
import { Sticky } from 'react-sticky';
import renderText from '../ProblemLogic/renderText.js';

import { ThemeContext } from '../config/config.js';

class Problem extends React.Component {
  static contextType = ThemeContext;

  constructor(props, context) {
    super(props);
    this.bktParams = context.bktParams;
    this.heuristic = context.heuristic;
    this.state = {
      problemData: props.nextProblem(this.heuristic, this.bktParams)
    }
    this.stepStates = {};
    this.numCorrect = 0;
    this.steps = this.updateProblemData();
  }

  updateProblemData = () => {
    return this.state.problemData.steps.map((step, index) => {
      this.stepStates[index] = null;
      return <Element name={index.toString()} key={Math.random()}>
        <ProblemCard step={step} index={index} answerMade={this.answerMade} />
      </Element>
    }
    );
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
      if (this.numCorrect === Object.keys(this.stepStates).length) {
        scroll.scrollToTop({ duration: 900, smooth: true });
        this.stepStates = {};
        this.numCorrect = 0;

        const problem = this.props.nextProblem(this.heuristic, this.bktParams);
        this.setState({ problemData: problem }, () => {
          this.steps = this.updateProblemData();
          this.setState({ updated: true });
        })

      } else {
        scroller.scrollTo((cardIndex + 1).toString(), {
          duration: 500,
          smooth: true,
          offset: -300 // Because sticky
        })
      }
    }
  }

  render() {
    const { classes } = this.props;
    return (

      <div>
        <div className="sticky" style={{ zIndex: 1000 }}>
          <Sticky>{({ style }) =>
            <div className={classes.prompt} style={style}>
              <div style={{ paddingTop: 15 }}><br /></div>
              <Card className={classes.titleCard}>
                <CardContent>
                  <h2 className={classes.stepHeader}>
                    {this.state.problemData.title}
                    <hr />
                  </h2>
                  <div className={classes.stepBody}>
                    {renderText(this.state.problemData.body, this.state.problemData.id)}
                  </div>
                </CardContent>
              </Card>
              <hr />

            </div>
          }</Sticky>
        </div>

        {this.steps}
      </div>

    );
  }
}

const styles = {
  prompt: {
    marginLeft: 0,
    marginRight: 50,
    marginTop: 20,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Titillium Web, sans-serif',
  },
  titleCard: {
    width: '50em',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingBottom: 0,
  },
  stepHeader: {
    fontSize: 25,
    marginTop: 0,
    marginLeft: 10
  },

  stepBody: {
    fontSize: 20,
    marginTop: 10,
    marginLeft: 10
  },
};

export default withStyles(styles)(Problem);