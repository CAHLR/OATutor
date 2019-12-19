function update(model, isCorrect) {
    let numerator;
    let masteryAndGuess;
    if (isCorrect) {
        numerator = model.probMastery * (1-model.probSlip);
        masteryAndGuess = (1 - model.probMastery) * model.probGuess;
    } else {
        numerator = model.probMastery * model.probSlip;
        masteryAndGuess = (1 - model.probMastery) * (1 - model.probGuess);
    }

    let probMasteryGivenObservation = numerator / (numerator + masteryAndGuess);
    model.probMastery = probMasteryGivenObservation + ((1 - probMasteryGivenObservation) * model.probTransit);
}

var knowledgeComponentModels = {
    "addition": {
        probMastery: 0.1,
        probTransit: 0.1,
        probSlip: 0.1,
        probGuess: 0.1
    },
    "short-multiplication": {
        probMastery: 0.05,
        probTransit: 0.1,
        probSlip: 0.1,
        probGuess: 0.1
    },
    "long-multiplication": {
        probMastery: 0.1,
        probTransit: 0.1,
        probSlip: 0.1,
        probGuess: 0.1
    }
};

export { update, knowledgeComponentModels };