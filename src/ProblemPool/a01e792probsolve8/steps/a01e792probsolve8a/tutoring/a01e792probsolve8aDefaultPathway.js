var hints = [{id: "a01e792probsolve8a-h1", type: "hint", dependencies: [], title: "Translate words to expressions", text: "The first step is to translate the relationship between the 2014 and 1975 cost in terms of a mathematical equation", variabilization: {}}, {id: "a01e792probsolve8a-h2", type: "hint", dependencies: ["a01e792probsolve8a-h1"], title: "Define the variable for the 1975 cost", text: "Let x $$=$$ average cost of car in 1975", variabilization: {}}, {id: "a01e792probsolve8a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$6x$$"], dependencies: ["a01e792probsolve8a-h2"], title: "Write the 2014 cost in terms of the 1975 cost", text: "What is six times the amount the husband earns?", variabilization: {}}, {id: "a01e792probsolve8a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$6h-1500$$"], dependencies: ["a01e792probsolve8a-h3"], title: "Write the 2014 cost in terms of the 1975 cost", text: "What is 1500 less than the previous answer?", variabilization: {}}, {id: "a01e792probsolve8a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["28500"], dependencies: ["a01e792probsolve8a-h4"], title: "Write the 2014 cost in terms of the 1975 cost", text: "What should $$6x-1500$$ be equal to?", variabilization: {}}, {id: "a01e792probsolve8a-h6", type: "hint", dependencies: ["a01e792probsolve8a-h5"], title: "Solving the equation", text: "The last step is to solve for x", variabilization: {}}, {id: "a01e792probsolve8a-h7", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Add 1500, divide by 6"], dependencies: ["a01e792probsolve8a-h6"], title: "Solving the equation", text: "What should we do to both sides of the equation in order to isolate x?", choices: ["Divide by 6, add 1500", "Add 1500, divide by 6", "Subtract 28500", "none of the above"], variabilization: {}}, ]; export {hints};