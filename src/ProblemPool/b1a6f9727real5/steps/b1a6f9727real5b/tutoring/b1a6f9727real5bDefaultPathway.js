var hints = [{id: "b1a6f9727real5b-h1", type: "hint", dependencies: [], title: "Parentheses", text: "The first step is to simplify the parentheses.", variabilization: {}}, {id: "b1a6f9727real5b-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["15"], dependencies: ["b1a6f9727real5b-h1"], title: "Parentheses", text: "What is $$5\\times3$$?", variabilization: {}}, {id: "b1a6f9727real5b-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3"], dependencies: ["b1a6f9727real5b-h1"], title: "Parentheses", text: "What is 6-3?", variabilization: {}}, {id: "b1a6f9727real5b-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["16"], dependencies: ["b1a6f9727real5b-h2", "b1a6f9727real5b-h3"], title: "Parentheses", text: "What is $$4^2$$?", variabilization: {}}, {id: "b1a6f9727real5b-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-13"], dependencies: ["b1a6f9727real5b-h4"], title: "Parentheses", text: "What is 3-16?", variabilization: {}}, {id: "b1a6f9727real5b-h6", type: "hint", dependencies: ["b1a6f9727real5b-h5"], title: "Multiplication", text: "The next step is to simplify multiplication and division.", variabilization: {}}, {id: "b1a6f9727real5b-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["105"], dependencies: ["b1a6f9727real5b-h6"], title: "Multiplication", text: "What is $$7\\times15$$?", variabilization: {}}, {id: "b1a6f9727real5b-h8", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["26"], dependencies: ["b1a6f9727real5b-h7"], title: "Multiplication", text: "What is $$\\left(-2\\right) \\left(-13\\right)$$?", variabilization: {}}, {id: "b1a6f9727real5b-h9", type: "hint", dependencies: ["b1a6f9727real5b-h8"], title: "Addition", text: "The final step is to simplify addition and subtraction.", variabilization: {}}, {id: "b1a6f9727real5b-h10", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["132"], dependencies: ["b1a6f9727real5b-h9"], title: "Addition", text: "What is $$105+26+1$$?", variabilization: {}}, ]; export {hints};