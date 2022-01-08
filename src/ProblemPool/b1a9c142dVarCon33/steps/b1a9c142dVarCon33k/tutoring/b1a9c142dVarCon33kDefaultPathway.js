var hints = [{id: "b1a9c142dVarCon33k-h1", type: "hint", dependencies: [], title: "Choosing side", text: "Choose a side to be the \"variable\" side and the other side will be the \"constant\" side. In this example, we choose the right side as the \"variable\" side.", variabilization: {}}, {id: "b1a9c142dVarCon33k-h2", type: "hint", dependencies: ["b1a9c142dVarCon33k-h1"], title: "Subtraction property of equality", text: "When you subtract the same quantity from both sides of an equation, you still have equality.", variabilization: {}}, {id: "b1a9c142dVarCon33k-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$2=\\frac{1}{5} p-1$$"], dependencies: ["b1a9c142dVarCon33k-h2"], title: "Subtraction", text: "Subtract $$\\frac{3}{5} p$$ from each side.", variabilization: {}}, {id: "b1a9c142dVarCon33k-h4", type: "hint", dependencies: ["b1a9c142dVarCon33k-h3"], title: "Addition property of equality", text: "When you add the same quantity to both sides of an equation, you still have equality.", variabilization: {}}, {id: "b1a9c142dVarCon33k-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$3=\\frac{1}{5} a$$"], dependencies: ["b1a9c142dVarCon33k-h4"], title: "Addition", text: "Add 1 to each side of the equation.", variabilization: {}}, {id: "b1a9c142dVarCon33k-h6", type: "hint", dependencies: ["b1a9c142dVarCon33k-h5"], title: "Multiplication property of equality", text: "If you multiply both sides of an equation by the same number, you still have equality.", variabilization: {}}, {id: "b1a9c142dVarCon33k-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$a=15$$"], dependencies: ["b1a9c142dVarCon33k-h6"], title: "Multiplication", text: "Multiple 5 from each side.", variabilization: {}}, {id: "b1a9c142dVarCon33k-h8", type: "hint", dependencies: ["b1a9c142dVarCon33k-h7"], title: "Verification", text: "Check whether the result is a solution of the equation.", variabilization: {}}, {id: "b1a9c142dVarCon33k-h9", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["TRUE"], dependencies: ["b1a9c142dVarCon33k-h8"], title: "Verification", text: "Check whether $$15\\frac{3}{5}+2$$ equals $$15\\frac{4}{5}-1$$.", choices: ["TRUE", "FALSE"], variabilization: {}}, ]; export {hints};