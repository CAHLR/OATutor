var hints = [{id: "b1acff542gra1b-h1", type: "hint", dependencies: [], title: "Substitute", text: "We substitute $$x=3$$ and $$y=1$$ into both inequalities.", variabilization: {}}, {id: "b1acff542gra1b-h2", type: "hint", dependencies: ["b1acff542gra1b-h1"], title: "Substitute into First Equation", text: "$$x+4y \\geq 10$$ \\n $$3+4\\times1 \\geq 10$$ \\n $$7 \\geq 10$$", variabilization: {}}, {id: "b1acff542gra1b-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["F"], dependencies: ["b1acff542gra1b-h2"], title: "Substitute into First Equation", text: "Is the inequality above true?", choices: ["T", "F"], variabilization: {}}, {id: "b1acff542gra1b-h4", type: "hint", dependencies: ["b1acff542gra1b-h3"], title: "Solutions of a System of Equations", text: "Since (3,1) does not satisfy the first inequality, then it cannot make both inequalities true. (3,1) is not a solution.", variabilization: {}}, ]; export {hints};