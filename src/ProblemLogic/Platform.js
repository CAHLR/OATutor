import React from 'react';
import { AppBar, Toolbar } from '@material-ui/core';
import Problem from "../ProblemLayout/Problem";

import problemPool from '../ProblemPool/problemPool.js'
import { ThemeContext } from '../config/config.js';


class Platform extends React.Component {
  static contextType = ThemeContext;

  constructor(props, context) {
    super(props);
    this.problemIndex = {
      problems: problemPool
    };

    for (var problem of this.problemIndex.problems) {
      for (var stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
        var step = problem.steps[stepIndex];
        step.knowledgeComponents = context.skillModel[step.id];
        if (context.debug) {
          step.stepAnswer = ["0"]
        }
      }
    }
  }

  nextProblem = () => {
    var chosenMasteryProblem = null;
    var chosenMasteryLevel = null;

    for (var problem of this.problemIndex.problems) {
      var probMasterySum = 0;
      var totalProbs = 0;
      for (var step of problem.steps) {
        //console.log(step);
        for (var kc of step.knowledgeComponents) {
          probMasterySum += this.context.bktParams[kc].probMastery;
          totalProbs += 1;
        }
      }

      [chosenMasteryProblem, chosenMasteryLevel] = this.context.heuristic(problem, probMasterySum, totalProbs, chosenMasteryProblem, chosenMasteryLevel);
      //console.log(chosenMasteryProblem)
    }

    return chosenMasteryProblem;
  }

  render() {
    return (
      <div style={{ backgroundColor: "#F6F6F6", paddingBottom: 20 }}>
        <AppBar position="static" >
          <Toolbar>Open ITS</Toolbar>
        </AppBar>
        <Problem nextProblem={this.nextProblem} />
      </div>
      
    );
  }
}

export default Platform;
