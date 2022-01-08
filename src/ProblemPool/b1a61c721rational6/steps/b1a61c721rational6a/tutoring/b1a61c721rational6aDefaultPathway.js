var hints = [{id: "b1a61c721rational6a-h1", type: "hint", dependencies: [], title: "Factor the expression", text: "Factoring is the process to split a product into a group of factors (a multiplication of simpler expressions).", variabilization: {}}, {id: "b1a61c721rational6a-h2", type: "hint", dependencies: ["b1a61c721rational6a-h1"], title: "Factor the expression", text: "Not all terms can be factored. Factor the terms that can be split further.", variabilization: {}}, {id: "b1a61c721rational6a-h3", type: "hint", dependencies: ["b1a61c721rational6a-h2"], title: "Factor the expression", text: "In this case, we should factor all the expressions.", variabilization: {}}, {id: "b1a61c721rational6a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\left(3x-4\\right) \\left(3x+4\\right)$$"], dependencies: ["b1a61c721rational6a-h3"], title: "Factor the expression", text: "What does $$9x^2-16$$ factor to?", variabilization: {}}, {id: "b1a61c721rational6a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\left(3x-4\\right) \\left(x+7\\right)$$"], dependencies: ["b1a61c721rational6a-h4"], title: "Factor the expression", text: "What does $$3x^2+17x-28$$ factor to?", variabilization: {}}, {id: "b1a61c721rational6a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\left(x+7\\right) \\left(x-2\\right)$$"], dependencies: ["b1a61c721rational6a-h5"], title: "Factor the expression", text: "What does $$x^2+5x-14$$ factor to?", variabilization: {}}, {id: "b1a61c721rational6a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\left(x-2\\right) \\left(3x+4\\right)$$"], dependencies: ["b1a61c721rational6a-h6"], title: "Factor the expression", text: "What does $$3x^2-2x-8$$ factor to?", variabilization: {}}, {id: "b1a61c721rational6a-h8", type: "hint", dependencies: ["b1a61c721rational6a-h7"], title: "Cancel terms", text: "Now that you have factored all possible terms, if you see the same term in the numerator and the denominator of the product, you can cancel it out.", variabilization: {}}, {id: "b1a61c721rational6a-h9", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["1"], dependencies: ["b1a61c721rational6a-h8"], title: "Cancel terms", text: "In this case, we can cancel every single term out. What is our final answer?", variabilization: {}}, ]; export {hints};