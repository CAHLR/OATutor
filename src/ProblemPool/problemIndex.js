import {problem1} from './problem1'
import {problem2} from './problem2'
import {problem3} from './problem3'
import { knowledgeComponentModels } from "../BKT/BKTBrains";

const problemIndex = {
    problems: [
        problem1,
        problem2,
        problem3
    ]
};

function nextProblem() {
    var lowestMasteryProblem = null;
    var lowestMasteryLevel = null;

    for (var problem of problemIndex.problems) {
        var probMasterySum = 0;
        var totalProbs = 0;
        for (var part of problem.parts) {
            for (var kc of part.knowledgeComponents) {
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