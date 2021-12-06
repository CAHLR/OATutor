import { variabilize } from './variabilize.js';

const KAS = require('../kas.js');

// attempt = student answer, actual = [ans1, ans2]
function _equality(attempt, actual) {
    const parsedAttempt = attempt.replace(/\s+/g, '').replace(/\\left/g, '').replace(/\\right/g, '');
    return actual.some((stepAns) => {
        const parsedStepAns = stepAns.replace(/\s+/g, '').replace(/\\left/g, '').replace(/\\right/g, '');
        //console.log("parsedAttempt: " + parsedAttempt + " parsedStepAns: " + parsedStepAns);
        return (parsedAttempt === parsedStepAns)
    });
}

// attempt = student answer, actual = [ans1, ans2]
function _parseEquality(attempt, actual) {
    //console.log("PARSED: " + attempt.print());
    //console.log("ANSWER: " + actual[0].print());
    return actual.some((stepAns) => KAS.compare(attempt, stepAns).equal);
}

// Round to precision number of decimal places
function round(num, precision) {
    if (precision != null) {
        return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
    } else {
        return num;
    }
}

function checkAnswer(attempt, actual, answerType, precision, variabilization) {
    let parsed = attempt.replace(/\s+/g, '');
    if (variabilization) {
        actual = actual.map((actualAns) => variabilize(actualAns, variabilization));
    }
    //console.log(actual);
    let correctAnswer = false;

    try {
        if (parsed === "") {
            return [parsed, false];
        } else if (answerType === "arithmetic") {
            // checks if anticipated answer is a matrix
            if (/\\begin{[a-zA-Z]?matrix}/.test(actual)) {
                console.debug(`attempt: ${attempt} vs. actual:`, actual)
                const studentMatrix = JSON.parse(attempt)
                const solutionMatrices = []

                ;(Array.isArray(actual) ? actual : [actual]).forEach(sol => {
                    const _start = sol.indexOf("matrix} ") + "matrix} ".length
                    const _end = sol.indexOf("\\end{")
                    let _solutionMatrix = sol
                        .substring(_start, _end)
                        .trim()
                        .split("\\\\")
                        .map(row => row.split("&").map(val => val.trim()))
                    solutionMatrices.push(_solutionMatrix)
                })

                console.debug('solutions: ', solutionMatrices)
                correctAnswer = solutionMatrices.some(matrix => {
                    return matrix.reduce((acc, row, idx) => acc && row.reduce((_acc, cell, jdx) => {
                        const _studentRow = studentMatrix[idx] || []
                        const _studentCell = _studentRow[jdx] || ""
                        const _studentExpr = KAS.parse(_studentCell.replace(/\$\$/g, '')).expr

                        const _solExpr = KAS.parse(cell.replace(/\$\$/g, '')).expr

                        return _acc && KAS.compare(_studentExpr, _solExpr).equal
                    }, true), true)
                })

                return [attempt, correctAnswer]
            } else {
                parsed = KAS.parse(attempt.replace(/\$\$/g, '')).expr;
                correctAnswer = _parseEquality(parsed, actual.map((actualAns) => KAS.parse(actualAns.replace(/\$\$/g, '')).expr));
                return [parsed.print(), correctAnswer];
            }

        } else if (answerType === "string") {
            parsed = attempt;
            //console.log(parsed);
            //console.log(actual);
            correctAnswer = _equality(parsed, actual);
        } else {
            parsed = +attempt;
            correctAnswer = _equality(round(parsed, precision), actual.map((actualAns) => round(+actualAns, precision)));
        }
        return [parsed, correctAnswer];
    } catch (err) {
        console.log("error", err);
        return [parsed, false];
    }
}

export { checkAnswer };
