import React from 'react';
import { InlineMath } from 'react-katex';
import { dynamicText } from '../config/config.js';
import { variabilize, chooseVariables } from './variabilize.js';
import Spacer from "../Components/_General/Spacer";
import ZoomImage from "../Components/_General/ZoomImage";

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
                        return <center key={Math.random() * 2 ** 16}>
                            <ZoomImage src={`${process.env.PUBLIC_URL}/static/images/figures/${problemID}/${subPart}`}
                                       alt={`${problemID} figure`} style={{ width: "100%", objectFit: "scale-down" }}/>
                        </center>
                    }
                });
            } else {
                return <InlineMath math={part} key={Math.random() * 2 ** 16}/>;
            }
        })
        if (j !== splitted.length - 1) {
            lineSplitted.push(<Spacer/>);
        }
        return lineSplitted;
    })
    return splitted;
}

export { renderText, chooseVariables }
