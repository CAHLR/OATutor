var hints = [{id: "b1a512f5aexplog10a-h1", type: "hint", dependencies: [], title: "Isolating the terms with exponents", text: "The first step is to move all the terms with exponents to one side of the equation.", variabilization: {}}, {id: "b1a512f5aexplog10a-h2", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["No"], dependencies: ["b1a512f5aexplog10a-h1"], title: "Determine if terms have a common base.", text: "Do the terms have a common base?", choices: ["Yes", "No"], variabilization: {}}, {id: "b1a512f5aexplog10a-h3", type: "hint", dependencies: ["b1a512f5aexplog10a-h2"], title: "Solving for x", text: "The next step is to take ln of both sides. While the choice of which base does not matter, it will be easier to use ln in this case.", variabilization: {}}, {id: "b1a512f5aexplog10a-h4", type: "hint", dependencies: ["b1a512f5aexplog10a-h3"], title: "Properties of logarithms", text: "Recall that $${\\ln(b)}^a$$ $$=$$ $$a \\ln(b)$$.", variabilization: {}}, {id: "b1a512f5aexplog10a-h5", type: "hint", dependencies: ["b1a512f5aexplog10a-h4"], title: "Distributive Property", text: "Recall that $$a \\left(x+y\\right)$$ $$=$$ $$a x+a y$$.", variabilization: {}}, ]; export {hints};