var hints = [{id: "b1a20771equad37a-h1", type: "hint", dependencies: [], title: "Square root", text: "Take the square root of both sides", variabilization: {}}, {id: "b1a20771equad37a-h2", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$x-1=\\sqrt{25}$$"], dependencies: ["b1a20771equad37a-h1"], title: "Square root", text: "What do we get after taking the square root of both sides?", choices: ["$$x+1=\\sqrt{25}$$", "$$x-1=\\sqrt{25}$$", "$$x-1=\\sqrt{20}$$"], variabilization: {}}, {id: "b1a20771equad37a-h3", type: "hint", dependencies: ["b1a20771equad37a-h2"], title: "Careful!", text: "Remember to be careful about the square root of 36! (remember positve and negative numbers)", variabilization: {}}, {id: "b1a20771equad37a-h4", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["-5, 5"], dependencies: ["b1a20771equad37a-h3"], title: "Square root", text: "What is the square root of 25?", variabilization: {}}, {id: "b1a20771equad37a-h5", type: "hint", dependencies: ["b1a20771equad37a-h4"], title: "Set Equal!", text: "set x-1 equal to both values and solve for x", variabilization: {}}, ]; export {hints};