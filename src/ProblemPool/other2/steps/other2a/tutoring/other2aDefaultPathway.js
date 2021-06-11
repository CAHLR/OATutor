var hints = [{id: "other2a-h1", type: "hint", dependencies: [], title: "Factoring", text: "Find the greatest common factor between the two terms.", variabilization: {}}, {id: "other2a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["y"], dependencies: ["other2a-h1"], title: "Factoring", text: "What is it?", variabilization: {}}, {id: "other2a-h3", type: "hint", dependencies: ["other2a-h2"], title: "Factoring", text: "Factor out y.", variabilization: {}}, {id: "other2a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\left(4\\right) y^2-\\left(9\\right)$$"], dependencies: ["other2a-h3"], title: "Factoring", text: "What expression is left?", variabilization: {}}, {id: "other2a-h5", type: "hint", dependencies: ["other2a-h4"], title: "Zero-Product Property", text: "Use the Zero-Product property to solve for y.", variabilization: {}}, {id: "other2a-h6", type: "hint", dependencies: ["other2a-h5"], title: "Zero-Product Property", text: "Solve for y when $$y=0$$.", variabilization: {}}, {id: "other2a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0"], dependencies: ["other2a-h6"], title: "Zero-Product Property", text: "What is the solution for y?", variabilization: {}}, {id: "other2a-h8", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$\\frac{3}{2}-\\frac{3}{2}$$"], dependencies: ["other2a-h7"], title: "Zero-Product Property", text: "Solve for y when $$\\left(4\\right) y^{-\\left(9\\right)}=0$$. What is y?", choices: ["$$\\frac{2}{3}-\\frac{2}{3}$$", "$$\\frac{3}{2}-\\frac{3}{2}$$"], variabilization: {}}, {id: "other2a-s1", type: "hint", dependencies: [], title: "Solving Equations", text: "Add 9 to both sides.", subHints: [{id: "other2a-h8-s2", type: "hint", dependencies: ["other2a-s1"], title: "Solving Equations", text: "Divide both sides by 4.", variabilization: {}}, {id: "other2a-h8-s3", type: "hint", dependencies: ["other2a-h8-s2"], title: "Solving Equations", text: "Take the square root of both sides.", variabilization: {}}, {id: "other2a-h8-s4", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$\\frac{3}{2}$$, $$\\frac{-\\left(3\\right)}{2}$$"], dependencies: ["other2a-h8-s3"], title: "Solving Equations", text: "What is the square root of $$\\frac{4}{9}$$? (Remember that it can be positive or negative).", choices: ["$$\\frac{2}{3}-\\frac{2}{3}$$", "$$\\frac{3}{2}-\\frac{3}{2}$$"], variabilization: {}}, {id: "other2a-h8-h1", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$\\frac{3}{2}$$, $$\\frac{-\\left(3\\right)}{2}$$"], dependencies: ["other2a-h8-s4"], title: "Solving Equations", text: "Solve for y. What is y equal to?", choices: ["$$\\frac{2}{3}-\\frac{2}{3}$$", "$$\\frac{3}{2}-\\frac{3}{2}$$"], variabilization: {}}, ], variabilization: {}}, {id: "other2a-h2", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["0,3/2,-3/2"], dependencies: ["other2a-h8-h1"], title: "Solving Polynomial Equations", text: "What are the 3 solutions of the equation?", choices: ["0,2/3,-2/3", "0,3/2,-3/2"], variabilization: {}}, ]; export {hints};