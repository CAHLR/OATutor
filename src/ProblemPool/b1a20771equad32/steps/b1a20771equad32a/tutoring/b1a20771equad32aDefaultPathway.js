var hints = [{id: "b1a20771equad32a-h1", type: "hint", dependencies: [], title: "Finding the LCM", text: "Multiply a and c (12 and 2).", variabilization: {}}, {id: "b1a20771equad32a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["24"], dependencies: ["b1a20771equad32a-h1"], title: "Finding the LCM", text: "What is $$12\\times2$$?", variabilization: {}}, {id: "b1a20771equad32a-h3", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["3, 8"], dependencies: ["b1a20771equad32a-h2"], title: "Finding Factors", text: "List the factors of 24. Which pair of factors equals 11?", variabilization: {}}, {id: "b1a20771equad32a-h4", type: "hint", dependencies: ["b1a20771equad32a-h3"], title: "Finding Factors", text: "Separate 11x into 3x and 8x.", variabilization: {}}, {id: "b1a20771equad32a-h5", type: "hint", dependencies: ["b1a20771equad32a-h4"], title: "Finding Factors", text: "Rewrite quadratic equation as $$12x^2+3x+8x+2=0$$.", variabilization: {}}, {id: "b1a20771equad32a-h6", type: "hint", dependencies: ["b1a20771equad32a-h5"], title: "Finding Factors", text: "Find a common factor between the first two terms.", variabilization: {}}, {id: "b1a20771equad32a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3x"], dependencies: ["b1a20771equad32a-h6"], title: "Finding Factors", text: "What is the common term?", variabilization: {}}, {id: "b1a20771equad32a-h8", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$3x \\left(4x+1\\right)$$"], dependencies: ["b1a20771equad32a-h7"], title: "Finding Factors", text: "Factor out the common term. What are the first two terms now?", variabilization: {}}, {id: "b1a20771equad32a-h9", type: "hint", dependencies: ["b1a20771equad32a-h8"], title: "Finding Factors", text: "Find a common factor between the last two terms.", variabilization: {}}, {id: "b1a20771equad32a-h10", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["2"], dependencies: ["b1a20771equad32a-h9"], title: "Finding Factors", text: "What is the common term?", variabilization: {}}, {id: "b1a20771equad32a-h11", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$2\\left(4x+1\\right)$$"], dependencies: ["b1a20771equad32a-h10"], title: "Finding Factors", text: "Factor out the common term. What are the first two terms now?", variabilization: {}}, {id: "b1a20771equad32a-h12", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$4x+1$$"], dependencies: ["b1a20771equad32a-h11"], title: "Finding Factors", text: "Factor out the common expression. What is the common expression?", variabilization: {}}, {id: "b1a20771equad32a-h13", type: "hint", dependencies: ["b1a20771equad32a-h12"], title: "Finding Factors", text: "Rewrite the quadratic equation as $$\\left(4x+1\\right) \\left(3x+2\\right)=0$$.", variabilization: {}}, {id: "b1a20771equad32a-h14", type: "hint", dependencies: ["b1a20771equad32a-h13"], title: "Finding Factors", text: "Use zero-product property to find the solutions.", variabilization: {}}, {id: "b1a20771equad32a-h15", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{-1}{4}$$"], dependencies: ["b1a20771equad32a-h14"], title: "Finding Factors", text: "What is the solution of $$4x+1=0$$?", variabilization: {}}, {id: "b1a20771equad32a-h16", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{-2}{3}$$"], dependencies: ["b1a20771equad32a-h15"], title: "Finding Factors", text: "What is the solution of $$3x+2=0$$", variabilization: {}}, {id: "b1a20771equad32a-h17", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["-1/4, -2/3"], dependencies: ["b1a20771equad32a-h16"], title: "Finding Factors", text: "What are the solutions? (please format as: x, y)", variabilization: {}}, ]; export {hints};