var hints = [{id: "b1a4d2b33use22b-h1", type: "hint", dependencies: [], title: "Using PEMDAS", text: "The Order of Operations, PEMDAS, is Parenthese, Exponents, Multiplication, Division, Addition, and Subtraction.", variabilization: {}}, {id: "b1a4d2b33use22b-h2", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: ["b1a4d2b33use22b-h1"], title: "P-Parentheses", text: "Are there any parentheses?", choices: ["Yes", "No"], variabilization: {}}, {id: "b1a4d2b33use22b-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["7"], dependencies: ["b1a4d2b33use22b-h2"], title: "First Operation", text: "What is $$4+3$$?", variabilization: {}}, {id: "b1a4d2b33use22b-h4", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["No"], dependencies: ["b1a4d2b33use22b-h3"], title: "E-Exponents", text: "Are there any exponents?", choices: ["Yes", "No"], variabilization: {}}, {id: "b1a4d2b33use22b-h5", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: ["b1a4d2b33use22b-h4"], title: "MD-Multiplication or Division", text: "Is there any multiplication or division?", choices: ["Yes", "No"], variabilization: {}}, {id: "b1a4d2b33use22b-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["49"], dependencies: ["b1a4d2b33use22b-h5"], title: "Second Operation", text: "What is $$7\\times7$$?", variabilization: {}}, {id: "b1a4d2b33use22b-h7", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["No"], dependencies: ["b1a4d2b33use22b-h6"], title: "AS-Addition or Subtraction", text: "Is there any (remaining) addition or subtraction?", choices: ["Yes", "No"], variabilization: {}}, ]; export {hints};