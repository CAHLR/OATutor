var hints = [{id: "b1acf3da9gaussian8a-h1", type: "hint", dependencies: [], title: "Convert", text: "The first row already has a 1 in row 1, column 1. The next step is to multiply row 1 by -2 and add it to row 2. Then replace row 2 with the result.", variabilization: {}}, {id: "b1acf3da9gaussian8a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\begin{bmatrix} 1 & -3 & 4 & 3 \\\\ 0 & 1 & -2 & 0 \\\\ -3 & 3 & 4 & 6 \\end{bmatrix}$$"], dependencies: ["b1acf3da9gaussian8a-h1"], title: "Multiply and add", text: "What is the new matrix after multiplying row 1 by -2 and adding it to row 2?", subHints: [{id: "b1acf3da9gaussian8a-h2-s1", type: "hint", dependencies: [], title: "Answer", text: "The answer is $$\\begin{bmatrix} 1 & -3 & 4 & 3 \\\\ 0 & 1 & -2 & 0 \\\\ -3 & 3 & 4 & 6 \\end{bmatrix}$$", variabilization: {}}], variabilization: {}}, {id: "b1acf3da9gaussian8a-h3", type: "hint", dependencies: ["b1acf3da9gaussian8a-h2"], title: "Obtain zero", text: "Now, multiply row 1 by 3 and add it to row 3 to get a zero in the row 3 column 1 spot. The new matrix is $$\\begin{bmatrix} 1 & -3 & 4 & 3 \\\\ 0 & 1 & -2 & 0 \\\\ 0 & -6 & 16 & 15 \\end{bmatrix}$$.", variabilization: {}}, {id: "b1acf3da9gaussian8a-h4", type: "hint", dependencies: ["b1acf3da9gaussian8a-h3"], title: "Obtain zero", text: "Next, multiply row 2 by 6 and add it to row 3. This results in the matrix: $$\\begin{bmatrix} 1 & -3 & 4 & 3 \\\\ 0 & 1 & -2 & 0 \\\\ 0 & 0 & 4 & 15 \\end{bmatrix}$$.", variabilization: {}}, {id: "b1acf3da9gaussian8a-h5", type: "hint", dependencies: ["b1acf3da9gaussian8a-h4"], title: "Obtain zero", text: "Now, multiply row 3 by $$\\frac{1}{4}$$. The new matrix is: $$\\begin{bmatrix} 1 & -3 & 4 & 3 \\\\ 0 & 1 & -2 & 0 \\\\ 0 & 0 & 1 & \\frac{15}{4} \\end{bmatrix}$$.", variabilization: {}}, {id: "b1acf3da9gaussian8a-h6", type: "hint", dependencies: ["b1acf3da9gaussian8a-h5"], title: "Answer", text: "Therefore the final answer is $$\\begin{bmatrix} 1 & -3 & 4 & 3 \\\\ 0 & 1 & -2 & 0 \\\\ 0 & 0 & 1 & \\frac{15}{4} \\end{bmatrix}$$.", variabilization: {}}, ]; export {hints};