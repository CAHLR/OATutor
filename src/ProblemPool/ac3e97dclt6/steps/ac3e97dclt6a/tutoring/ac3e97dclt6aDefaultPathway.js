var hints = [{id: "ac3e97dclt6a-h1", type: "hint", dependencies: [], title: "", text: "Identify parts of the problem", variabilization: {}}, {id: "ac3e97dclt6a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["25"], dependencies: ["ac3e97dclt6a-h1"], title: "", text: "What is the mean $$\\mu$$?", variabilization: {}}, {id: "ac3e97dclt6a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0.5774"], dependencies: ["ac3e97dclt6a-h1"], title: "", text: "What is the standard deviation $$σ$$?", variabilization: {}}, {id: "ac3e97dclt6a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["100"], dependencies: ["ac3e97dclt6a-h1"], title: "", text: "What is the sample size n?", variabilization: {}}, {id: "ac3e97dclt6a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["25.2"], dependencies: ["ac3e97dclt6a-h1"], title: "", text: "What is the sample mean $$x̅$$?", variabilization: {}}, {id: "ac3e97dclt6a-h6", type: "hint", dependencies: ["ac3e97dclt6a-h5"], title: "", text: "Find the z-score", variabilization: {}}, {id: "ac3e97dclt6a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{25.2-25}{\\frac{0.5774}{\\sqrt{100}}}$$"], dependencies: ["ac3e97dclt6a-h6"], title: "", text: "Use the following formula and plug in to find z-score: z $$=$$ (x̅ - μ)/(σ/sqrt(n))", variabilization: {}}, {id: "ac3e97dclt6a-h8", type: "hint", dependencies: ["ac3e97dclt6a-h7"], title: "", text: "Determine the probability.", variabilization: {}}, {id: "ac3e97dclt6a-h9", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0.9997"], dependencies: ["ac3e97dclt6a-h8"], title: "", text: "Look up the z-score you calculated in the z-table. What the probability when the z-score is 3.46?", subHints: [{id: "ac3e97dclt6a-h9-s1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0.0003"], dependencies: [], title: "", text: "Subtract z-score from 1", variabilization: {}}, {id: "ac3e97dclt6a-h9-s2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0.03%"], dependencies: [], title: "", text: "Convert decimal to percentage", variabilization: {}}], variabilization: {}}, ]; export {hints};