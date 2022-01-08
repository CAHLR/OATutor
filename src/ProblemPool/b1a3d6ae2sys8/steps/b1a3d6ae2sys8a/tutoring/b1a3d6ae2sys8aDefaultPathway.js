var hints = [{id: "b1a3d6ae2sys8a-h1", type: "hint", dependencies: [], title: "Substitute", text: "We substitue $$x=-10$$ and $$y=4$$ into both equations.", variabilization: {}}, {id: "b1a3d6ae2sys8a-h2", type: "hint", dependencies: ["b1a3d6ae2sys8a-h1"], title: "Substitute into First Equation", text: "$$x+5y=10$$ \\n $$-10+5\\times4=10$$ \\n $$10=10$$", variabilization: {}}, {id: "b1a3d6ae2sys8a-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["TRUE"], dependencies: ["b1a3d6ae2sys8a-h2"], title: "Substitute into First Equation", text: "Is the equation above true?", choices: ["TRUE", "FALSE"], variabilization: {}}, {id: "b1a3d6ae2sys8a-h4", type: "hint", dependencies: ["b1a3d6ae2sys8a-h3"], title: "Solution to First Equation", text: "Therefore, (-10,4) satisfies the first equation, but it must also safisfy the second equation.", variabilization: {}}, {id: "b1a3d6ae2sys8a-h5", type: "hint", dependencies: ["b1a3d6ae2sys8a-h4"], title: "Substitute into Second Equation", text: "$$y=\\frac{3}{5} x+1$$ \\n $$4=-10\\frac{3}{5}+1$$ \\n $$4=-5$$", variabilization: {}}, {id: "b1a3d6ae2sys8a-h6", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["FALSE"], dependencies: ["b1a3d6ae2sys8a-h5"], title: "Substitute into Second Equation", text: "Is the equation above true?", choices: ["TRUE", "FALSE"], variabilization: {}}, {id: "b1a3d6ae2sys8a-h7", type: "hint", dependencies: ["b1a3d6ae2sys8a-h6"], title: "Solution to Second Equation", text: "Therefore, (-10,4) does not satisfies the second equation.", variabilization: {}}, {id: "b1a3d6ae2sys8a-h8", type: "hint", dependencies: ["b1a3d6ae2sys8a-h7"], title: "Solutions of a System of Equations", text: "(-10,4) does not make both equations true. (-10,4) is not a solution.", variabilization: {}}, ]; export {hints};