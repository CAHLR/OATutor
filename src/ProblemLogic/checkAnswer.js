import  { algebraCheckOptions } from '../config/config.js';

var Parser = require('expr-eval').Parser;
var parser = new Parser({
    operators: algebraCheckOptions
  });

// attempt = student answer, actual = [ans1, ans2]
function _equality(attempt, actual) {
    return actual.some((stepAns) => ( attempt === stepAns ));
}

function checkAnswer(attempt, actual, answerType) {
    var parsed = attempt;
    var correctAnswer = false;
    if (answerType === "algebra") {
        parsed = parser.parse(attempt).evaluate();
        correctAnswer = _equality(parsed, actual.map((actualAns) => +actualAns));
    } else if (answerType === "string") {
        parsed = attempt;
        correctAnswer = _equality(parsed, actual);
    } else {
        parsed = +attempt;
        correctAnswer = _equality(parsed, actual.map((actualAns) => +actualAns));
    }
    return [parsed, correctAnswer];
}

export default checkAnswer;