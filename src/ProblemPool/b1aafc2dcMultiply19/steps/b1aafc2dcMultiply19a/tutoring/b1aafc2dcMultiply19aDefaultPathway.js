var hints = [{id: "b1aafc2dcMultiply19a-h1", type: "hint", dependencies: [], title: "Multiply", text: "We need to multiply first.", variabilization: {}}, {id: "b1aafc2dcMultiply19a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-30"], dependencies: ["b1aafc2dcMultiply19a-h1"], title: "Multiply", text: "What do we get for $$5\\left(-6\\right)$$?", variabilization: {}}, {id: "b1aafc2dcMultiply19a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-14"], dependencies: ["b1aafc2dcMultiply19a-h2"], title: "Multiply", text: "What do we get for $$7\\left(-2\\right)$$?", variabilization: {}}, {id: "b1aafc2dcMultiply19a-h4", type: "hint", dependencies: ["b1aafc2dcMultiply19a-h3"], title: "Add", text: "We then need to add -30 and -14.", variabilization: {}}, {id: "b1aafc2dcMultiply19a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-44"], dependencies: ["b1aafc2dcMultiply19a-h4"], title: "Add", text: "What do we get after the addition?", variabilization: {}}, {id: "b1aafc2dcMultiply19a-h6", type: "hint", dependencies: ["b1aafc2dcMultiply19a-h5"], title: "Subtract", text: "We then need to subtract 3 from -44.", variabilization: {}}, {id: "b1aafc2dcMultiply19a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-47"], dependencies: ["b1aafc2dcMultiply19a-h6"], title: "Subtract", text: "What do we get after the subtraction?", variabilization: {}}, ]; export {hints};