var hints = [{id: "b1a9ae528add13b-h1", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: [], title: "Seeing if the Signs Are Different", text: "Are the signs of the two terms different?", choices: ["Yes", "No"], variabilization: {}}, {id: "b1a9ae528add13b-h2", type: "hint", dependencies: ["b1a9ae528add13b-h1"], title: "First Step to Find the Value of the Expression", text: "Since 2 and -5 have different signs, we subtract 2 from 5.", variabilization: {}}, {id: "b1a9ae528add13b-h3", type: "hint", dependencies: ["b1a9ae528add13b-h2"], title: "Sign of the Answer", text: "The answer will be negative because there are more negatives than positives.", variabilization: {}}, {id: "b1a9ae528add13b-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-3"], dependencies: ["b1a9ae528add13b-h3"], title: "Final Answer", text: "What is -(5-2)?", variabilization: {}}, ]; export {hints};