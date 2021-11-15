var hints = [{id: "use23a-h1", type: "hint", dependencies: [], title: "Using PEMDAS", text: "The Order of Operations, PEMDAS, is Parenthese, Exponents, Multiplication, Division, Addition, and Subtraction.", variabilization: {}}, {id: "use23a-h2", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: ["use23a-h1"], title: "P-Parentheses", text: "Are there any parentheses?", choices: ["Yes", "No"], variabilization: {}}, {id: "use23a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3"], dependencies: ["use23a-h2"], title: "First Operation", text: "What is 5-2?", variabilization: {}}, {id: "use23a-h4", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["No"], dependencies: ["use23a-h3"], title: "E-Exponents", text: "Are there any exponents?", choices: ["Yes", "No"], variabilization: {}}, {id: "use23a-h5", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: ["use23a-h4"], title: "MD- Multiplication or Division", text: "Is there any multiplication or division?", choices: ["Yes", "No"], variabilization: {}}, {id: "use23a-h6", type: "hint", dependencies: ["use23a-h5"], title: "Order Between Multiplication and Division", text: "Divide first because we multiply and divide left to right.", variabilization: {}}, {id: "use23a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3"], dependencies: ["use23a-h6"], title: "Second Operation", text: "What is $$\\frac{18}{6}$$?", variabilization: {}}, {id: "use23a-h8", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["12"], dependencies: ["use23a-h7"], title: "Third Operation", text: "What is $$4\\times3$$?", variabilization: {}}, {id: "use23a-h9", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: ["use23a-h8"], title: "AS- Addition or Subtraction", text: "Is there any addition or subtraction?", choices: ["Yes", "No"], variabilization: {}}, {id: "use23a-h10", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["15"], dependencies: ["use23a-h9"], title: "Fourth Operation", text: "What is $$3+12$$?", variabilization: {}}, ]; export {hints};