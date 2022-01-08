var hints = [{id: "b1ac0c1d3spe1a-h1", type: "hint", dependencies: [], title: "Addition Binomial Square Formula", text: "We compare our expression to the addition binomial square formula: $${\\left(a+b\\right)}^2=a^2+2a b+b^2$$.", variabilization: {}}, {id: "b1ac0c1d3spe1a-h2", type: "hint", dependencies: ["b1ac0c1d3spe1a-h1"], title: "Compare the Binomial", text: "$${\\left(a+b\\right)}^2$$ $${\\left(x+5\\right)}^2$$", variabilization: {}}, {id: "b1ac0c1d3spe1a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["x"], dependencies: ["b1ac0c1d3spe1a-h2"], title: "Identify a", text: "What is a in the expression?", variabilization: {}}, {id: "b1ac0c1d3spe1a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["5"], dependencies: ["b1ac0c1d3spe1a-h3"], title: "Identify b", text: "What is b in the expression?", variabilization: {}}, {id: "b1ac0c1d3spe1a-h5", type: "hint", dependencies: ["b1ac0c1d3spe1a-h3", "b1ac0c1d3spe1a-h4"], title: "Plug in the Terms", text: "Substitute $$a=x$$ and $$b=5$$ into the addition binomial square formula: $${\\left(a+b\\right)}^2=a^2+2a b+b^2$$ $${\\left(x+5\\right)}^2=x^2+2x\\times5+5^2$$", variabilization: {}}, {id: "b1ac0c1d3spe1a-h6", type: "hint", dependencies: ["b1ac0c1d3spe1a-h5"], title: "Simplify", text: "$$x^2+10x+25$$", variabilization: {}}, ]; export {hints};