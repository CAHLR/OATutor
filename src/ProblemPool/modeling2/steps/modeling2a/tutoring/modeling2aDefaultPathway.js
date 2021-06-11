var hints = [{id: "modeling2a-h1", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$d=vt$$"], dependencies: [], title: "Speed, Distance, and Time Relationship", text: "Given that v represents speed, t represents time, and d represents distance. What is the relationship between speed, distance, and time?", choices: ["$$d=vt$$", "$$d=\\frac{v}{t}$$", "$$t=dv$$", "$$v=\\frac{t}{d}$$"], variabilization: {}}, {id: "modeling2a-h2", type: "hint", dependencies: ["modeling2a-h1"], title: "Plug-in Values", text: "Plug in known value of distance into the equation.", variabilization: {}}, {id: "modeling2a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$t=\\frac{100}{v}$$"], dependencies: ["modeling2a-h2"], title: "Re-write Equation", text: "What is the equation in terms of velocity?", variabilization: {}}, ]; export {hints};