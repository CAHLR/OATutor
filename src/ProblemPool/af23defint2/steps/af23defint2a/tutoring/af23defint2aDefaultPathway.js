var hints = [{id: "af23defint2a-h1", type: "hint", dependencies: [], title: "Order of Operation", text: "Start with the operation in the parenthesis", variabilization: {}}, {id: "af23defint2a-h2", type: "hint", dependencies: ["af23defint2a-h1"], title: "Absolute Values", text: "Simplify the value in the absolute value bars further by subtracting 8 from 11", variabilization: {}}, {id: "af23defint2a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["6"], dependencies: ["af23defint2a-h2"], title: "Absolute Values Principle", text: "What is |6|?", variabilization: {}}, {id: "af23defint2a-h4", type: "hint", dependencies: ["af23defint2a-h3"], title: "Absolute Values Principle", text: "The number within absolute sign will always be positive", variabilization: {}}, {id: "af23defint2a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["6"], dependencies: ["af23defint2a-h4"], title: "Magnitude of Number", text: "What is the magitude of 6?", variabilization: {}}, ]; export {hints};