var hints = [{id: "add6935Sim7a-h1", type: "hint", dependencies: [], title: "Simplify Expression", text: "Simplify the numerator and denominator by finding a common denominator and multiplying each fraction by the denominator over the denominator.", variabilization: {}}, {id: "add6935Sim7a-h2", type: "hint", dependencies: ["add6935Sim7a-h1"], title: "Distribute", text: "Distribute the products in the fraction.", variabilization: {}}, {id: "add6935Sim7a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{2+1}{3-2}$$"], dependencies: ["add6935Sim7a-h2"], title: "Simplify", text: "Simplify the equation.", variabilization: {}}, {id: "add6935Sim7a-h4", type: "hint", dependencies: ["add6935Sim7a-h3"], title: "Common Factors", text: "We can then remove common factors after we multiply.", variabilization: {}}, {id: "add6935Sim7a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3"], dependencies: ["add6935Sim7a-h4"], title: "Simplify Expression", text: "When we simplify, what is our answer?", variabilization: {}}, ]; export {hints};