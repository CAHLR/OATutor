import { variabilize } from './variabilize.js';
import insert from "../util/strInsert";
import { parseMatrixTex } from "../util/parseMatrixTex";
import { IS_DEVELOPMENT, IS_STAGING_OR_DEVELOPMENT } from "../util/getBuildType";
import WrongAnswerReasons from "../util/wrongAnswerReasons";

const KAS = require('../kas.js');

if (IS_DEVELOPMENT) {
    window.KAS = KAS
}

// attempt = student answer, actual = [ans1, ans2]
function _equality(attempt, actual) {
    const parsedAttempt = attempt.replace(/\s+/g, '').replace(/\\left/g, '').replace(/\\right/g, '');
    return actual.filter(stepAns => {
        const parsedStepAns = stepAns.replace(/\s+/g, '').replace(/\\left/g, '').replace(/\\right/g, '');
        //console.log("parsedAttempt: " + parsedAttempt + " parsedStepAns: " + parsedStepAns);
        return parsedAttempt === parsedStepAns
    });
}

// attempt = student answer, actual = [ans1, ans2]
/**
 *
 * @param attempt {Expr}
 * @param actual {Expr[]}
 * @returns {Expr[]}
 * @private
 */
function _parseEquality(attempt, actual) {
    //console.log("PARSED: " + attempt.print());
    //console.log("ANSWER: " + actual[0].print());
    return actual.filter(stepAns => KAS.compare(attempt, stepAns).equal);
}

// Round to precision number of decimal places
function round(num, precision) {
    if (precision != null) {
        return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
    } else {
        return num;
    }
}

/**
 * Uses parse
 * @param _string the expression string
 */
function parse(_string) {
    // explicitly group outermost absolute value pair with parenthesis to imply multiplication when neighboring constant
    if (_string.split("|").length === 3) {
        const leftIdx = _string.indexOf("\\left|")
        if (leftIdx > -1) {
            const rightIdx = _string.lastIndexOf("\\right|")
            _string = insert(_string, leftIdx, "(")
            _string = insert(_string, rightIdx + 8, ")")
        } else {
            const leftBarIdx = _string.indexOf("|")
            const rightBarIdx = _string.lastIndexOf("|")
            _string = insert(_string, leftBarIdx, "(")
            _string = insert(_string, rightBarIdx + 2, ")")
        }
    }

    const string = _string
        .replace(/\$\$/g, '') // replace $$ as KAS can parse LaTex but without the $$ prepended/appended
    return KAS.parse(string)
}

function validateAndCorrectFormat(input) {
    const fraction = /\\frac(\d)(\d)/g;

    const correctedInputFraction = input.replace(fraction, (match, numerator, denominator) => {
        return `\\frac{${numerator}}{${denominator}}`;
    });

    const sqrt = /\\sqrt(\d)/g;

    const correctedInput = correctedInputFraction.replace(sqrt, (match, number) => {
        return `\\sqrt{${number}}`;
    });

    return correctedInput;
}

/**
 *
 * @param attempt
 * @param actual
 * @param answerType
 * @param precision
 * @param variabilization
 * @param questionText {string} allows for a check to see if student pasted in the answer exactly
 * @returns {[string, boolean | string, null | WrongAnswerReasons]}
 */
function checkAnswer({ attempt, actual, answerType, precision = 5, variabilization = {}, questionText = ""}) {
    let parsed = attempt.replace(/\s+/g, '');
    if (variabilization) {
        actual = actual.map((actualAns) => variabilize(actualAns, variabilization));
    }

    try {
        if (parsed === "") {
            return [parsed, false, WrongAnswerReasons.wrong];
        }
        if (answerType === "arithmetic") {
            // checks if anticipated answer is a matrix
            if (/\\begin{[a-zA-Z]?matrix}/.test(actual)) {
                console.debug(`attempt: ${attempt} vs. actual:`, actual)
                const studentMatrix = JSON.parse(attempt)
                const solutionMatrices = parseMatrixTex(actual);

                console.debug('solutions: ', solutionMatrices)
                let correctAnswers = solutionMatrices.filter(matrix => {
                    return matrix.reduce((acc, row, idx) => acc && row.reduce((_acc, cell, jdx) => {
                        const _studentRow = studentMatrix[idx] || []
                        const _studentCell = _studentRow[jdx] || ""
                        const _studentExpr = parse(_studentCell).expr

                        const _solExpr = parse(cell).expr

                        return _acc && KAS.compare(_studentExpr, _solExpr).equal
                    }, true), true)
                })

                if (correctAnswers.length > 0) {
                    return [attempt, correctAnswers[0], null]
                }

                return [attempt, false, WrongAnswerReasons.wrong]
            } else {
                attempt = validateAndCorrectFormat(attempt);
                parsed = parse(attempt).expr;
                if (IS_STAGING_OR_DEVELOPMENT) {
                    console.debug("checkAnswer.js: Using KAS to compare answer with solution", "attempt", attempt, "actual", actual, "parsed", parsed)

                    console.debug("checkAnswer.js: questionText vs attempt", questionText, "vs", attempt)
                }

                // try to see if student paste in exact question
                try {
                    const questionTextRepr = parse(questionText).expr.repr()
                    if (questionTextRepr === parsed.repr()) {
                        return [parsed.print(), false, WrongAnswerReasons.sameAsProblem];
                    }
                } catch (_) {
                    // ignored
                }

                let correctAnswers = _parseEquality(parsed, actual.map((actualAns) => parse(actualAns).expr));

                if (correctAnswers.length > 0) {
                    return [parsed.print(), correctAnswers[0], null]
                }

                return [parsed.print(), false, WrongAnswerReasons.wrong];
            }

        } else if (answerType === "string") {
            parsed = attempt;
            //console.log(parsed);
            //console.log(actual);
            const correctAnswers = _equality(parsed, actual);

            if (correctAnswers.length > 0) {
                return [parsed, correctAnswers[0], null]
            }

            return [parsed, false, WrongAnswerReasons.wrong];
        } else {
            // guess it is a number problem
            parsed = +attempt;
            const correctAnswers = _equality(round(parsed, precision), actual.map((actualAns) => round(+actualAns, precision)));

            if (correctAnswers.length > 0) {
                return [parsed, correctAnswers[0], null]
            }

            return [parsed, false, WrongAnswerReasons.wrong];
        }
    } catch (err) {
        console.log("error", err);
        return [parsed, false, WrongAnswerReasons.errored];
    }
}

export { checkAnswer };
