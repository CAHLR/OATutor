var hints = [{id: "GenStr25b-h1", type: "hint", dependencies: [], title: "Simplification", text: "Simplify each side of the equation as much as possible."}, {id: "GenStr25b-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-48n-64=32"], dependencies: ["GenStr25b-h1"], title: "Simplification", text: "Use the distributive property to simplify each side of the equation."}, {id: "GenStr25b-h3", type: "hint", dependencies: ["GenStr25b-h2"], title: "Addition property of equality", text: "When you add the same quantity to both sides of an equation, you still have equality."}, {id: "GenStr25b-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-48n=96"], dependencies: ["GenStr25b-h3"], title: "Addition", text: "Add 64 to each side of the equation."}, {id: "GenStr25b-h5", type: "hint", dependencies: ["GenStr25b-h4"], title: "Division property of equality", text: "When you divide both sides of an equation by any non-zero number, you still have equality."}, {id: "GenStr25b-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["n=-2"], dependencies: ["GenStr25b-h5"], title: "Division", text: "Divide -48 from each side."}, {id: "GenStr25b-h7", type: "hint", dependencies: ["GenStr25b-h6"], title: "Verification", text: "Check whether the result is a solution of the equation."}, {id: "GenStr25b-h8", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["True"], dependencies: ["GenStr25b-h7"], title: "Verification", text: "Check whether $$-\\left(16\\right) \\left(\\left(3\\right) -\\left(2\\right)+\\left(4\\right)\\right)$$ equals 32.", choices: ["TRUE", "FALSE"]}, ]; export {hints};