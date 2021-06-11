var hints = [{id: "LinEqua11b-h1", type: "hint", dependencies: [], title: "Excluded values", text: "The excluded values are those making a denominator equal to zero.", variabilization: {}}, {id: "LinEqua11b-h2", type: "hint", dependencies: ["LinEqua11b-h1"], title: "Denominator", text: "The denominators are x-3, x-3 and 2.", variabilization: {}}, {id: "LinEqua11b-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3"], dependencies: ["LinEqua11b-h2"], title: "Excluded values", text: "State the excluded value.", variabilization: {}}, {id: "LinEqua11b-h4", type: "hint", dependencies: ["LinEqua11b-h3"], title: "Factoring the denominator", text: "The three denominators in factored form are x-3, x-3, and 2.", variabilization: {}}, {id: "LinEqua11b-h5", type: "hint", dependencies: ["LinEqua11b-h4"], title: "Find LCD", text: "The LCD is the smallest expression that is divisible by each one of the denominators.", variabilization: {}}, {id: "LinEqua11b-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["2(x-3)"], dependencies: ["LinEqua11b-h5"], title: "LCD", text: "What is the LCD of this equation?", variabilization: {}}, {id: "LinEqua11b-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$2x=\\left(10\\right)-x+\\left(3\\right)$$"], dependencies: ["LinEqua11b-h6"], title: "Eliminating", text: "Simplify $$\\left(2\\right) \\left(x-\\left(3\\right)\\right) \\frac{x}{x-\\left(3\\right)}=\\left(2\\right) \\left(x-\\left(3\\right)\\right) \\left(\\frac{5}{x-\\left(3\\right)}-\\frac{1}{2}\\right)$$.", variabilization: {}}, {id: "LinEqua11b-h8", type: "hint", dependencies: ["LinEqua11b-h7"], title: "Solve equation", text: "Then we should solve the linear equation obtained.", variabilization: {}}, {id: "LinEqua11b-h9", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{13}{3}$$"], dependencies: ["LinEqua11b-h8"], title: "Linear equation", text: "Solve the equation $$2x=\\left(10\\right)-x+\\left(3\\right)$$. What is x?", variabilization: {}}, ]; export {hints};