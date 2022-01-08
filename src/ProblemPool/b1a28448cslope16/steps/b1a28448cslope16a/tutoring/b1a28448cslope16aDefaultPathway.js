var hints = [{id: "b1a28448cslope16a-h1", type: "hint", dependencies: [], title: "Solve the second equation for y", text: "$$2x-3y=-2$$ \\n $$-3y=-2x-2$$ \\n $$\\frac{\\left(-3y\\right)}{-3}=\\frac{\\left(-2x-2\\right)}{-3}$$ \\n $$y=\\frac{2}{3} x+\\frac{2}{3}$$", variabilization: {}}, {id: "b1a28448cslope16a-h2", type: "hint", dependencies: ["b1a28448cslope16a-h1"], title: "Slope-Intercept Form", text: "Both equations are now in slope-intercept form: $$y=\\frac{2}{3} x-1$$, $$y=\\frac{2}{3} x+\\frac{2}{3}$$", variabilization: {}}, {id: "b1a28448cslope16a-h3", type: "hint", dependencies: ["b1a28448cslope16a-h2"], title: "Slope and y-intercept", text: "Identify the slope and y-intercept of both lines.", variabilization: {}}, {id: "b1a28448cslope16a-h4", type: "hint", dependencies: ["b1a28448cslope16a-h3"], title: "Slope-Intercept Form of an Equation of the First Line", text: "Compare the first equation to the slope-intercept form of the equation. \\n $$y=m x+b$$ \\n $$y=\\frac{2}{3} x-1$$", variabilization: {}}, {id: "b1a28448cslope16a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{2}{3}$$"], dependencies: ["b1a28448cslope16a-h4"], title: "Identify the Slope of First Line", text: "What is m in the first equation?", variabilization: {}}, {id: "b1a28448cslope16a-h6", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["(0,-1)"], dependencies: ["b1a28448cslope16a-h5"], title: "Identify the y-intercept of First Line", text: "What is the y-intercept in the first equation?", choices: ["(0,1)", "(0,-1)", "(1,0)"], variabilization: {}}, {id: "b1a28448cslope16a-h7", type: "hint", dependencies: ["b1a28448cslope16a-h5", "b1a28448cslope16a-h6"], title: "Slope and y-intercept of First Line", text: "The slope of the first equation is $$\\frac{2}{3}$$ and the y-intercept is (0,-1).", variabilization: {}}, {id: "b1a28448cslope16a-h8", type: "hint", dependencies: ["b1a28448cslope16a-h7"], title: "Slope-Intercept Form of an Equation of Second Line", text: "Compare the second equation to the slope-intercept form of the equation. \\n $$y=m x+b$$ \\n $$y=\\frac{2}{3} x+\\frac{2}{3}$$", variabilization: {}}, {id: "b1a28448cslope16a-h9", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{2}{3}$$"], dependencies: ["b1a28448cslope16a-h8"], title: "Identify the Slope of Second Line", text: "What is m in the second equation?", variabilization: {}}, {id: "b1a28448cslope16a-h10", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$(0,\\frac{2}{3})$$"], dependencies: ["b1a28448cslope16a-h9"], title: "Identify the y-intercept of Second Line", text: "What is the y-intercept in the second equation?", choices: ["$$(0,\\frac{2}{3})$$", "$$(0,\\frac{-2}{3})$$", "$$(\\frac{2}{3},0)$$"], variabilization: {}}, {id: "b1a28448cslope16a-h11", type: "hint", dependencies: ["b1a28448cslope16a-h9", "b1a28448cslope16a-h10"], title: "Slope and y-intercept of Second Line", text: "The slope of the second equation is $$\\frac{2}{3}$$ and the y-intercept is $$(0,\\frac{2}{3})$$.", variabilization: {}}, {id: "b1a28448cslope16a-h12", type: "hint", dependencies: ["b1a28448cslope16a-h7", "b1a28448cslope16a-h11"], title: "Parallel Lines", text: "The lines have the same slope and different y-intercepts and so they are parallel.", variabilization: {}}, ]; export {hints};