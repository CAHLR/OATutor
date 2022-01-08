var hints = [{id: "b1a9981ababs11a-h1", type: "hint", dependencies: [], title: "Substitute", text: "Substitute 0 for y.", variabilization: {}}, {id: "b1a9981ababs11a-h2", type: "hint", dependencies: ["b1a9981ababs11a-h1"], title: "Isolate", text: "Isolate the absolute value on one side of the equation.", variabilization: {}}, {id: "b1a9981ababs11a-h3", type: "hint", dependencies: ["b1a9981ababs11a-h2"], title: "Separate", text: "Break $$2=|x|$$ into two separate equations and solve.", variabilization: {}}, {id: "b1a9981ababs11a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["2"], dependencies: ["b1a9981ababs11a-h3"], title: "Separate", text: "What do we get for x after solving $$2=x$$?", variabilization: {}}, {id: "b1a9981ababs11a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-2"], dependencies: ["b1a9981ababs11a-h4"], title: "Separate", text: "What do we get for x after solving $$-2=x$$?", variabilization: {}}, ]; export {hints};