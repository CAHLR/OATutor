var hints = [{id: "DivMul3a-h1", type: "hint", dependencies: [], title: "Division property of equality", text: "When you divide both sides of an equation by any non-zero number, you still have equality.", variabilization: {}}, {id: "DivMul3a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{4}{4} z=\\frac{-\\left(55\\right)}{4}$$"], dependencies: ["DivMul3a-h1"], title: "Division", text: "Divide 4 from each side.", variabilization: {}}, {id: "DivMul3a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{-\\left(55\\right)}{4}$$"], dependencies: ["DivMul3a-h2"], title: "Simplification", text: "What do we get for z after simplifying the equation?", variabilization: {}}, {id: "DivMul3a-h4", type: "hint", dependencies: ["DivMul3a-h3"], title: "Verification", text: "Check whether the result is a solution of the equation.", variabilization: {}}, {id: "DivMul3a-h5", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["TRUE"], dependencies: ["DivMul3a-h4"], title: "Verification", text: "Check whether $$\\left(4\\right) \\frac{\\left(-5\\right)5}{4}$$ equals -55.", choices: ["TRUE", "FALSE"], variabilization: {}}, ]; export {hints};