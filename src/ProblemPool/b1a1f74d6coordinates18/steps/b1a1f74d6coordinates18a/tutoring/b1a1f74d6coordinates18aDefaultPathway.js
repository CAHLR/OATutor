var hints = [{id: "b1a1f74d6coordinates18a-h1", type: "hint", dependencies: [], title: "Understanding Coordinate Format", text: "The ordered pairs are given in coordinate format with (x,y). The x value will be plugged into the x variable of the given equation and the same for the y value in the y variable.", variabilization: {}}, {id: "b1a1f74d6coordinates18a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$y-2x=-5$$"], dependencies: ["b1a1f74d6coordinates18a-h1"], title: "Rearranging Equation", text: "What will the equation look like when rearranged so that all variables are on one side?", variabilization: {}}, {id: "b1a1f74d6coordinates18a-h3", type: "hint", dependencies: ["b1a1f74d6coordinates18a-h2"], title: "Plugging in Ordered Pairs", text: "In order to check which ordered pairs are solutions, plug in each option into the rearranged equation to check if it outputs the right answer.", variabilization: {}}, {id: "b1a1f74d6coordinates18a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-5"], dependencies: ["b1a1f74d6coordinates18a-h3"], title: "Plugging in (0,-5)", text: "What does the ordered pair (0,-5) output when plugged into the equation?", variabilization: {}}, {id: "b1a1f74d6coordinates18a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-3"], dependencies: ["b1a1f74d6coordinates18a-h4"], title: "Plugging in (2,1)", text: "What does the ordered pair (2,1) output when plugged into the equation?", variabilization: {}}, {id: "b1a1f74d6coordinates18a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-5"], dependencies: ["b1a1f74d6coordinates18a-h5"], title: "Plugging in $$(\\frac{1}{2},-4)$$", text: "What does the ordered pair $$(\\frac{1}{2},-4)$$ output when plugged into the equation?", variabilization: {}}, {id: "b1a1f74d6coordinates18a-h7", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["(0,-5) and $$(\\frac{1}{2},-4)$$"], dependencies: ["b1a1f74d6coordinates18a-h6"], title: "Identifying Correct Ordered Pairs", text: "Which ordered pairs satisfy the solution to the given equation?", choices: ["(0,-5) and (2,1)", "(0,-5) and $$(\\frac{1}{2},-4)$$", "$$(\\frac{1}{2},-4)$$ and (2,1)"], variabilization: {}}, ]; export {hints};