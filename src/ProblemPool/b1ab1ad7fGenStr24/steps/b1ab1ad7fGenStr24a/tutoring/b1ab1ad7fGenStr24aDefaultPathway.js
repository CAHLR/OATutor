var hints = [{id: "b1ab1ad7fGenStr24a-h1", type: "hint", dependencies: [], title: "Simplification", text: "Simplify each side of the equation as much as possible.", variabilization: {}}, {id: "b1ab1ad7fGenStr24a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$6m-18=30m+6$$"], dependencies: ["b1ab1ad7fGenStr24a-h1"], title: "Simplification", text: "Use the distributive property to simplify each side of the equation.", variabilization: {}}, {id: "b1ab1ad7fGenStr24a-h3", type: "hint", dependencies: ["b1ab1ad7fGenStr24a-h2"], title: "Variable Terms", text: "Collect all variable terms on the right side of the equation.", variabilization: {}}, {id: "b1ab1ad7fGenStr24a-h4", type: "hint", dependencies: ["b1ab1ad7fGenStr24a-h3"], title: "Subtraction property of equality", text: "When you subtract the same quantity from both sides of an equation, you still have equality.", variabilization: {}}, {id: "b1ab1ad7fGenStr24a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$-18=24m+6$$"], dependencies: ["b1ab1ad7fGenStr24a-h4"], title: "Subtraction", text: "Subtract 6m from each side.", variabilization: {}}, {id: "b1ab1ad7fGenStr24a-h6", type: "hint", dependencies: ["b1ab1ad7fGenStr24a-h5"], title: "Constant Terms", text: "Collect all constant terms on the right side of the equation.", variabilization: {}}, {id: "b1ab1ad7fGenStr24a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$-24=24m$$"], dependencies: ["b1ab1ad7fGenStr24a-h6"], title: "Subtraction", text: "Subtract 6 from each side.", variabilization: {}}, {id: "b1ab1ad7fGenStr24a-h8", type: "hint", dependencies: ["b1ab1ad7fGenStr24a-h7"], title: "Division property of equality", text: "When you divide both sides of an equation by any non-zero number, you still have equality.", variabilization: {}}, {id: "b1ab1ad7fGenStr24a-h9", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$m=-1$$"], dependencies: ["b1ab1ad7fGenStr24a-h8"], title: "Division", text: "Divide 24 from each side.", variabilization: {}}, {id: "b1ab1ad7fGenStr24a-h10", type: "hint", dependencies: ["b1ab1ad7fGenStr24a-h9"], title: "Verification", text: "Check whether the result is a solution of the equation.", variabilization: {}}, {id: "b1ab1ad7fGenStr24a-h11", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["TRUE"], dependencies: ["b1ab1ad7fGenStr24a-h10"], title: "Verification", text: "Check whether $$0.15\\left(40\\left(-1\\right)-120\\right)$$ equals $$0.5\\left(60\\left(-1\\right)+12\\right)$$.", choices: ["TRUE", "FALSE"], variabilization: {}}, ]; export {hints};