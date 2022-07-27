var hints = [{id: "a3d6ae2sys9a-h1", type: "hint", dependencies: [], title: "Substitute", text: "We substitue $$x=-6$$ and $$y=5$$ into both equations.", variabilization: {}}, {id: "a3d6ae2sys9a-h2", type: "hint", dependencies: ["a3d6ae2sys9a-h1"], title: "Substitute into First Equation", text: "$$x+3y=9$$ \\n $$-6+3\\times5=9$$ \\n $$9=9$$", variabilization: {}}, {id: "a3d6ae2sys9a-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["TRUE"], dependencies: ["a3d6ae2sys9a-h2"], title: "Substitute into First Equation", text: "Is the equation above true?", choices: ["TRUE", "FALSE"], variabilization: {}}, {id: "a3d6ae2sys9a-h4", type: "hint", dependencies: ["a3d6ae2sys9a-h3"], title: "Solution to First Equation", text: "Therefore, (-6,5) satisfies the first equation, but it must also safisfy the second equation.", variabilization: {}}, {id: "a3d6ae2sys9a-h5", type: "hint", dependencies: ["a3d6ae2sys9a-h4"], title: "Substitute into Second Equation", text: "$$y=\\frac{2}{3} x-2$$ \\n $$5=-6\\frac{2}{3}-2$$ \\n $$5=-6$$", variabilization: {}}, {id: "a3d6ae2sys9a-h6", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["FALSE"], dependencies: ["a3d6ae2sys9a-h5"], title: "Substitute into Second Equation", text: "Is the equation above true?", choices: ["TRUE", "FALSE"], variabilization: {}}, {id: "a3d6ae2sys9a-h7", type: "hint", dependencies: ["a3d6ae2sys9a-h6"], title: "Solution to Second Equation", text: "Therefore, (-6,5) does not satisfies the second equation.", variabilization: {}}, {id: "a3d6ae2sys9a-h8", type: "hint", dependencies: ["a3d6ae2sys9a-h7"], title: "Solutions of a System of Equations", text: "(-6,5) does not make both equations true. (-6,5) is not a solution.", variabilization: {}}, ]; export {hints};