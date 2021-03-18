import React from 'react';
import { InlineMath } from 'react-katex';
import { dynamicText } from '../config/config.js'
var gen = require('random-seed');

// Return random int from [0, end)
function randomInt(end) {
  return Math.floor(Math.random() * end);
}

// Lock in variables chosen at Problem/Step/Hint. This method must be imported and called elsewhere
function chooseVariables(variabilization, seed) {
  if (typeof variabilization === 'undefined' || Object.keys(variabilization).length == 0) {
    return variabilization
  }
  var numOptions = 0;
  for (var v in variabilization) {
    numOptions = Math.max(numOptions, variabilization[v].length);
  }
  var rand1 = gen.create(seed); 
  var chosen = rand1(numOptions)
  Object.keys(variabilization).forEach(v =>  {
    // Take r index of each variable, r is same across all vars.
    var replaceOption = variabilization[v][(chosen + 1) % variabilization[v].length];
    variabilization[v] = [replaceOption];
  });
  return variabilization;
}

function variabilize(text, variabilization) {
  if (typeof variabilization === 'undefined' || Object.keys(variabilization).length == 0) {
    return text;
  }
  Object.keys(variabilization).forEach(v =>  {
    if (variabilization[v].length != 1) {
      console.log("[WARNING] - variable not properly chosen");
    }
    var replaceOption = variabilization[v][0];
    text = text.replace(new RegExp('@{' + v + '}', 'g'), replaceOption);
  });
  return text;
}

function renderText(text, problemID, variabilization) {
  if (typeof text !== 'string') {
    return text;
  }
  var result = text;
  for (var d in dynamicText) {
    var replace = dynamicText[d];
    result = result.split(d).join(replace);
  }
  if (variabilization) {
    result = variabilize(text, variabilization);
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

export {renderText, chooseVariables}