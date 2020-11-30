import React from 'react';
import { InlineMath } from 'react-katex';
import { dynamicText } from '../config/config.js'
var gen = require('random-seed');

// Return random int from [0, end)
function randomInt(end) {
  return Math.floor(Math.random() * end);
}

function variabilize(text, variabilization) {
  Object.keys(variabilization).forEach(v =>  {
    var rand1 = gen.create("seed");
    var numOptions = variabilization[v].length;
    var replaceOption = variabilization[v][rand1(numOptions)];
    text = text.replace(new RegExp('@{' + v + '}', 'g'), replaceOption);
  });
  return text;
}

export default function renderText(text, problemID, step) {
  if (typeof text !== 'string') {
    return text;
  }
  var result = text;
  for (var d in dynamicText) {
    var replace = dynamicText[d];
    result = result.split(d).join(replace);
  }
  if (step) {
    result = variabilize(text, step.variabilization);
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
