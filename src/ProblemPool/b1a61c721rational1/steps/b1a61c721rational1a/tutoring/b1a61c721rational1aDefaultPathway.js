var hints = [{id: "b1a61c721rational1a-h1", type: "hint", dependencies: [], title: "Factor the expression", text: "Factoring is the process to split a product into a group of factors (a multiplication of simpler expressions).", variabilization: {}}, {id: "b1a61c721rational1a-h2", type: "hint", dependencies: ["b1a61c721rational1a-h1"], title: "Factor the expression", text: "Not all terms can be factored. Factor the terms that can be split further.", variabilization: {}}, {id: "b1a61c721rational1a-h3", type: "hint", dependencies: ["b1a61c721rational1a-h2"], title: "Factor the expression", text: "In this case, we can factor $$x^2+4x-5$$ and $$3x+18$$.", variabilization: {}}, {id: "b1a61c721rational1a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\left(x+5\\right) \\left(x-1\\right)$$"], dependencies: ["b1a61c721rational1a-h3"], title: "Factor the expression", text: "What does $$x^2+4x-5$$ factor into?", variabilization: {}}, {id: "b1a61c721rational1a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$3\\left(x+6\\right)$$"], dependencies: ["b1a61c721rational1a-h4"], title: "Factor the expression", text: "What does $$3x+18$$ factor into?", variabilization: {}}, {id: "b1a61c721rational1a-h6", type: "hint", dependencies: ["b1a61c721rational1a-h5"], title: "Cancel terms", text: "Now that you have factored all possible terms, if you see the same term in the numerator and the denominator of the product, you can cancel it out.", variabilization: {}}, {id: "b1a61c721rational1a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$x+5$$"], dependencies: ["b1a61c721rational1a-h6"], title: "Cancel terms", text: "What term can we cancel out?", variabilization: {}}, {id: "b1a61c721rational1a-h8", type: "hint", dependencies: ["b1a61c721rational1a-h7"], title: "Final Answer", text: "After canceling out terms, your final answer will remain in product form. What is the answer?", variabilization: {}}, ]; export {hints};