var gen = require('random-seed');

// Replace variables with their values in a string of text
function variabilize(text, variabilization) {
    if (typeof variabilization === 'undefined' || Object.keys(variabilization).length === 0) {
        return text;
    }
    Object.keys(variabilization).forEach(v => {
        if (variabilization[v].length !== 1) {
            console.log("[WARNING] - variable not properly chosen");
        }
        var replaceOption = variabilization[v][0];
        text = text.replace(new RegExp('@{' + v + '}', 'g'), replaceOption);
    });
    return text;
}

// Lock in variables chosen at Problem/Step/Hint. This method must be imported and called elsewhere
function chooseVariables(variabilization, seed) {
    if (typeof variabilization === 'undefined' || Object.keys(variabilization).length === 0) {
        return variabilization
    }
    var numOptions = 0;
    for (var v in variabilization) {
        numOptions = Math.max(numOptions, variabilization[v].length);
    }
    var rand1 = gen.create(seed);
    var chosen = rand1(numOptions)
    Object.keys(variabilization).forEach(v => {
        // Take r index of each variable, r is same across all vars.
        var replaceOption = variabilization[v][(chosen + 1) % variabilization[v].length];
        variabilization[v] = [replaceOption];
    });
    return variabilization;
}

export { variabilize, chooseVariables }
