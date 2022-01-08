var hints = [{id: "b1af60b4fellipse2a-h1", type: "hint", dependencies: [], title: "Vertice and Foci", text: "Consider whether the major axis lies on the x- or y-axis.", variabilization: {}}, {id: "b1af60b4fellipse2a-h2", type: "hint", dependencies: ["b1af60b4fellipse2a-h1"], title: "Standard Equation Form", text: "The form of the standard equation is $$c^2=a^2-b^2$$, given $$a=vertices$$ and $$c=foci$$.", variabilization: {}}, {id: "b1af60b4fellipse2a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["4"], dependencies: ["b1af60b4fellipse2a-h2"], title: "Solving for a", text: "What is a equal to?", variabilization: {}}, {id: "b1af60b4fellipse2a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\sqrt{15}$$"], dependencies: ["b1af60b4fellipse2a-h3"], title: "Solving for c", text: "What is c equal to?", variabilization: {}}, {id: "b1af60b4fellipse2a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["1"], dependencies: ["b1af60b4fellipse2a-h4"], title: "Solving for b", text: "What is $$b^2$$ equal to using the relationship between a, b, and c?", variabilization: {}}, {id: "b1af60b4fellipse2a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{x^2}{1}+\\frac{y^2}{16}=1$$"], dependencies: ["b1af60b4fellipse2a-h5"], title: "Plugging in the Values", text: "Plug in the values for a and b into the standard form equation.", variabilization: {}}, ]; export {hints};