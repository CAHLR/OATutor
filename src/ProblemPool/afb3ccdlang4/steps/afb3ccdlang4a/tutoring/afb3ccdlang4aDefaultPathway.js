var hints = [{id: "afb3ccdlang4a-h1", type: "hint", dependencies: [], title: "Parentheses", text: "Since there are parentheses, we do the calculations inside the parentheses first.", variabilization: {}}, {id: "afb3ccdlang4a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3"], dependencies: ["afb3ccdlang4a-h1"], title: "Parentheses", text: "what is 5 -2?", variabilization: {}}, {id: "afb3ccdlang4a-h3", type: "hint", dependencies: ["afb3ccdlang4a-h2"], title: "$$\\frac{Multiplication}{Division}$$", text: "Then, we calculate the division and multiplication.", variabilization: {}}, {id: "afb3ccdlang4a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3"], dependencies: ["afb3ccdlang4a-h3"], title: "$$\\frac{Multiplication}{Division}$$", text: "what is $$\\frac{18}{6}$$?", variabilization: {}}, {id: "afb3ccdlang4a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["12"], dependencies: ["afb3ccdlang4a-h4"], title: "$$\\frac{Multiplication}{Division}$$", text: "What is $$4\\times3$$?", variabilization: {}}, {id: "afb3ccdlang4a-h6", type: "hint", dependencies: ["afb3ccdlang4a-h5"], title: "$$\\frac{Addition}{Subtraction}$$", text: "The last step is to do the addition and subtraction.", variabilization: {}}, {id: "afb3ccdlang4a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["15"], dependencies: ["afb3ccdlang4a-h6"], title: "$$\\frac{Addition}{Subtraction}$$", text: "What is $$3+12$$?", variabilization: {}}, ]; export {hints};