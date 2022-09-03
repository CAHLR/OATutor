var hints = [{id: "affefa2poly9a-h1", type: "hint", dependencies: [], title: "Decompose", text: "Divide each term by the divisor. Be careful with the signs: $$\\frac{32x^2 y}{\\left(-8x y\\right)}$$ - $$\\frac{16x y^2}{\\left(-8x y\\right)}$$", variabilization: {}}, {id: "affefa2poly9a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$-4x$$"], dependencies: ["affefa2poly9a-h1"], title: "Simplify", text: "What is $$\\frac{32x^2 y}{\\left(-8x y\\right)}$$?", variabilization: {}}, {id: "affefa2poly9a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$-2y$$"], dependencies: ["affefa2poly9a-h2"], title: "Simplify", text: "What is $$\\frac{16x y^2}{\\left(-8x y\\right)}$$?", variabilization: {}}, {id: "affefa2poly9a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$-4x+2y$$"], dependencies: ["affefa2poly9a-h3"], title: "Simplify", text: "What is $$\\left(-4x\\right)-\\left(-2y\\right)$$?", variabilization: {}}, ]; export {hints};