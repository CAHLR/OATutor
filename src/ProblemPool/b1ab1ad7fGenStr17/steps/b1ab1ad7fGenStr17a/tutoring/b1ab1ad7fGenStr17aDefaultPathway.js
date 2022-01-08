var hints = [{id: "b1ab1ad7fGenStr17a-h1", type: "hint", dependencies: [], title: "Simplification", text: "Simplify each side of the equation as much as possible.", variabilization: {}}, {id: "b1ab1ad7fGenStr17a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$6p-25=20p+3$$"], dependencies: ["b1ab1ad7fGenStr17a-h1"], title: "Simplification", text: "Use the distributive property to simplify each side of the equation.", variabilization: {}}, {id: "b1ab1ad7fGenStr17a-h3", type: "hint", dependencies: ["b1ab1ad7fGenStr17a-h2"], title: "Variable Terms", text: "Collect all variable terms on the right side of the equation.", variabilization: {}}, {id: "b1ab1ad7fGenStr17a-h4", type: "hint", dependencies: ["b1ab1ad7fGenStr17a-h3"], title: "Subtraction property of equality", text: "When you subtract the same quantity from both sides of an equation, you still have equality.", variabilization: {}}, {id: "b1ab1ad7fGenStr17a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$-25=14p+3$$"], dependencies: ["b1ab1ad7fGenStr17a-h4"], title: "Subtraction", text: "Subtract 6p from each side.", variabilization: {}}, {id: "b1ab1ad7fGenStr17a-h6", type: "hint", dependencies: ["b1ab1ad7fGenStr17a-h5"], title: "Constant Terms", text: "Collect all constant terms on the left side of the equation.", variabilization: {}}, {id: "b1ab1ad7fGenStr17a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$-28=14p$$"], dependencies: ["b1ab1ad7fGenStr17a-h6"], title: "Subtraction", text: "Subtract 3 from each side.", variabilization: {}}, {id: "b1ab1ad7fGenStr17a-h8", type: "hint", dependencies: ["b1ab1ad7fGenStr17a-h7"], title: "Division property of equality", text: "When you divide both sides of an equation by any non-zero number, you still have equality.", variabilization: {}}, {id: "b1ab1ad7fGenStr17a-h9", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$p=-2$$"], dependencies: ["b1ab1ad7fGenStr17a-h8"], title: "Division", text: "Divide 14 from each side.", variabilization: {}}, {id: "b1ab1ad7fGenStr17a-h10", type: "hint", dependencies: ["b1ab1ad7fGenStr17a-h9"], title: "Verification", text: "Check whether the result is a solution of the equation.", variabilization: {}}, {id: "b1ab1ad7fGenStr17a-h11", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["TRUE"], dependencies: ["b1ab1ad7fGenStr17a-h10"], title: "Verification", text: "Check whether $$6\\left(-2-3\\right)-7$$ equals $$5\\left(4\\left(-2\\right)+3\\right)-12$$.", choices: ["TRUE", "FALSE"], variabilization: {}}, ]; export {hints};