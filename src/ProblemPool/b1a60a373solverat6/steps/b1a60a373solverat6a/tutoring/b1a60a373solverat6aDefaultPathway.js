var hints = [{id: "b1a60a373solverat6a-h1", type: "hint", dependencies: [], title: "Lowest Common Denominator", text: "The first step is to find the lowest common denominator.", variabilization: {}}, {id: "b1a60a373solverat6a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$y^2-9$$"], dependencies: ["b1a60a373solverat6a-h1"], title: "Lowest Common Denominator", text: "What is the lowest common denominator?", variabilization: {}}, {id: "b1a60a373solverat6a-h3", type: "hint", dependencies: ["b1a60a373solverat6a-h2"], title: "Distribute and multiply", text: "Distribute and multiply the lowest common denominator to all the terms.", variabilization: {}}, {id: "b1a60a373solverat6a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$5y-15+2y+6=5$$"], dependencies: ["b1a60a373solverat6a-h3"], title: "Distribute and multiply", text: "What is the result?", variabilization: {}}, {id: "b1a60a373solverat6a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$y=2$$"], dependencies: ["b1a60a373solverat6a-h4"], title: "Simple Algebra", text: "Solve for y. Please input the answer as $$variable=answer$$.", variabilization: {}}, {id: "b1a60a373solverat6a-h6", type: "hint", dependencies: ["b1a60a373solverat6a-h5"], title: "Double Check", text: "Plug answers for a back into the original equation to make the sure answer is correct and not undefined at any point.", variabilization: {}}, ]; export {hints};