var hints = [{id: "a161552poly2a-h1", type: "hint", dependencies: [], title: "Decompose", text: "Divide each term by the divisor. Be careful with the signs: $$\\frac{18x^3 y}{negneg}\\left(3x y\\right)}-\\frac{36x y^2}{\\operatorname{\\left(-3x y\\right)}$$", variabilization: {}}, {id: "a161552poly2a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$-6x^2$$"], dependencies: ["a161552poly2a-h1"], title: "Simplify", text: "What is $$\\frac{18x^3 y}{\\left(-3x y\\right)}$$?", variabilization: {}}, {id: "a161552poly2a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$-12y$$"], dependencies: ["a161552poly2a-h2"], title: "Simplify", text: "What is $$\\frac{36x y^2}{\\left(-3x y\\right)}$$?", variabilization: {}}, {id: "a161552poly2a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$-6x^2+12y$$"], dependencies: ["a161552poly2a-h3"], title: "Simplify", text: "What is $$negneg}\\left(6x^2\\right)-\\operatorname{\\left(-12y\\right)$$?", variabilization: {}}, ]; export {hints};