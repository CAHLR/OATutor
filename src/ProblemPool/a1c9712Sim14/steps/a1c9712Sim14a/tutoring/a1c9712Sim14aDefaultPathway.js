var hints = [{id: "a1c9712Sim14a-h1", type: "hint", dependencies: [], title: "Rewriting", text: "Rewrite the complex fraction as division.", variabilization: {}}, {id: "a1c9712Sim14a-h2", type: "hint", dependencies: ["a1c9712Sim14a-h1"], title: "Rewriting", text: "Rewrite as the product of the first times the reciprocal of the second.", variabilization: {}}, {id: "a1c9712Sim14a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{x-4}{2\\left(x-3\\right) \\left(x-4\\right)}$$"], dependencies: ["a1c9712Sim14a-h2"], title: "Simplify Expression", text: "Simplify the equation.", variabilization: {}}, {id: "a1c9712Sim14a-h4", type: "hint", dependencies: ["a1c9712Sim14a-h3"], title: "Common Factors", text: "We can then remove common factors after we multiply.", variabilization: {}}, {id: "a1c9712Sim14a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{2\\left(x-3\\right)}$$"], dependencies: ["a1c9712Sim14a-h4"], title: "Simplify Expression", text: "When we simplify, what is our answer?", variabilization: {}}, ]; export {hints};