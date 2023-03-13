export default function update(model, isCorrect) {
    let numerator;
    let masteryAndGuess;
    if (isCorrect) {
        numerator = model.probMastery * (1 - model.probSlip);
        masteryAndGuess = (1 - model.probMastery) * model.probGuess;
    } else {
        numerator = model.probMastery * model.probSlip;
        masteryAndGuess = (1 - model.probMastery) * (1 - model.probGuess);
    }

    let probMasteryGivenObservation = numerator / (numerator + masteryAndGuess);
    model.probMastery = probMasteryGivenObservation + ((1 - probMasteryGivenObservation) * model.probTransit);
}
