var hints = [{id: "b1a4d2b33use12a-h1", type: "hint", dependencies: [], title: "Substitute", text: "Substitute 2 for x and simplify the expression $${6\\left(2\\right)}^2-4\\left(2\\right)-7$$.", variabilization: {}}, {id: "b1a4d2b33use12a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["4"], dependencies: ["b1a4d2b33use12a-h1"], title: "Exponentiation", text: "What is $$2^2$$?", variabilization: {}}, {id: "b1a4d2b33use12a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["24"], dependencies: ["b1a4d2b33use12a-h2"], title: "Multiplication", text: "What is $${6\\left(2\\right)}^2$$, given that $$2^2=4$$?", variabilization: {}}, {id: "b1a4d2b33use12a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["8"], dependencies: ["b1a4d2b33use12a-h3"], title: "Multiplication", text: "What is 4(2)?", variabilization: {}}, {id: "b1a4d2b33use12a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["9"], dependencies: ["b1a4d2b33use12a-h4"], title: "Subtraction", text: "What is 24-8-7?", variabilization: {}}, ]; export {hints};