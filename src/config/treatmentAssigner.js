import { bktParams as bktParams1 } from './bktParams/bktParams1.js';
import { bktParams as bktParams2 } from './bktParams/bktParams2.js';
import { heuristic as lowestHeuristic } from './problemSelectHeuristics/problemSelectHeuristic1.js';
import { heuristic as highestHeuristic } from './problemSelectHeuristics/problemSelectHeuristic2.js';
import { hintPathway as hintPathway1 } from './hintPathways/hintPathway1.js';
import { hintPathway as hintPathway2 } from './hintPathways/hintPathway2.js';

function getTreatment(userID) {
    return userID % 2;
}

function getBKTParams(userID) {
    var treatment = getTreatment(userID);
    if (treatment === 0) {
        return bktParams1;
    } else {
        return bktParams2;
    }
}

function getProblemSelectHeuristic(userID) {
    var treatment = getTreatment(userID);
    console.log("treat", treatment);
    if (treatment === 0) {
        return lowestHeuristic;
    } else {
        return highestHeuristic;
    }
}

function getHintPathway(userID) {
    var treatment = getTreatment(userID);
    if (treatment === 0) {
        return hintPathway1;
    } else {
        return hintPathway2;
    }
}

export default function treatmentAssigner(type, userID) {
    if (type === "getTreatment") {
        return getTreatment(userID);
    } else if (type === "getBKTParams") {
        return getBKTParams(userID);
    } else if (type === "getProblemSelectHeuristic") {
        return getProblemSelectHeuristic(userID);
    } else if (type === "getHintPathway") {
        return getHintPathway(userID);
    } else { // Invalid request
        return null;
    }
}

