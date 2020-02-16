import { problem as mul1 } from '../ProblemPool/mul1.js'
import { problem as add1 } from '../ProblemPool/add1.js'
import { problem as mul2 } from '../ProblemPool/mul2.js';
import { knowledgeComponentModels } from "../BKT/BKTBrains";
import skillModel from './skillModel.js' //Can change to different skillModels
import heuristic from './heuristic.js'

const problemIndex = {
  problems: [
    mul1,
    add1,
    mul2
  ]
};

for (var problem of problemIndex.problems) {
  for (var partIndex = 0; partIndex < problem.parts.length; partIndex++) {
    var part = problem.parts[partIndex];
    part.id = problem.id + String.fromCharCode("a".charCodeAt(0) + partIndex);
    part.knowledgeComponents = skillModel[part.id];
  }
}

console.log(problemIndex);

function nextProblem() {
  var chosenMasteryProblem = null;
  var chosenMasteryLevel = null;

  for (var problem of problemIndex.problems) {
    var probMasterySum = 0;
    var totalProbs = 0;
    for (var part of problem.parts) {
      for (var kc of part.knowledgeComponents) {
        // console.log(knowledgeComponentModels, kc, knowledgeComponentModels[kc])
        probMasterySum += knowledgeComponentModels[kc].probMastery;
        totalProbs += 1;
      }
    }

    [chosenMasteryProblem, chosenMasteryLevel] = heuristic(problem, probMasterySum, totalProbs, chosenMasteryProblem, chosenMasteryLevel);

  }

  return chosenMasteryProblem;
}

export { problemIndex, nextProblem }