var hints = [{id: "b1a0cc26bpoly3a-h1", type: "hint", dependencies: [], title: "Distribute the Negative Sign", text: "The first step is to distribute the negative sign to make the second expression negative. This will make the second part of the problem $$-5x^3+2x^3-3x-2$$. Now we can combine like terms.", variabilization: {}}, {id: "b1a0cc26bpoly3a-h2", type: "hint", dependencies: ["b1a0cc26bpoly3a-h1"], title: "Grouping Like Terms", text: "$$7x^4$$, $$-5x^2$$, and $$x^2$$ are all the only terms being multiplied by their respective variables, so these cannot be simplified further. However, we can simplify the x and constant terms.", variabilization: {}}, {id: "b1a0cc26bpoly3a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3x"], dependencies: ["b1a0cc26bpoly3a-h2"], title: "Combining x Terms", text: "6x and -3x can be added together to simplify the x term. What is 6x-3x?", variabilization: {}}, {id: "b1a0cc26bpoly3a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-1"], dependencies: ["b1a0cc26bpoly3a-h3"], title: "Combining Constants", text: "To get the constant term, we have to add 1 and -2. What is $$1+\\left(-2\\right)$$?", variabilization: {}}, {id: "b1a0cc26bpoly3a-h5", type: "hint", dependencies: ["b1a0cc26bpoly3a-h4"], title: "Simplified Expression", text: "Since there are no more terms to simplify, we can write the expression as the sum of the simplified terms: $$7x^4$$ $$-5x^3+x^2+3x-1$$.", variabilization: {}}, ]; export {hints};