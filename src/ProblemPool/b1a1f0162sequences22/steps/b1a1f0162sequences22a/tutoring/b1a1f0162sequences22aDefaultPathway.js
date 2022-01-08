var hints = [{id: "b1a1f0162sequences22a-h1", type: "hint", dependencies: [], title: "Substitution", text: "Substitute $$n=1$$ into the formula", variabilization: {}}, {id: "b1a1f0162sequences22a-h2", type: "hint", dependencies: ["b1a1f0162sequences22a-h1"], title: "Simplification", text: "Calculate the expression a_1=(5*1)/((1+2)!)", variabilization: {}}, {id: "b1a1f0162sequences22a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["5"], dependencies: ["b1a1f0162sequences22a-h2"], title: "Calculate the numerator", text: "What is $$5\\times1$$", variabilization: {}}, {id: "b1a1f0162sequences22a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["6"], dependencies: ["b1a1f0162sequences22a-h3"], title: "Calculate the denominator", text: "((1+2)!) is equal to 3! What is $$3\\times2\\times1$$?", variabilization: {}}, {id: "b1a1f0162sequences22a-h5", type: "hint", dependencies: ["b1a1f0162sequences22a-h4"], title: "Putting It Together", text: "Put the numerator and denominator together to create a fraction", variabilization: {}}, ]; export {hints};