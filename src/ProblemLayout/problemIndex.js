import { problem as problem1 } from '../ProblemPool/problem1.js'
import { problem as problem2 } from '../ProblemPool/problem2.js'
import { problem as problem3 } from '../ProblemPool/problem3.js';
import { knowledgeComponentModels } from "../BKT/BKTBrains";
import skillModel from './skillModel.js'

const problemIndex = {
    problems: [
        problem1,
        problem2,
        problem3
    ]
};

for (var p in problemIndex.problems) {
    var problem = problemIndex.problems[p];
    for (var partIndex = 0; partIndex < problem.parts.length; partIndex++) {
        var part = problem.parts[partIndex];
        part.knowledgeComponents = skillModel[problem.id][partIndex];
    }
}

function nextProblem() {
    var lowestMasteryProblem = null;
    var lowestMasteryLevel = null;

    for (var problem of problemIndex.problems) {
        var probMasterySum = 0;
        var totalProbs = 0;
        for (var part of problem.parts) {
            for (var kc of part.knowledgeComponents) {
                console.log(knowledgeComponentModels, kc, knowledgeComponentModels[kc])
                probMasterySum += knowledgeComponentModels[kc].probMastery;
                totalProbs += 1;
            }
        }

        let averageMastery = probMasterySum / totalProbs;

        if (lowestMasteryLevel === null || averageMastery < lowestMasteryLevel) {
            lowestMasteryLevel = averageMastery;
            lowestMasteryProblem = problem;
        }
    }

    return lowestMasteryProblem;
}

export { problemIndex, nextProblem }