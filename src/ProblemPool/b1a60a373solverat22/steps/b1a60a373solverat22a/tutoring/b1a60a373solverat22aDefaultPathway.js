var hints = [{id: "b1a60a373solverat22a-h1", type: "hint", dependencies: [], title: "Lowest Common Denominator", text: "The first step is to find the lowest common denominator.", variabilization: {}}, {id: "b1a60a373solverat22a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["9x"], dependencies: ["b1a60a373solverat22a-h1"], title: "Lowest Common Denominator", text: "What is the lowest common denominator?", variabilization: {}}, {id: "b1a60a373solverat22a-h3", type: "hint", dependencies: ["b1a60a373solverat22a-h2"], title: "Distribute and multiply", text: "Distribute and multiply the lowest common denominator to all the terms.", variabilization: {}}, {id: "b1a60a373solverat22a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$7x+9=6x$$"], dependencies: ["b1a60a373solverat22a-h3"], title: "Distribute and multiply", text: "What is the result?", variabilization: {}}, {id: "b1a60a373solverat22a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$x=-9$$"], dependencies: ["b1a60a373solverat22a-h4"], title: "Simple Algebra", text: "Solve for x. Please input the answer as $$variable=answer$$.", variabilization: {}}, {id: "b1a60a373solverat22a-h6", type: "hint", dependencies: ["b1a60a373solverat22a-h5"], title: "Double Check", text: "Plug answers for a back into the original equation to make the sure answer is correct and not undefined at any point.", variabilization: {}}, ]; export {hints};