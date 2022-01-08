var hints = [{id: "b1a6014eaSubAdd1a-h1", type: "hint", dependencies: [], title: "Substitution", text: "Substitute the number in for the variable in the equation.", variabilization: {}}, {id: "b1a6014eaSubAdd1a-h2", type: "hint", dependencies: ["b1a6014eaSubAdd1a-h1"], title: "Substitution", text: "After substituting $$x=\\frac{3}{2}$$ into the equation, we get $$4\\frac{3}{2}-2=2\\frac{3}{2}+1$$.", variabilization: {}}, {id: "b1a6014eaSubAdd1a-h3", type: "hint", dependencies: ["b1a6014eaSubAdd1a-h2"], title: "Simplification", text: "Simplify the expressions on both sides of the equation.", variabilization: {}}, {id: "b1a6014eaSubAdd1a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["6-2"], dependencies: ["b1a6014eaSubAdd1a-h3"], title: "Simplification", text: "Simplify the left side of the equation.", variabilization: {}}, {id: "b1a6014eaSubAdd1a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$3+1$$"], dependencies: ["b1a6014eaSubAdd1a-h4"], title: "Simplification", text: "Simplify the right side of the equation.", variabilization: {}}, {id: "b1a6014eaSubAdd1a-h6", type: "hint", dependencies: ["b1a6014eaSubAdd1a-h5"], title: "Comparison", text: "Determine whether the resulting equation is true.", variabilization: {}}, {id: "b1a6014eaSubAdd1a-h7", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["TRUE"], dependencies: ["b1a6014eaSubAdd1a-h6"], title: "Comparison", text: "Determine whether 6-2 equals $$3+1$$.", choices: ["TRUE", "FALSE"], variabilization: {}}, ]; export {hints};