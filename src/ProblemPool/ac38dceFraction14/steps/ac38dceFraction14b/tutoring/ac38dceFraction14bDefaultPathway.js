var hints = [{id: "ac38dceFraction14b-h1", type: "hint", dependencies: [], title: "Principle", text: "Find the common factor of numerator and denominator", variabilization: {}}, {id: "ac38dceFraction14b-h2", type: "hint", dependencies: ["ac38dceFraction14b-h1"], title: "Factor", text: "Factor the numerator to 2x2x2x3xa", variabilization: {}}, {id: "ac38dceFraction14b-h3", type: "hint", dependencies: ["ac38dceFraction14b-h2"], title: "Factor", text: "Factor the denominator to 2x2x3x3", variabilization: {}}, {id: "ac38dceFraction14b-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["12"], dependencies: ["ac38dceFraction14b-h3"], title: "Organizing", text: "What is the common factor?", variabilization: {}}, {id: "ac38dceFraction14b-h5", type: "hint", dependencies: ["ac38dceFraction14b-h4"], title: "Division", text: "Dividing both sides by the common factor", variabilization: {}}, ]; export {hints};