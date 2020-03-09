import problemPool from '../ProblemPool/problemPool.js'
import { knowledgeComponentModels } from "../BKT/BKTBrains";
import skillModel from './skillModel.js' //Can change to different skillModels
import heuristic from './heuristic.js'

const problemIndex = {
  problems: problemPool
};
console.log(problemIndex)

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

console.log(problemIndex);

function nextProblem() {
  var chosenMasteryProblem = null;
  var chosenMasteryLevel = null;

  for (var problem of problemIndex.problems) {
    var probMasterySum = 0;
    var totalProbs = 0;
    for (var step of problem.steps) {
      console.log(step);
      for (var kc of step.knowledgeComponents) {
        // console.log(knowledgeComponentModels, kc, knowledgeComponentModels[kc])
        probMasterySum += knowledgeComponentModels[kc].probMastery;
        totalProbs += 1;
      }
    }
  
    [chosenMasteryProblem, chosenMasteryLevel] = heuristic(problem, probMasterySum, totalProbs, chosenMasteryProblem, chosenMasteryLevel);
    console.log(chosenMasteryProblem)
  }

  return chosenMasteryProblem;
}

export { problemIndex, nextProblem }