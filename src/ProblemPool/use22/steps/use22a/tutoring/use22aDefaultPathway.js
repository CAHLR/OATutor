var hints = [{id: "use22a-h1", type: "hint", dependencies: [], title: "Using PEMDAS", text: "The Order of Operations, PEMDAS, is Parenthese, Exponents, Multiplication, Division, Addition, and Subtraction.", variabilization: {}}, {id: "use22a-h2", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["No"], dependencies: ["use22a-h1"], title: "P-Parentheses", text: "Are there any parentheses?", choices: ["Yes", "No"], variabilization: {}}, {id: "use22a-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["No"], dependencies: ["use22a-h2"], title: "E-Exponents", text: "Are there any exponents?", choices: ["Yes", "No"], variabilization: {}}, {id: "use22a-h4", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: ["use22a-h3"], title: "MD-Multiplication or Division", text: "Is there any multiplication or division?", choices: ["Yes", "No"], variabilization: {}}, {id: "use22a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["21"], dependencies: ["use22a-h4"], title: "First Operation", text: "What is $$3\\times7$$?", variabilization: {}}, {id: "use22a-h6", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: ["use22a-h5"], title: "AS-Addition or Subtraction", text: "Is there any addition or subtraction?", choices: ["Yes", "No"], variabilization: {}}, {id: "use22a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["25"], dependencies: ["use22a-h6"], title: "Second Operation", text: "What is $$4+21$$?", variabilization: {}}, ]; export {hints};