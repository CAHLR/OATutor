var hints = [{id: "af4e405log19a-h1", type: "hint", dependencies: [], title: "Convert to Exponential Form", text: "We know that we're trying to solve $$\\log_{2}\\left(5x-1\\right)=6$$. Rewrite this expression first into exponential form.", variabilization: {}}, {id: "af4e405log19a-h2", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$2^6=5x-1$$"], dependencies: ["af4e405log19a-h1"], title: "Determing the Exponential Form", text: "What is the exponential form of $$\\log_{2}\\left(5x-1\\right)=6$$?", choices: ["$$2^6=5x-1$$", "$$6^2=5x-1$$", "$${\\left(5x-1\\right)}^2=6$$", "$${\\left(5x-1\\right)}^6=2$$"], variabilization: {}}, {id: "af4e405log19a-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$5x=65$$"], dependencies: ["af4e405log19a-h2"], title: "Simplify the Expression", text: "Simplify the expression so all the terms with x are on one side and all the constant (non-x) terms are on the other.", choices: ["$$5x=65$$", "$$5x=64$$", "$$5x=32$$", "$$5x=35$$"], subHints: [{id: "af4e405log19a-h3-s1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["64"], dependencies: [], title: "Determine $$2^6$$", text: "What is $$2^6$$?", variabilization: {}}, {id: "af4e405log19a-h3-s2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["65"], dependencies: [], title: "Determine $$64+1$$", text: "What is $$64+1$$?", variabilization: {}}], variabilization: {}}, {id: "af4e405log19a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["13"], dependencies: ["af4e405log19a-h3"], title: "Solve for x", text: "What is the value of x in $$5x=65$$?", variabilization: {}}, ]; export {hints};