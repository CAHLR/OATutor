var hints = [{id: "b1a171b3arationals2a-h1", type: "hint", dependencies: [], title: "Dissecting the Denominator", text: "For a fraction, the expression would be undefined if the denominator was zero. Therefore, set the denominator equal to zero then solve for the variable.", variabilization: {}}, {id: "b1a171b3arationals2a-h2", type: "hint", dependencies: ["b1a171b3arationals2a-h1"], title: "Solving a Quadratic Equation", text: "Setting the denominator equal to 0 would result in the following equation: $$x^2+5x+6$$ $$=$$ 0. In order to solve this we must factor out the equation.", variabilization: {}}, {id: "b1a171b3arationals2a-h3", type: "hint", dependencies: ["b1a171b3arationals2a-h2"], title: "Factored Equation", text: "The factored form of the equation is $$\\left(x+2\\right) \\left(x+3\\right)=0$$.", variabilization: {}}, {id: "b1a171b3arationals2a-h4", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["-2 or -3"], dependencies: ["b1a171b3arationals2a-h3"], title: "Solving for the Value", text: "What are the value(s) for \"x\" that make the factored equation true?", choices: ["-2 or -3", "5 or 6", "-5 or 2I1 or -6"], variabilization: {}}, ]; export {hints};