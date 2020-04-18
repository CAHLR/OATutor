import React from 'react';
import { InlineMath } from 'react-katex';
import { dynamicText } from '../config/config.js'

export default function renderText(text, problemID) {
  var result = text;
  for (var d in dynamicText) {
    var replace = dynamicText[d];
    result = result.split(d).join(replace);
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
            return <img src = {require(`../ProblemPool/${problemID}/figures/${subPart}`)} alt={`${problemID} figure`}/>
          }
        });
      } else {
        return <InlineMath math={part} />;
      }
    })
    if (j !== splitted.length - 1) {
      lineSplitted.push(<br/>);
    }
    return lineSplitted;
  })
  return splitted;
}
