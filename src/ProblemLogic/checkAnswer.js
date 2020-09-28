var Algebrite = require('algebrite');

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
      parsed = Algebrite.run(attempt).toString();
      if (parsed.includes("syntax error")) {
        parsed = "algebrite syntax error"
      }
      correctAnswer = _equality(round(parsed, precision), actual.map((actualAns) => round(Algebrite.run(actualAns).toString(), precision)));
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