var hints = [{id: "b1a2d8720LinEqua11a-h1", type: "hint", dependencies: [], title: "Excluded values", text: "The excluded values are those making a denominator equal to zero.", variabilization: {}}, {id: "b1a2d8720LinEqua11a-h2", type: "hint", dependencies: ["b1a2d8720LinEqua11a-h1"], title: "Denominator", text: "The denominators are x-6 and x.", variabilization: {}}, {id: "b1a2d8720LinEqua11a-h3", type: "hint", dependencies: ["b1a2d8720LinEqua11a-h2"], title: "Excluded values", text: "The excluded values are 6 and 0.", variabilization: {}}, {id: "b1a2d8720LinEqua11a-h4", type: "hint", dependencies: ["b1a2d8720LinEqua11a-h3"], title: "Factoring the denominator", text: "The denominators x and x-6 have nothing in common.", variabilization: {}}, {id: "b1a2d8720LinEqua11a-h5", type: "hint", dependencies: ["b1a2d8720LinEqua11a-h4"], title: "Find LCD", text: "The LCD is the smallest expression that is divisible by each one of the denominators.", variabilization: {}}, {id: "b1a2d8720LinEqua11a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["x(x-6)"], dependencies: ["b1a2d8720LinEqua11a-h5"], title: "LCD", text: "What is the LCD of this equation?", variabilization: {}}, {id: "b1a2d8720LinEqua11a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$3x=5x-30$$"], dependencies: ["b1a2d8720LinEqua11a-h6"], title: "Eliminating", text: "Simplify $$x\\left(x-6\\right) \\frac{3}{x-6}=x\\left(x-6\\right) \\frac{5}{x}$$.", variabilization: {}}, {id: "b1a2d8720LinEqua11a-h8", type: "hint", dependencies: ["b1a2d8720LinEqua11a-h7"], title: "Solve equation", text: "Then we should solve the linear equation obtained.", variabilization: {}}, {id: "b1a2d8720LinEqua11a-h9", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["15"], dependencies: ["b1a2d8720LinEqua11a-h8"], title: "Linear equation", text: "Solve the equation $$3x=5x-30$$. What is x?", variabilization: {}}, ]; export {hints};