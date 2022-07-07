import React from 'react';
import { InlineMath } from 'react-katex';
import { dynamicText } from '../config/config.js';
import { variabilize, chooseVariables } from './variabilize.js';
import Spacer from "../Components/_General/Spacer";
import ErrorBoundary from "../Components/_General/ErrorBoundary";
import RenderMedia from "../Components/_General/RenderMedia";

function renderText(text, problemID, variabilization) {
    if (typeof text !== 'string') {
        return text;
    }
    let result = text;
    for (const d in dynamicText) {
        const replace = dynamicText[d];
        result = result.split(d).join(replace); // expands all "%dynamic%" text to their specific counterparts
    }
    if (variabilization) {
        result = variabilize(text, variabilization);
    }

    const lines = result.split("\\n");
    return lines.map((line, idx) => {
        /**
         * If line has LaTeX, split by the "&&" delimiter to separate plain text from LaTeX
         * @type {(string | JSX.Element)[]}
         */
        let lineParts = line.split("$$");
        lineParts = lineParts.map((part, jdx) => {
            const isLaTeX = jdx % 2 !== 0; // implies it is in between two "$$" delimiters
            if (isLaTeX) {
                return <ErrorBoundary componentName={"InlineMath"}
                    replacement={part}
                    inline
                    key={Math.random() * 2 ** 16}>
                    <InlineMath math={part} renderError={(error) => {
                        throw error
                    }}/>
                </ErrorBoundary>;
            }

            const lineSubParts = part.split("##");
            return lineSubParts.map((subPart, kdx) => {
                const isMedia = kdx % 2 !== 0;
                if (isMedia) {
                    return <center key={Math.random() * 2 ** 16}>
                        <RenderMedia url={subPart} problemID={problemID}/>
                    </center>
                }
                return parseForFillInQuestions(subPart)
            });
        })
        // add a spacer if it isn't the last line
        if (idx !== lines.length - 1) {
            lineParts.push(<Spacer key={Math.random() * 2 ** 16}/>);
        }
        return lineParts;
    })
}

/**
 * Takes in a string and iff there is 3+ underscores in a row, convert it into a fill-in-the-blank box.
 * @param {(string)} str
 * @return {(string | JSX.Element)[]}
 */
function parseForFillInQuestions(str) {
    const strParts = str.split(/_{3,}/);
    let result = []
    strParts.forEach((part, idx) => {
        if (idx > 0) {
            result.push(<span key={Math.random() * 2 ** 16} aria-label={"fill in the blank"} style={{
                // TODO: choose between the following two styles
                marginLeft: "0.5ch",
                marginRight: "0.5ch",
                paddingLeft: "2.5ch",
                paddingRight: "2.5ch",
                position: "relative",
                background: "rgb(242,243,244)",
                borderRadius: "0.6ch",
            }}>
                <div style={{
                    position: "absolute",
                    bottom: 3.5,
                    left: 4,
                    right: 4,
                    height: 1.5,
                    borderRadius: "0.6ch",
                    background: "rgb(75,76,77)"
                }}/>
            </span>)
        }
        result.push(part);
    })
    return result
}

export { renderText, chooseVariables }
