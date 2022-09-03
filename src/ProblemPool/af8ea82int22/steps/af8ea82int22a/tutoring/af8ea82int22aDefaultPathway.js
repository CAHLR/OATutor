var hints = [{id: "af8ea82int22a-h1", type: "hint", dependencies: [], title: "Simplify the Parantheses", text: "Because of order of operations, we must first simplify the expression in the parantheses", variabilization: {}}, {id: "af8ea82int22a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-7"], dependencies: ["af8ea82int22a-h1"], title: "Simplify the Parantheses", text: "What is (-4-3)?", variabilization: {}}, {id: "af8ea82int22a-h3", type: "hint", dependencies: ["af8ea82int22a-h2"], title: "Solve the Expression", text: "Once the expression in the parantheses is solved into a number, subtract (from left to right because of the order of operations) to solve the expression", variabilization: {}}, {id: "af8ea82int22a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["14"], dependencies: ["af8ea82int22a-h3"], title: "Solve the Expression", text: "What is 7-(-7)?", variabilization: {}}, {id: "af8ea82int22a-h5", type: "hint", dependencies: ["af8ea82int22a-h3"], title: "Solve the Expression", text: "Subtracting -7 is the same as adding 7, since the two negative signs (one from the subtraction, the other from -7) cancel out into a +", subHints: [{id: "af8ea82int22a-h4-s1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["14"], dependencies: [], title: "Solve the Expression", text: "What is $$7+7$$?", variabilization: {}}, ], variabilization: {}}, {id: "af8ea82int22a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["5"], dependencies: ["af8ea82int22a-h4"], title: "Solve the Expression", text: "What is 14-9?", variabilization: {}}, ]; export {hints};