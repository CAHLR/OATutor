export default function update(model, isCorrect) {
    let numerator, masteryAndGuess, probMasteryGivenObservation;

    if (isCorrect) {
        numerator = model.probMastery * (1 - model.probSlip);
        masteryAndGuess = (1 - model.probMastery) * model.probGuess;
    } else {
        numerator = model.probMastery * model.probSlip;
        masteryAndGuess = (1 - model.probMastery) * (1 - model.probGuess);
    }

    probMasteryGivenObservation = numerator / (numerator + masteryAndGuess);

    let adjustment = (probMasteryGivenObservation - model.probMastery) * model.probTransit;

    model.probMastery += adjustment;

    model.probMastery = Math.max(0, Math.min(1, model.probMastery));
}
