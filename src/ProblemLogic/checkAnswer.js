import { algebraCheckOptions } from '../config/config.js';

var Parser = require('expr-eval').Parser;
var parser = new Parser({
  operators: algebraCheckOptions
});

// attempt = student answer, actual = [ans1, ans2]
function _equality(attempt, actual) {
  return actual.some((stepAns) => (attempt === stepAns));
}

// Round to precision number of decimal places
function round(num, precision) {
  if (precision != null) {
    return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
  } else {
    return num;
  }
}

function checkAnswer(attempt, actual, answerType, precision) {
  var parsed = attempt;
  var correctAnswer = false;
  try {
    if (parsed === "") {
      return [parsed, false];
    } else if (answerType === "algebra") {
      parsed = parser.parse(attempt).evaluate();
      correctAnswer = _equality(round(parsed, precision), actual.map((actualAns) => round(parser.parse(actualAns).evaluate(), precision)));
    } else if (answerType === "string") {
      parsed = attempt;
      correctAnswer = _equality(parsed, actual);
    } else {
      parsed = +attempt;
      correctAnswer = _equality(round(parsed, precision), actual.map((actualAns) => round(+actualAns, precision)));
    }
    return [parsed, correctAnswer];
  } catch {
    return [parsed, false];
  }
}

export default checkAnswer;