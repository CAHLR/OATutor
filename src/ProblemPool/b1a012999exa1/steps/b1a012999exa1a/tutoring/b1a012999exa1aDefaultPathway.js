var hints = [{id: "b1a012999exa1a-h1", type: "hint", dependencies: [], title: "Multiply", text: "Multiply the outside value with each of the inside parenthesis values", variabilization: {}}, {id: "b1a012999exa1a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["4x"], dependencies: ["b1a012999exa1a-h1"], title: "Multiply pt2", text: "What is 4 times x?", variabilization: {}}, {id: "b1a012999exa1a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["12"], dependencies: ["b1a012999exa1a-h2"], title: "Multiply pt3", text: "What is 4 times 3?", variabilization: {}}, {id: "b1a012999exa1a-h4", type: "hint", dependencies: ["b1a012999exa1a-h3"], title: "Combine", text: "Combine the values multiplied", variabilization: {}}, ]; export {hints};