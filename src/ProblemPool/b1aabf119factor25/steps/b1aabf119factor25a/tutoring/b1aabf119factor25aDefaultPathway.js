var hints = [{id: "b1aabf119factor25a-h1", type: "hint", dependencies: [], title: "Difference of Squares Definition", text: "A difference of squares is an expression with the form $$n^2 x^2-b^2$$, where n and b are positive integers.", variabilization: {}}, {id: "b1aabf119factor25a-h2", type: "hint", dependencies: ["b1aabf119factor25a-h1"], title: "Integer", text: "Integers are positive and negative whole numbers. For example, 4, 20, and -36 are integers, while 2.31 is not.", variabilization: {}}, {id: "b1aabf119factor25a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["12"], dependencies: ["b1aabf119factor25a-h2"], title: "Square Root of 144", text: "What is the square root of 144?", variabilization: {}}, {id: "b1aabf119factor25a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["5"], dependencies: ["b1aabf119factor25a-h3"], title: "Square Root of 25", text: "What is the square root of 25?", variabilization: {}}, {id: "b1aabf119factor25a-h5", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: ["b1aabf119factor25a-h4"], title: "Classifying the Expression", text: "Is the expression a difference of squares?", choices: ["Yes", "No"], variabilization: {}}, {id: "b1aabf119factor25a-h6", type: "hint", dependencies: ["b1aabf119factor25a-h5"], title: "Factoring a Difference of Squares", text: "A difference of squares $$n^2 x^2-b^2$$ can be factored as $$\\left(nx+b\\right) \\left(nx-b\\right)$$.", variabilization: {}}, ]; export {hints};