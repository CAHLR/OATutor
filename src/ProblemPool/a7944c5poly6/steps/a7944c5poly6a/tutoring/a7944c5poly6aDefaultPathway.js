var hints = [{id: "a7944c5poly6a-h1", type: "hint", dependencies: [], title: "Standard form", text: "The first step is to write the equation in standard form.", variabilization: {}}, {id: "a7944c5poly6a-h2", type: "hint", dependencies: ["a7944c5poly6a-h1"], title: "Factoring the quadratic", text: "The next step is to factor the quadratic equation.", variabilization: {}}, {id: "a7944c5poly6a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\left(13x-7\\right) \\left(13x+7\\right)$$"], dependencies: ["a7944c5poly6a-h2"], title: "Factored form", text: "What is our equation factored?", variabilization: {}}, {id: "a7944c5poly6a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{7}{13}$$"], dependencies: ["a7944c5poly6a-h3"], title: "Solving for 0", text: "Solve: $$13x-7=0$$", variabilization: {}}, {id: "a7944c5poly6a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{-7}{13}$$"], dependencies: ["a7944c5poly6a-h4"], title: "Solving for 0", text: "Solve: $$13x+7=0$$", variabilization: {}}, ]; export {hints};