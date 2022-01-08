var hints = [{id: "b1aaa317eLinIneq2a-h1", type: "hint", dependencies: [], title: "Number of intervals", text: "We need two intervals, one for representing \"less than or equal to -1\", and another for \"greater than or equal to 1.\"", variabilization: {}}, {id: "b1aaa317eLinIneq2a-h2", type: "hint", dependencies: ["b1aaa317eLinIneq2a-h1"], title: "Or", text: "or means we should use the union symbol U (satisfy at least one OR the other condition)", variabilization: {}}, {id: "b1aaa317eLinIneq2a-h3", type: "hint", dependencies: ["b1aaa317eLinIneq2a-h2"], title: "First interval endpoints", text: "The two endpoints for the interval \"less than or equal to -1\" are $$-\\infty$$ and -1.", variabilization: {}}, {id: "b1aaa317eLinIneq2a-h4", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["("], dependencies: ["b1aaa317eLinIneq2a-h3"], title: "First interval symbol", text: "Should we use parenthesis or bracket for the negative $$\\infty$$?", choices: ["(", "["], variabilization: {}}, {id: "b1aaa317eLinIneq2a-h5", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["]"], dependencies: ["b1aaa317eLinIneq2a-h4"], title: "First interval symbol", text: "Should we use parenthesis or bracket for the -1?", choices: [")", "]"], variabilization: {}}, {id: "b1aaa317eLinIneq2a-h6", type: "hint", dependencies: ["b1aaa317eLinIneq2a-h5"], title: "Second interval endpoints", text: "The two endpoints for the interval \"greater than or equal to b\" are 1 and $$\\infty$$.", variabilization: {}}, {id: "b1aaa317eLinIneq2a-h7", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["["], dependencies: ["b1aaa317eLinIneq2a-h6"], title: "Second interval symbol", text: "Should we use parenthesis or bracket for the 1?", choices: ["(", "["], variabilization: {}}, {id: "b1aaa317eLinIneq2a-h8", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: [")"], dependencies: ["b1aaa317eLinIneq2a-h7"], title: "Second interval symbol", text: "Should we use parenthesis or bracket for the $$\\infty$$?", choices: [")", "]"], variabilization: {}}, ]; export {hints};