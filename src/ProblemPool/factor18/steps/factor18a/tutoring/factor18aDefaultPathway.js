var hints = [{id: "factor18a-h1", type: "hint", dependencies: [], title: "Split the expression", text: "Split -5p to -7p and 2p"}, {id: "factor18a-h2", type: "scaffold", problemType: "TextBox", answerType: "algebra", hintAnswer: ["2p(p+1)"], dependencies: ["factor18a-h1"], title: "Factor the expression", text: "What is the factoring of $$2p^2+2p$$"}, {id: "factor18a-h3", type: "scaffold", problemType: "TextBox", answerType: "algebra", hintAnswer: ["-7(p+1)"], dependencies: ["factor18a-h2"], title: "Factor the expression", text: "What is the factoring of -7p - 7"}, {id: "factor18a-h4", type: "scaffold", problemType: "TextBox", answerType: "algebra", hintAnswer: ["(2p-7)(p+1)"], dependencies: ["factor18a-h3"], title: "Factor the expression", text: "Factor out the common term of both $$p+1$$"}, ]; export {hints};