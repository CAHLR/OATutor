var Parser = require('expr-eval').Parser;
var parser = new Parser({
    operators: {
      // These default to true, but are included to be explicit
      add: true,
      concatenate: true,
      conditional: true,
      divide: true,
      factorial: true,
      multiply: true,
      power: true,
      remainder: true,
      subtract: true,
  
      // Disable and, or, not, <, ==, !=, etc.
      logical: false,
      comparison: false,
  
      // Disable 'in' and = operators
      'in': false,
      assignment: false
    }
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