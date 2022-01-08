var hints = [{id: "b1a57f999ser30a-h1", type: "hint", dependencies: [], title: "Identify $$a_1$$", text: "The first term is $$a_1=-1$$.", variabilization: {}}, {id: "b1a57f999ser30a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{4}$$"], dependencies: ["b1a57f999ser30a-h1"], title: "Identify r", text: "To find r, divide the 2nd term by the 1st term. What is $$r=\\frac{\\left(-\\frac{1}{4}\\right)}{-1}$$?", subHints: [{id: "b1a57f999ser30a-h2-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["T"], dependencies: ["b1a57f999ser30a-h2"], title: "Confirm that $$-1<r<1$$", text: "Is $$-1<\\frac{1}{4}<1$$ T of F?", choices: ["T", "F"], variabilization: {}}], variabilization: {}}, {id: "b1a57f999ser30a-h4", type: "hint", dependencies: ["b1a57f999ser30a-h2-h3"], title: "Formula for the Sum of an Infinite Geometric Series", text: "Substitute values for $$a_1$$ and r into the formula: $$S=\\frac{a_1}{1-r}$$.", variabilization: {}}, {id: "b1a57f999ser30a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{-4}{3}$$"], dependencies: ["b1a57f999ser30a-h4"], title: "Solve for S", text: "What is $$S=\\frac{-1}{1-\\frac{1}{4}}$$?", variabilization: {}}, {id: "b1a57f999ser30a-h6", type: "hint", dependencies: ["b1a57f999ser30a-h5"], title: "Sum of Infinite Geometric Series", text: "The sum of the $$infinite$$ geometric series is $$\\frac{-4}{3}$$.", variabilization: {}}, ]; export {hints};