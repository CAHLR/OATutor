function heuristic(problem, probMasterySum, totalProbs, lowestMasteryProblem, lowestMasteryLevel) {
  let averageMastery = probMasterySum / totalProbs;

  if (lowestMasteryLevel === null || averageMastery > lowestMasteryLevel) {
    lowestMasteryLevel = averageMastery;
    lowestMasteryProblem = problem;
  }
  return [lowestMasteryProblem, lowestMasteryLevel];
}

export {heuristic};