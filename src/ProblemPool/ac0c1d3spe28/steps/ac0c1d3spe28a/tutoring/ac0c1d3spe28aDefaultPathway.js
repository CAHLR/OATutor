var hints = [{id: "ac0c1d3spe28a-h1", type: "hint", dependencies: [], title: "Product of Conjugates Pattern", text: "We compare our expression to the product of conjugates pattern formula: $$\\left(a-b\\right) \\left(a+b\\right)=a^2-b^2$$.", variabilization: {}}, {id: "ac0c1d3spe28a-h2", type: "hint", dependencies: ["ac0c1d3spe28a-h1"], title: "Compare the Binomials", text: "$$\\left(a-b\\right) \\left(a+b\\right)$$ $$\\left(c-\\left(5\\right)\\right) \\left(c+\\left(5\\right)\\right)$$", variabilization: {}}, {id: "ac0c1d3spe28a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["c"], dependencies: ["ac0c1d3spe28a-h2"], title: "Identify a", text: "What is a in the expression?", variabilization: {}}, {id: "ac0c1d3spe28a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["5"], dependencies: ["ac0c1d3spe28a-h3"], title: "Identify b", text: "What is b in the expression?", variabilization: {}}, {id: "ac0c1d3spe28a-h5", type: "hint", dependencies: ["ac0c1d3spe28a-h3", "ac0c1d3spe28a-h4"], title: "Plug in the Terms", text: "Substitute $$a=c$$ and $$b=5$$ into the product of conjugates pattern formula: $$\\left(a-b\\right) \\left(a+b\\right)=a^2-b^2$$ $$\\left(c-\\left(5\\right)\\right) \\left(c+\\left(5\\right)\\right)=c^2-{\\left(5\\right)}^2$$", variabilization: {}}, {id: "ac0c1d3spe28a-h6", type: "hint", dependencies: ["ac0c1d3spe28a-h5"], title: "Simplify", text: "$$c^2-\\left(25\\right)$$", variabilization: {}}, ]; export {hints};