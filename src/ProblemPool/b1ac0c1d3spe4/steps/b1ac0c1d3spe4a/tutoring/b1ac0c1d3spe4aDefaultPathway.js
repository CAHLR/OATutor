var hints = [{id: "b1ac0c1d3spe4a-h1", type: "hint", dependencies: [], title: "Addition Binomial Square Formula", text: "We compare our expression to the addition binomial square formula: $${\\left(a+b\\right)}^2=a^2+2a b+b^2$$.", variabilization: {}}, {id: "b1ac0c1d3spe4a-h2", type: "hint", dependencies: ["b1ac0c1d3spe4a-h1"], title: "Compare the Binomial", text: "$${\\left(a+b\\right)}^2$$ $${\\left(y+\\frac{1}{4}\\right)}^2$$", variabilization: {}}, {id: "b1ac0c1d3spe4a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["y"], dependencies: ["b1ac0c1d3spe4a-h2"], title: "Identify a", text: "What is a in the expression?", variabilization: {}}, {id: "b1ac0c1d3spe4a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{4}$$"], dependencies: ["b1ac0c1d3spe4a-h3"], title: "Identify b", text: "What is b in the expression?", variabilization: {}}, {id: "b1ac0c1d3spe4a-h5", type: "hint", dependencies: ["b1ac0c1d3spe4a-h3", "b1ac0c1d3spe4a-h4"], title: "Plug in the Terms", text: "Substitute $$a=y$$ and $$b=\\frac{1}{4}$$ into the addition binomial square formula: $${\\left(a+b\\right)}^2=a^2+2a b+b^2$$ $${\\left(y+\\frac{1}{4}\\right)}^2=y^2+\\frac{2y\\times1}{4}+{\\left(\\frac{1}{4}\\right)}^2$$", variabilization: {}}, {id: "b1ac0c1d3spe4a-h6", type: "hint", dependencies: ["b1ac0c1d3spe4a-h5"], title: "Simplify", text: "$$y^2+\\frac{1}{2} y+\\frac{1}{16}$$", variabilization: {}}, ]; export {hints};