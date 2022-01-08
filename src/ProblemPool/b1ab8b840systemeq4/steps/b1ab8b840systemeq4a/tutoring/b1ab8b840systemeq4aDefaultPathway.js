var hints = [{id: "b1ab8b840systemeq4a-h1", type: "hint", dependencies: [], title: "Using substitution", text: "The first step is to write one of the equations in terms of one of the variables.", variabilization: {}}, {id: "b1ab8b840systemeq4a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$x=32-\\frac{2}{3} y$$"], dependencies: ["b1ab8b840systemeq4a-h1"], title: "Writing one of the equations in terms of one of the variables", text: "Write the first equation in terms of y (solve for x). What is the resulting equation?", variabilization: {}}, {id: "b1ab8b840systemeq4a-h3", type: "hint", dependencies: ["b1ab8b840systemeq4a-h2"], title: "Solving the system", text: "The next step is to plug in the rewritten equation into the other equation and solve for the remaining variable.", variabilization: {}}, {id: "b1ab8b840systemeq4a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{6} \\left(32-\\frac{2}{3} y\\right)+\\frac{1}{4} y=9$$"], dependencies: ["b1ab8b840systemeq4a-h3"], title: "Solving for y", text: "What is the resulting equation after you plug the first one in? Do not simplify.", variabilization: {}}, {id: "b1ab8b840systemeq4a-h5", type: "hint", dependencies: ["b1ab8b840systemeq4a-h4"], title: "Solving for x", text: "The last step is to plug in the value you got for y into one of the equations to solve for x.", variabilization: {}}, ]; export {hints};