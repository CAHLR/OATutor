function heuristic(currProblem, currLevel, completedProbs, chosenProblem, chosenLevel) {
  // Already completed this problem
  if (completedProbs.has(currProblem.id )) {
    return [chosenProblem, chosenLevel];
  }

  if (chosenLevel === null || currLevel > chosenLevel) {
    chosenLevel = currLevel;
    chosenProblem = currProblem;
  }
  return [chosenProblem, chosenLevel];
}

export {heuristic};