var hints = [{id: "b1a6f9727real26a-h1", type: "hint", dependencies: [], title: "Multiplication", text: "The first step is to simplify multiplication and division.", variabilization: {}}, {id: "b1a6f9727real26a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["10"], dependencies: ["b1a6f9727real26a-h1"], title: "Multiplication", text: "What is $$2\\times5$$?", variabilization: {}}, {id: "b1a6f9727real26a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["6"], dependencies: ["b1a6f9727real26a-h1"], title: "Multiplication", text: "What is $$3\\times2$$?", variabilization: {}}, {id: "b1a6f9727real26a-h4", type: "hint", dependencies: ["b1a6f9727real26a-h2", "b1a6f9727real26a-h3"], title: "Addition", text: "The next step is to simplify addition and subtraction.", variabilization: {}}, {id: "b1a6f9727real26a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["20"], dependencies: ["b1a6f9727real26a-h4"], title: "Addition", text: "What is $$10+6+4$$?", variabilization: {}}, ]; export {hints};