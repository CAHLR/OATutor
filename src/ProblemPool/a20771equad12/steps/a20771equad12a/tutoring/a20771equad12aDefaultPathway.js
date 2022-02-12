var hints = [{id: "a20771equad12a-h1", type: "hint", dependencies: [], title: "Simplify the Expression", text: "To isolate the variable, first subtract both sides by one to get $$4x^2=6$$", variabilization: {}}, {id: "a20771equad12a-h2", type: "hint", dependencies: ["a20771equad12a-h1"], title: "Simplify the Expression", text: "Next, divide both sides by 4: $$x^2=\\frac{6}{4}$$.", variabilization: {}}, {id: "a20771equad12a-h3", type: "hint", dependencies: ["a20771equad12a-h2"], title: "Square Root", text: "Take the +/- square root of both sides: $$x=\\pm \\sqrt{\\frac{6}{4}}$$.", variabilization: {}}, {id: "a20771equad12a-h4", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["sqrt(6)/2, -sqrt(6)/2"], dependencies: ["a20771equad12a-h3"], title: "Square Root", text: "What is $$\\pm \\sqrt{\\frac{6}{4}}$$?", variabilization: {}}, {id: "a20771equad12a-h5", type: "hint", dependencies: ["a20771equad12a-h4"], title: "Square Root", text: "$$\\sqrt{6}$$ is in its simplest form, so we can leave it as it is. $$\\sqrt{4}=2$$, so the final answer is $$\\frac{\\pm \\sqrt{6}}{2}$$", variabilization: {}}, ]; export {hints};