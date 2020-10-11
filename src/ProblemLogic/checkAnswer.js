var Algebrite = require('algebrite');
var KAS = require('../kas.js');

// attempt = student answer, actual = [ans1, ans2]
function _equality(attempt, actual) {
  return actual.some((stepAns) => (attempt === stepAns));
}

// attempt = student answer, actual = [ans1, ans2]
function _parseEquality(attempt, actual) {
  console.log("PARSED: " + attempt.print());
  console.log("ANSWER: " + actual[0].print());
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

function checkAnswer(attempt, actual, answerType, precision) {
  var parsed = attempt;
  var correctAnswer = false;
  try {
    if (parsed === "") {
      return [parsed, false];
    } else if (answerType === "arithmetic") {
      parsed = KAS.parse(attempt).expr;
      correctAnswer = _parseEquality(parsed, actual.map((actualAns) => KAS.parse(actualAns).expr));
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