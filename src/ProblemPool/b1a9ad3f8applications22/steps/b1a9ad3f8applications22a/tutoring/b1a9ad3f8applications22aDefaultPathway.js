var hints = [{id: "b1a9ad3f8applications22a-h1", type: "hint", dependencies: [], title: "Create Variables", text: "Let d represent Devon's age and c represent Cooper's age.", variabilization: {}}, {id: "b1a9ad3f8applications22a-h2", type: "hint", dependencies: ["b1a9ad3f8applications22a-h1"], title: "Translate to a System of Equations", text: "Devon is 26 years older than Cooper, translating into $$d=c+26$$. The sum of their ages is 50, translating into $$c+d=50$$.", variabilization: {}}, {id: "b1a9ad3f8applications22a-h3", type: "hint", dependencies: ["b1a9ad3f8applications22a-h2"], title: "Solve the System", text: "Using substitution we can substitute $$d=c+26$$ into $$c+d=50$$ to solve for c, Cooper's age. \\n $$c+d=50$$ \\n $$c+c+26=50$$ \\n $$2c+26=50$$ \\n $$2c=24$$", variabilization: {}}, {id: "b1a9ad3f8applications22a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["12"], dependencies: ["b1a9ad3f8applications22a-h3"], title: "Finding Cooper's Age", text: "What is Cooper's age?", variabilization: {}}, {id: "b1a9ad3f8applications22a-h5", type: "hint", dependencies: ["b1a9ad3f8applications22a-h4"], title: "Finding Devon's Age", text: "Given $$c=12$$, plug the known value into $$d=c+26$$ to solve for d.", variabilization: {}}, {id: "b1a9ad3f8applications22a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["38"], dependencies: ["b1a9ad3f8applications22a-h5"], title: "Finding Devon's Age", text: "What is Devon's age?", variabilization: {}}, ]; export {hints};