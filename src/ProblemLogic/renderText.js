import React from 'react';
import { InlineMath } from 'react-katex';
import { dynamicText } from '../config/config.js';
import { variabilize, chooseVariables } from './variabilize.js';
import Spacer from "../Components/_General/Spacer";
import ZoomImage from "../Components/_General/ZoomImage";
import ErrorBoundary from "../Components/_General/ErrorBoundary";

function renderText(text, problemID, variabilization) {
    if (typeof text !== 'string') {
        return text;
    }
    let result = text;
    for (const d in dynamicText) {
        const replace = dynamicText[d];
        result = result.split(d).join(replace);
    }
    if (variabilization) {
        result = variabilize(text, variabilization);
    }

    let splitted = result.split("\\n");
    splitted = splitted.map((line, j) => {
        let lineSplitted = line.split("$$");
        lineSplitted = lineSplitted.map((part, i) => {
            if (i % 2 === 0) {
                const partSplitted = part.split("##");
                return partSplitted.map((subPart, k) => {
                    if (k % 2 === 0) {
                        return subPart;
                    } else {
                        return <center key={Math.random() * 2 ** 16}>
                            <ZoomImage src={`${process.env.PUBLIC_URL}/static/images/figures/${problemID}/${subPart}`}
                                       alt={`${problemID} figure`} style={{ width: "100%", objectFit: "scale-down" }}/>
                        </center>
                    }
                });
            } else {
                // in between two $$ implies try using Latex
                return <ErrorBoundary componentName={"InlineMath"}
                                      replacement={part}
                                      inline
                                      key={Math.random() * 2 ** 16}>
                    <InlineMath math={part} renderError={(error) => {
                        throw error
                    }}/>
                </ErrorBoundary>;
            }
        })
        if (j !== splitted.length - 1) {
            lineSplitted.push(<Spacer key={Math.random() * 2 ** 16}/>);
        }
        return lineSplitted;
    })
    return splitted;
}

export { renderText, chooseVariables }
