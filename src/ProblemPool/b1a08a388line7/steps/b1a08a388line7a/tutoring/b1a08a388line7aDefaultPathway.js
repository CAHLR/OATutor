var hints = [{id: "b1a08a388line7a-h1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{5}{6}$$"], dependencies: [], title: "Identify the Slope", text: "What is the value of the slope given in the problem?", variabilization: {}}, {id: "b1a08a388line7a-h2", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["(6,7)"], dependencies: ["b1a08a388line7a-h1"], title: "Identify the Point", text: "What is the coordinate of the given point?", choices: ["(7,6)", "(-6,7)", "(6,7)", "(7,2)"], variabilization: {}}, {id: "b1a08a388line7a-h3", type: "hint", dependencies: ["b1a08a388line7a-h2"], title: "Point Slope Form", text: "Substitute the values into the point-slope form, $$y-y_1=m\\left(x-x_1\\right)$$", variabilization: {}}, {id: "b1a08a388line7a-h4", type: "hint", dependencies: ["b1a08a388line7a-h3"], title: "Slope Intercept Form", text: "Simplify the equation and write it in slope intercept form", variabilization: {}}, ]; export {hints};