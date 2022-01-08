var hints = [{id: "b1a2a280bgaussian10a-h1", type: "hint", dependencies: [], title: "Augumented Matrix", text: "First, write the system of equations as an augumented matrix.", variabilization: {}}, {id: "b1a2a280bgaussian10a-h2", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$\\begin{bmatrix} -1 & -2 & 1 & -1 \\\\ 2 & 3 & 0 & 2 \\\\ 0 & 1 & -2 & 0 \\end{bmatrix}$$"], dependencies: ["b1a2a280bgaussian10a-h1"], title: "Augumented Matrix", text: "How do you write the system as an augumented matrix?", choices: ["$$\\begin{bmatrix} -1 & -2 & 1 & -1 \\\\ 2 & 3 & 0 & 2 \\\\ 0 & 1 & -2 & 0 \\end{bmatrix}$$", "$$\\begin{bmatrix} 1 & 2 & 1 & 1 \\\\ -2 & 3 & 0 & 2 \\\\ 0 & 1 & -2 & 0 \\end{bmatrix}$$", "$$\\begin{bmatrix} -1 & -2 & 1 & -1 \\\\ 2 & 3 & 0 & 2 \\\\ 4 & 1 & -2 & 1 \\end{bmatrix}$$"], subHints: [{id: "b1a2a280bgaussian10a-h2-s1", type: "hint", dependencies: [], title: "Answer", text: "The answer is $$\\begin{bmatrix} -1 & -2 & 1 & -1 \\\\ 2 & 3 & 0 & 2 \\\\ 0 & 1 & -2 & 0 \\end{bmatrix}$$.", variabilization: {}}], variabilization: {}}, {id: "b1a2a280bgaussian10a-h3", type: "hint", dependencies: ["b1a2a280bgaussian10a-h2"], title: "Obtain row-echelon form", text: "Now, perform row operations to obtain row-echelon form. You can start by multiplying row 1 by -1.", variabilization: {}}, {id: "b1a2a280bgaussian10a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\begin{bmatrix} 1 & 2 & -1 & 2 \\\\ 0 & 1 & -2 & 1 \\\\ 0 & 0 & 0 & 0 \\end{bmatrix}$$"], dependencies: ["b1a2a280bgaussian10a-h3"], title: "Obtain row-echelon form", text: "What is the new matrix in row-echelon form?", variabilization: {}}, {id: "b1a2a280bgaussian10a-h5", type: "hint", dependencies: ["b1a2a280bgaussian10a-h4"], title: "Interpret", text: "The last row of the matrix indicates $$0=0$$. This means that this is a dependent system with an $$infinite$$ number of solutions. Next, find the generic solution.", variabilization: {}}, {id: "b1a2a280bgaussian10a-h6", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$y=2z$$"], dependencies: ["b1a2a280bgaussian10a-h5"], title: "Solve", text: "Solve for y in terms of z. What does y equal?", choices: ["$$y=2z$$", "$$y=z$$", "$$y=4z$$", "None of the above"], subHints: [{id: "b1a2a280bgaussian10a-h6-s1", type: "hint", dependencies: [], title: "Answer", text: "The answer is $$y=2z$$.", variabilization: {}}], variabilization: {}}, {id: "b1a2a280bgaussian10a-h7", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["z=(1-x)/3,(1-x)/3"], dependencies: ["b1a2a280bgaussian10a-h6"], title: "Solve", text: "Now, solve for z in terms of x by plugging in $$y=2z$$ into the first equation. What does z equal?", choices: ["z=(1-x)/3,(1-x)/3", "$$z=\\frac{1-x}{3}$$", "$$z=1-x$$", "No Solution"], subHints: [{id: "b1a2a280bgaussian10a-h7-s1", type: "hint", dependencies: [], title: "Answer", text: "The answer is $$z=\\frac{1-x}{3}$$", variabilization: {}}], variabilization: {}}, {id: "b1a2a280bgaussian10a-h8", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$y=\\frac{2-2x}{3}$$"], dependencies: ["b1a2a280bgaussian10a-h7"], title: "Solve", text: "Finally, solve for y. Plug z into the second equation to solve it for y. What does equal in terms of x?", choices: ["$$y=\\frac{2-2x}{9}$$", "$$y=\\frac{2-2x}{3}$$", "No Solution"], subHints: [{id: "b1a2a280bgaussian10a-h8-s1", type: "hint", dependencies: [], title: "Answer", text: "The answer is $$y=\\frac{2-2x}{3}$$.", variabilization: {}}], variabilization: {}}, {id: "b1a2a280bgaussian10a-h9", type: "hint", dependencies: ["b1a2a280bgaussian10a-h8"], title: "Answer", text: "Therefore, the solution to the system is $$(\\frac{x\\left(2-2x\\right)}{3},\\frac{1-x}{3})$$.", variabilization: {}}, ]; export {hints};