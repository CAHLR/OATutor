var hints = [{id: "b1acff542gra3a-h1", type: "hint", dependencies: [], title: "Substitute", text: "We substitute $$x=5$$ and $$y=-2$$ into both inequalities.", variabilization: {}}, {id: "b1acff542gra3a-h2", type: "hint", dependencies: ["b1acff542gra3a-h1"], title: "Substitute into First Equation", text: "$$4x-y<10$$ \\n $$4\\times5-\\left(-2\\right)<10$$ \\n $$22<10$$", variabilization: {}}, {id: "b1acff542gra3a-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["F"], dependencies: ["b1acff542gra3a-h2"], title: "Substitute into First Equation", text: "Is the inequality above true?", choices: ["T", "F"], variabilization: {}}, {id: "b1acff542gra3a-h4", type: "hint", dependencies: ["b1acff542gra3a-h3"], title: "Solutions of a System of Equations", text: "Since (5,2) does not satisfy the first inequality, then it cannot make both inequalities true. (5,2) is not a solution.", variabilization: {}}, ]; export {hints};