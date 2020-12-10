import React from 'react';
import { InlineMath } from 'react-katex';
import { dynamicText } from '../config/config.js'
var gen = require('random-seed');

// Return random int from [0, end)
function randomInt(end) {
  return Math.floor(Math.random() * end);
}

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

export default function renderText(text, problemID, step, seed) {
  if (typeof text !== 'string') {
    return text;
  }
  var result = text;
  for (var d in dynamicText) {
    var replace = dynamicText[d];
    result = result.split(d).join(replace);
  }
  if (step && step.variabilization) {
    result = variabilize(text, step.variabilization, seed);
  }
  

  var splitted = result.split("\\n");
  splitted = splitted.map((line, j) => {
    var lineSplitted = line.split("$$");
    lineSplitted = lineSplitted.map((part, i) => {
      if (i % 2 === 0) {
        var partSplitted = part.split("##");
        return partSplitted.map((subPart, k) => {
          if (k % 2 === 0) {
            return subPart;
          } else {
            //console.log(`../ProblemPool/${problemID}/figures/${subPart}`);
            return <center><img src = {require(`../ProblemPool/${problemID}/figures/${subPart}`)} alt={`${problemID} figure`} key={Math.random() * 2 ** 16}/></center>
          }
        });
      } else {
        return <InlineMath math={part} key={Math.random() * 2 ** 16}/>;
      }
    })
    if (j !== splitted.length - 1) {
      lineSplitted.push(<br/>);
    }
    return lineSplitted;
  })
  return splitted;
}
