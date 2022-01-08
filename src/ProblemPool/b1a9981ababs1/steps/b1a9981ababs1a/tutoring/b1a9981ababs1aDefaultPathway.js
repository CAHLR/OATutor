var hints = [{id: "b1a9981ababs1a-h1", type: "hint", dependencies: [], title: "Substitute", text: "Substitute 0 for f(x).", variabilization: {}}, {id: "b1a9981ababs1a-h2", type: "hint", dependencies: ["b1a9981ababs1a-h1"], title: "Isolate", text: "Isolate the absolute value on one side of the equation.", variabilization: {}}, {id: "b1a9981ababs1a-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$-1=|x-3|$$"], dependencies: ["b1a9981ababs1a-h2"], title: "Isolate", text: "What do we get after the isolation?", choices: ["$$1=|x-3|$$", "$$-1=|x-3|$$", "$$0=|x-3|$$"], variabilization: {}}, {id: "b1a9981ababs1a-h4", type: "hint", dependencies: ["b1a9981ababs1a-h3"], title: "Absolute Value", text: "$$|x-3|$$ is always non-negative, so we cannot find x-intercepts in this case.", variabilization: {}}, ]; export {hints};