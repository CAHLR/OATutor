var hints = [{id: "b1a012999exa26a-h1", type: "hint", dependencies: [], title: "Multiply", text: "Multiply the outside value with each of the inside parenthesis values", variabilization: {}}, {id: "b1a012999exa26a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$-\\left(b^2\\right)$$"], dependencies: ["b1a012999exa26a-h1"], title: "Multiply pt2", text: "What is -b times b?", variabilization: {}}, {id: "b1a012999exa26a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-9b"], dependencies: ["b1a012999exa26a-h2"], title: "Multiply pt3", text: "What is -b times 9?", variabilization: {}}, {id: "b1a012999exa26a-h4", type: "hint", dependencies: ["b1a012999exa26a-h3"], title: "Combine", text: "Combine the values multiplied", variabilization: {}}, ]; export {hints};