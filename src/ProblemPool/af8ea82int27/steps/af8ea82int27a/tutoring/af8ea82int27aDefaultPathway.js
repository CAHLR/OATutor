var hints = [{id: "af8ea82int27a-h1", type: "hint", dependencies: [], title: "Substitution", text: "Substitute the variables x and y with their numeric equivalents", variabilization: {}}, {id: "af8ea82int27a-h2", type: "hint", dependencies: ["af8ea82int27a-h1"], title: "Evaluation", text: "Once you have substituted the variables, evaluate the expression, keeping track of the order of operations (parantheses, then exponents, then multiplication and division, and finnaly addition and subtraction)", variabilization: {}}, {id: "af8ea82int27a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["23"], dependencies: ["af8ea82int27a-h2"], title: "Evaluation", text: "What is $$4\\times2^2-2\\times2 \\left(-1\\right)+3{\\left(-1\\right)}^2$$?", subHints: [{id: "af8ea82int27a-h3-s1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["16"], dependencies: [], title: "Evaluation", text: "What is $$4\\times2^2$$?", variabilization: {}}, {id: "af8ea82int27a-h3-s2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-4"], dependencies: ["af8ea82int27a-h3-s1"], title: "Evaluation", text: "What is $$2\\times2 \\left(-1\\right)$$?", variabilization: {}}, {id: "af8ea82int27a-h3-s3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3"], dependencies: ["af8ea82int27a-h3-s2"], title: "Evaluation", text: "What is $$3{\\left(-1\\right)}^2$$?", variabilization: {}}, {id: "af8ea82int27a-h3-s4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["23"], dependencies: ["af8ea82int27a-h3-s3"], title: "Evaluation", text: "What is $$16-\\left(-4\\right)+3$$?", variabilization: {}}], variabilization: {}}, ]; export {hints};