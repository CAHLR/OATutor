var hints = [{id: "b1a372017cramer2a-h1", type: "hint", dependencies: [], title: "Augument", text: "First, augument the matrix with the first two columns. In other words, duplicate the first two columns, and add them to the end of the matrix.", variabilization: {}}, {id: "b1a372017cramer2a-h2", type: "hint", dependencies: ["b1a372017cramer2a-h1"], title: "Formula", text: "Now, follow the formula to find the determinant. First, multiply the entries down from the row 1 column one spot, to the row 3 column 3 spot, in a diagonal fashion. Do this for the next two diagonals as well, from the row 1 column 2 spot, to the row 3 column 4 spot, and from the row 1 column 3 spot to the row 3 column 5 spot.", variabilization: {}}, {id: "b1a372017cramer2a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0"], dependencies: ["b1a372017cramer2a-h2"], title: "Add", text: "Now, add all the previous products together. What do you get as your answer?", subHints: [{id: "b1a372017cramer2a-h3-s1", type: "hint", dependencies: [], title: "Answer", text: "The answer is 0.", variabilization: {}}], variabilization: {}}, {id: "b1a372017cramer2a-h4", type: "hint", dependencies: ["b1a372017cramer2a-h3"], title: "Multiply", text: "Next, multiply the values from the bottom left of the matrix to the location 3 spots to the top in a diagonal. Another way to see this is a diagonal from the bottom to the top. Do this for the next 2 columns.", variabilization: {}}, {id: "b1a372017cramer2a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-1"], dependencies: ["b1a372017cramer2a-h4"], title: "Subtract", text: "Now, subtract all the values that were just multiplied from the first set of diagonal multiplications(those that you calculated previously).", subHints: [{id: "b1a372017cramer2a-h5-s1", type: "hint", dependencies: [], title: "Answer", text: "The answer is -1.", variabilization: {}}], variabilization: {}}, {id: "b1a372017cramer2a-h6", type: "hint", dependencies: ["b1a372017cramer2a-h5"], title: "Answer", text: "Therefore, the determinant is -1.", variabilization: {}}, ]; export {hints};