import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ProblemCard from './ProblemCard'
import { animateScroll as scroll, scroller, Element } from "react-scroll";
import { update, knowledgeComponentModels } from '../BKT/BKTBrains'
import Latex from 'react-latex';
import { Sticky } from 'react-sticky';

class Problem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      problemData: props.nextProblem()
    }
    this.partStates = {};
    this.numCorrect = 0;
    this.parts = this.updateProblemData();
  }

  updateProblemData = () => {
    return this.state.problemData.parts.map((step, index) => {
      this.partStates[index] = null;
      return <Element name={index.toString()} key={Math.random()}>
        <ProblemCard step={step} index={index} answerMade={this.answerMade} firebase={this.props.firebase} logData={this.props.logData} />
      </Element>
    }
    );
  }

  answerMade = (cardIndex, kcArray, isCorrect) => {
    if (this.partStates[cardIndex] === true) { return }
    this.partStates[cardIndex] = isCorrect;

    for (var kc of kcArray) {
      console.log(kc);
      update(knowledgeComponentModels[kc], isCorrect);
      console.log(knowledgeComponentModels[kc].probMastery);
    }

    if (isCorrect) {
      this.numCorrect += 1;
      if (this.numCorrect === Object.keys(this.partStates).length) {
        scroll.scrollToTop({ duration: 900 });
        this.partStates = {};
        this.numCorrect = 0;

        const problem = this.props.nextProblem();
        this.setState({ problemData: problem }, () => {
          this.parts = this.updateProblemData();
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
          <div class="sticky" style = {{zIndex: 1000}}>
          <Sticky>{({ style }) =>
            <div className={classes.prompt} style={style}>
              <div style={{paddingTop: 15}}><br/></div>
              <Card className={classes.titleCard}>
                <CardContent>
                  <h2 className={classes.partHeader}>
                    {this.state.problemData.title}
                    <hr />
                  </h2>


                  <div className={classes.partBody}>
                    <Latex>
                      {this.state.problemData.body}
                    </Latex>
                  </div>
                  <br />
                </CardContent>
              </Card>
              <hr />

            </div>
          }</Sticky>
          </div>
        
        {this.parts}
      </div>

    );
  }
}

const styles = {
  prompt: {
    marginLeft: 50,
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
    paddingBottom: 0
  },
  partHeader: {
    fontSize: 25,
    marginTop: 0,
    marginLeft: 10
  },

  partBody: {
    fontSize: 20,
    marginTop: 10,
    marginLeft: 10
  },
};

export default withStyles(styles)(Problem);