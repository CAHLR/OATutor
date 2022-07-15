var hints = [{id: "a9ff35apoly8a-h1", type: "hint", dependencies: [], title: "Standard form", text: "The first step is to write the equation in standard form.", variabilization: {}}, {id: "a9ff35apoly8a-h2", type: "hint", dependencies: ["a9ff35apoly8a-h1"], title: "Factoring the quadratic", text: "The next step is to factor the quadratic equation.", variabilization: {}}, {id: "a9ff35apoly8a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$3\\left(x-7\\right) \\left(x+3\\right)$$"], dependencies: ["a9ff35apoly8a-h2"], title: "Factored form", text: "What is our equation factored?", variabilization: {}}, {id: "a9ff35apoly8a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["7"], dependencies: ["a9ff35apoly8a-h3"], title: "Solving for 0", text: "Solve: $$x-7=0$$", variabilization: {}}, {id: "a9ff35apoly8a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-3"], dependencies: ["a9ff35apoly8a-h4"], title: "Solving for 0", text: "Solve: $$x+3=0$$", variabilization: {}}, ]; export {hints};