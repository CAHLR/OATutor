var hints = [{id: "acff542gra8a-h1", type: "hint", dependencies: [], title: "Substitute", text: "We substitute $$x=\\frac{1}{4}$$ and $$y=\\frac{7}{6}$$ into both inequalities.", variabilization: {}}, {id: "acff542gra8a-h2", type: "hint", dependencies: ["acff542gra8a-h1"], title: "Substitute into First Equation", text: "$$2x+3y \\geq 2$$ \\n $$2\\frac{1}{4}+3\\frac{7}{6} \\geq 2$$ \\n $$4 \\geq 2$$", variabilization: {}}, {id: "acff542gra8a-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["T"], dependencies: ["acff542gra8a-h2"], title: "Substitute into First Equation", text: "Is the inequality above true?", choices: ["T", "F"], variabilization: {}}, {id: "acff542gra8a-h4", type: "hint", dependencies: ["acff542gra8a-h3"], title: "Substitute into Second Equation", text: "$$4x-6y<-1$$ \\n $$4\\frac{1}{4}-6\\frac{7}{6}<-1$$ \\n $$-7<-1$$", variabilization: {}}, {id: "acff542gra8a-h5", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["T"], dependencies: ["acff542gra8a-h4"], title: "Substitute into Second Equation", text: "Is the inequality above true?", choices: ["T", "F"], variabilization: {}}, {id: "acff542gra8a-h6", type: "hint", dependencies: ["acff542gra8a-h5"], title: "Solutions of a System of Equations", text: "$$(\\frac{1}{4},\\frac{7}{6})$$ does make both inequalities true. $$(\\frac{1}{4},\\frac{7}{6})$$ is a solution.", variabilization: {}}, ]; export {hints};