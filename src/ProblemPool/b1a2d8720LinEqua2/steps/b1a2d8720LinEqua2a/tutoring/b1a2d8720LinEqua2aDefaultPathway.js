var hints = [{id: "b1a2d8720LinEqua2a-h1", type: "hint", dependencies: [], title: "Isolation", text: "First we should isolate the variable on one side of the equation by adding, subtracting, multiplying or dividing the equation.", variabilization: {}}, {id: "b1a2d8720LinEqua2a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$2x=-10$$"], dependencies: ["b1a2d8720LinEqua2a-h1"], title: "Subtraction", text: "What is the result after subtracting 1 from both sides?", variabilization: {}}, {id: "b1a2d8720LinEqua2a-h3", type: "hint", dependencies: ["b1a2d8720LinEqua2a-h2"], title: "Normalization", text: "When the variable is multiplied by a coefficient in the final stage, multiply both sides fo the equation by the reciprocal of the cofficient.", variabilization: {}}, {id: "b1a2d8720LinEqua2a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$x=-5$$"], dependencies: ["b1a2d8720LinEqua2a-h3"], title: "Multiplication", text: "What is the result after multiplying both sides by $$\\frac{1}{2}$$?", variabilization: {}}, ]; export {hints};