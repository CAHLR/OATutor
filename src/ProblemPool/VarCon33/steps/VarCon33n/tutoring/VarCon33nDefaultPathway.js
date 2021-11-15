var hints = [{id: "VarCon33n-h1", type: "hint", dependencies: [], title: "Choosing side", text: "Choose a side to be the \"variable\" side and the other side will be the \"constant\" side. In this example, we choose the left side as the \"variable\" side.", variabilization: {}}, {id: "VarCon33n-h2", type: "hint", dependencies: ["VarCon33n-h1"], title: "Subtraction property of equality", text: "When you subtract the same quantity from both sides of an equation, you still have equality.", variabilization: {}}, {id: "VarCon33n-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$3.2x-18.9=54.7$$"], dependencies: ["VarCon33n-h2"], title: "Subtraction", text: "Subtract 3.4x from each side.", variabilization: {}}, {id: "VarCon33n-h4", type: "hint", dependencies: ["VarCon33n-h3"], title: "Addition property of equality", text: "When you add the same quantity to both sides of an equation, you still have equality.", variabilization: {}}, {id: "VarCon33n-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$3.2x=73.6$$"], dependencies: ["VarCon33n-h4"], title: "Addition", text: "Add 18.9 to each side of the equation.", variabilization: {}}, {id: "VarCon33n-h6", type: "hint", dependencies: ["VarCon33n-h5"], title: "Division property of equality", text: "When you divide both sides of an equation by any non-zero number, you still have equality.", variabilization: {}}, {id: "VarCon33n-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$x=23$$"], dependencies: ["VarCon33n-h6"], title: "Division", text: "Divide 3.2 from each side.", variabilization: {}}, {id: "VarCon33n-h8", type: "hint", dependencies: ["VarCon33n-h7"], title: "Verification", text: "Check whether the result is a solution of the equation.", variabilization: {}}, {id: "VarCon33n-h9", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["TRUE"], dependencies: ["VarCon33n-h8"], title: "Verification", text: "Check whether $$6.6\\times23-18.9$$ equals $$3.4\\times23+54.7$$.", choices: ["TRUE", "FALSE"], variabilization: {}}, ]; export {hints};