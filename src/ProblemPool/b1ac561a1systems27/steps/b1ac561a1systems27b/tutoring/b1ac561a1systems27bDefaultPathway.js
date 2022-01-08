var hints = [{id: "b1ac561a1systems27b-h1", type: "hint", dependencies: [], title: "Subtract", text: "The first step is to subtract both equations from each other, eliminating y, then moving all terms to the left side of the equation.", variabilization: {}}, {id: "b1ac561a1systems27b-h2", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$-\\left(x^2\\right)+4x-3$$"], dependencies: ["b1ac561a1systems27b-h1"], title: "Subtract and Simplify", text: "After subtracting the two equations and bringing all terms to the left side, what equation do you have?", choices: ["$$-\\left(x^2\\right)+4x-3$$", "$$x^2-4x+3$$", "$$2x^2+6x+1$$", "None of the Above"], variabilization: {}}, {id: "b1ac561a1systems27b-h3", type: "hint", dependencies: ["b1ac561a1systems27b-h2"], title: "Factor", text: "The next step is to factor the equation and set it equal to zero.", variabilization: {}}, {id: "b1ac561a1systems27b-h4", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["(x-1)(x-3)"], dependencies: ["b1ac561a1systems27b-h3"], title: "Factor", text: "What is the factored form of the equation?", choices: ["(x-1)(x-3)", "$$\\left(x+1\\right) \\left(x-3\\right)$$", "$$\\left(x-1\\right) \\left(x+3\\right)$$", "None of the Above"], variabilization: {}}, {id: "b1ac561a1systems27b-h5", type: "hint", dependencies: ["b1ac561a1systems27b-h4"], title: "Solve", text: "Next, solve for x.", variabilization: {}}, {id: "b1ac561a1systems27b-h6", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$y=3, 11$$"], dependencies: ["b1ac561a1systems27b-h5"], title: "Substitute and Solve", text: "Next, plug $$x=1$$ and $$x=3$$ into either of the original equations. Solve for y in both cases. What are the values of y?", choices: ["$$y=3, 11$$", "$$y=-3, 11$$", "$$y=3, -11$$", "$$y=-3, -11$$"], variabilization: {}}, {id: "b1ac561a1systems27b-h7", type: "hint", dependencies: ["b1ac561a1systems27b-h6"], title: "Answer", text: "Therefore, the solutions to the nonlinear sysytem are (1,3)(3,11).", variabilization: {}}, ]; export {hints};