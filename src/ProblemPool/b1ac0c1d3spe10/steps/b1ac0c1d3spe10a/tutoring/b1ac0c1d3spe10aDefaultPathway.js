var hints = [{id: "b1ac0c1d3spe10a-h1", type: "hint", dependencies: [], title: "Subtraction Binomial Square Formula", text: "We compare our expression to the subtraction binomial square formula: $${\\left(a-b\\right)}^2=a^2-2a b+b^2$$.", variabilization: {}}, {id: "b1ac0c1d3spe10a-h2", type: "hint", dependencies: ["b1ac0c1d3spe10a-h1"], title: "Compare the Binomial", text: "$${\\left(a-b\\right)}^2$$ $${\\left(p-13\\right)}^2$$", variabilization: {}}, {id: "b1ac0c1d3spe10a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["p"], dependencies: ["b1ac0c1d3spe10a-h2"], title: "Identify a", text: "What is a in the expression?", variabilization: {}}, {id: "b1ac0c1d3spe10a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["13"], dependencies: ["b1ac0c1d3spe10a-h3"], title: "Identify b", text: "What is b in the expression?", variabilization: {}}, {id: "b1ac0c1d3spe10a-h5", type: "hint", dependencies: ["b1ac0c1d3spe10a-h3", "b1ac0c1d3spe10a-h4"], title: "Plug in the Terms", text: "Substitute $$a=p$$ and $$b=13$$ into the subtraction binomial square formula: $${\\left(a-b\\right)}^2=a^2+2a b+b^2$$ $${\\left(p-13\\right)}^2=p^2-2p\\times13+{13}^2$$", variabilization: {}}, {id: "b1ac0c1d3spe10a-h6", type: "hint", dependencies: ["b1ac0c1d3spe10a-h5"], title: "Simplify", text: "$$p^2-26p+169$$", variabilization: {}}, ]; export {hints};