var hints = [{id: "addand3a-h1", type: "hint", dependencies: [], title: "Subtract", text: "Subtract the numerators and place the difference over the common denominator.", variabilization: {}}, {id: "addand3a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-14"], dependencies: ["addand3a-h1"], title: "Numerator", text: "What do we get for the numerator after subtracting the two?", variabilization: {}}, {id: "addand3a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{-\\left(14\\right)}{x}$$"], dependencies: ["addand3a-h2"], title: "Final Answer", text: "What do we get after placing the difference over the common denominator?", variabilization: {}}, ]; export {hints};