var hints = [{id: "a9ae528add11b-h1", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["No"], dependencies: [], title: "Seeing if the Signs Are Different", text: "Are the signs of the two terms different?", choices: ["Yes", "No"], variabilization: {}}, {id: "a9ae528add11b-h2", type: "hint", dependencies: ["a9ae528add11b-h1"], title: "First Step to Find the Value of the Expression", text: "Since 2 and 5 have the same sign, we add 2 to 5.", variabilization: {}}, {id: "a9ae528add11b-h3", type: "hint", dependencies: ["a9ae528add11b-h2"], title: "Sign of the Answer", text: "The answer will be negative because there are only negatives", variabilization: {}}, {id: "a9ae528add11b-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-7"], dependencies: ["a9ae528add11b-h3"], title: "Calculating the Value of the Expression", text: "What is $$-\\left(2+5\\right)$$?", variabilization: {}}, ]; export {hints};