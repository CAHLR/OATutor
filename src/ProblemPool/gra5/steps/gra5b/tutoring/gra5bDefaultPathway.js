var hints = [{id: "gra5b-h1", type: "hint", dependencies: [], title: "Substitute", text: "We substitute $$x=8$$ and $$y=3$$ into both inequalities.", variabilization: {}}, {id: "gra5b-h2", type: "hint", dependencies: ["gra5b-h1"], title: "Substitute into First Equation", text: "$$y>\\frac{3}{2} x+\\left(3\\right)$$ \\n $$3>\\frac{3}{2} \\left(8\\right)+\\left(3\\right)$$ \\n $$3>15$$", variabilization: {}}, {id: "gra5b-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["T"], dependencies: ["gra5b-h2"], title: "Substitute into First Equation", text: "Is the inequality above true?", choices: ["T", "F"], variabilization: {}}, {id: "gra5b-h4", type: "hint", dependencies: ["gra5b-h3"], title: "Substitute into Second Equation", text: "$$\\frac{3}{4} x-\\left(2\\right) y<5$$ \\n $$\\frac{3}{4} \\left(8\\right)-\\left(2\\right) \\left(3\\right)<5$$ \\n $$0<5$$", variabilization: {}}, {id: "gra5b-h5", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["T"], dependencies: ["gra5b-h4"], title: "Substitute into Second Equation", text: "Is the inequality above true?", choices: ["T", "F"], variabilization: {}}, {id: "gra5b-h6", type: "hint", dependencies: ["gra5b-h5"], title: "Solutions of a System of Equations", text: "(8,3) makes both inequalities true. (8,3) is a solution.", variabilization: {}}, ]; export {hints};