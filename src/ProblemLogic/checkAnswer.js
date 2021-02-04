var Algebrite = require('algebrite');
var KAS = require('../kas.js');
var gen = require('random-seed');

function variabilize(text, variabilization, seed) {
  Object.keys(variabilization).forEach(v =>  {
    var rand1 = gen.create(seed);
    var numOptions = variabilization[v].length - 1; // First element says variables
    var replaceOption = variabilization[v][rand1(numOptions) + 1];
    var variables = variabilization[v][0];
    for (var i = 0; i < variabilization[v][0].length; i++) { // Replace each element of tuple
      text = text.replace(new RegExp('@{' + variables[i] + '}', 'g'), replaceOption[i]);
    }
  });
  return text;
}

// attempt = student answer, actual = [ans1, ans2]
function _equality(attempt, actual) {
  var parsedAttempt = attempt.replace(/\s+/g, '').replace(/\left/g, '').replace(/\right/g, '');
  return actual.some((stepAns) => {
    var parsedStepAns = stepAns.replace(/\s+/g, '').replace(/\left/g, '').replace(/\right/g, '');
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

function checkAnswer(attempt, actual, answerType, precision, variabilization, seed) {
  var parsed = attempt.replace(/\s+/g, '');
  if (seed && variabilization) {
    actual = actual.map((actualAns) => variabilize(actualAns, variabilization, seed));
  }
  //console.log(actual);
  var correctAnswer = false;

  try {
    if (parsed === "") {
      return [parsed, false];
    } else if (answerType === "arithmetic") {
      parsed = KAS.parse(attempt).expr;
      console.log(parsed);
      console.log(actual);
      correctAnswer = _parseEquality(parsed, actual.map((actualAns) => KAS.parse(actualAns).expr));
      return [parsed.print(), correctAnswer];
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
  } catch {
    console.log("error");
    return [parsed, false];
  }
}

export default checkAnswer;