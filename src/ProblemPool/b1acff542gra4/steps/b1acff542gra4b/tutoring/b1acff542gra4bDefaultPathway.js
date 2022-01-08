var hints = [{id: "b1acff542gra4b-h1", type: "hint", dependencies: [], title: "Substitute", text: "We substitute $$x=3$$ and $$y=0$$ into both inequalities.", variabilization: {}}, {id: "b1acff542gra4b-h2", type: "hint", dependencies: ["b1acff542gra4b-h1"], title: "Substitute into First Equation", text: "$$y>\\frac{2}{3} x-5$$ \\n $$0>3\\frac{2}{3}-5$$ \\n $$0>-3$$", variabilization: {}}, {id: "b1acff542gra4b-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["T"], dependencies: ["b1acff542gra4b-h2"], title: "Substitute into First Equation", text: "Is the inequality above true?", choices: ["T", "F"], variabilization: {}}, {id: "b1acff542gra4b-h4", type: "hint", dependencies: ["b1acff542gra4b-h3"], title: "Substitute into Second Equation", text: "$$x+\\frac{1}{2} y \\leq 4$$ \\n $$3+0\\frac{1}{2} \\leq 4$$ \\n $$3 \\leq 4$$", variabilization: {}}, {id: "b1acff542gra4b-h5", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["T"], dependencies: ["b1acff542gra4b-h4"], title: "Substitute into Second Equation", text: "Is the inequality above true?", choices: ["T", "F"], variabilization: {}}, {id: "b1acff542gra4b-h6", type: "hint", dependencies: ["b1acff542gra4b-h5"], title: "Solutions of a System of Equations", text: "(3,0) makes both inequalities true. (3,0) is a solution.", variabilization: {}}, ]; export {hints};