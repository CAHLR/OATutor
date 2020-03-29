import problemPool from '../ProblemPool/problemPool.js'
import { skillModel } from '../config/config.js' 

const problemIndex = {
  problems: problemPool
};

const debug = true;

for (var problem of problemIndex.problems) {
  for (var stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
    var step = problem.steps[stepIndex];
    //step.id = problem.id + String.fromCharCode("a".charCodeAt(0) + stepIndex);
    step.knowledgeComponents = skillModel[step.id];
    if (debug) {
      step.stepAnswer = ["0"]
    }
  }
}



function nextProblem(heuristic, bktParams) {
  var chosenMasteryProblem = null;
  var chosenMasteryLevel = null;

  for (var problem of problemIndex.problems) {
    var probMasterySum = 0;
    var totalProbs = 0;
    for (var step of problem.steps) {
      console.log(step);
      for (var kc of step.knowledgeComponents) {
        probMasterySum += bktParams[kc].probMastery;
        totalProbs += 1;
      }
    }
  
    [chosenMasteryProblem, chosenMasteryLevel] = heuristic(problem, probMasterySum, totalProbs, chosenMasteryProblem, chosenMasteryLevel);
    console.log(chosenMasteryProblem)
  }

  return chosenMasteryProblem;
}

export { problemIndex, nextProblem }