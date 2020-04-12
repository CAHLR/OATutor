import { bktParams as bktParams1 } from './bktParams/bktParams1.js';
import { bktParams as bktParams2 } from './bktParams/bktParams2.js';
import { heuristic as lowestHeuristic } from './problemSelectHeuristics/problemSelectHeuristic1.js';
import { heuristic as highestHeuristic } from './problemSelectHeuristics/problemSelectHeuristic2.js';
import { hintPathway as hintPathway1 } from './hintPathways/hintPathway1.js';
import { hintPathway as hintPathway2 } from './hintPathways/hintPathway2.js';

function getTreatment(userID) {
    return userID % 2;
}

var bktParams = {
    bktParams1: bktParams1,
    bktParams2: bktParams2
}

var heuristic = {
    lowestHeuristic: lowestHeuristic,
    highestHeuristic: highestHeuristic,
}

var hintPathway = {
    hintPathway1: hintPathway1,
    hintPathway2: hintPathway2
}

export { 
    getTreatment, 
    bktParams,
    heuristic,
    hintPathway
}