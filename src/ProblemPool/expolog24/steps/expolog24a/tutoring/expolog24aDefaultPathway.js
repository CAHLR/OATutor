var hints = [{id: "expolog24a-h1", type: "hint", dependencies: [], title: "Exponential Growth and Decay", text: "We are able to use the formula $$y=A_0 e^{k t}$$ where $$A_0$$ is equal to the value at time zero, e is Euler’s constant, and k is a positive constant that determines the rate of growth or decay to model exponential growth or decay respectively. In the case of an exponential growth, the k value is positive while in the case of an exponential decay, the k value is negative.", variabilization: {}}, {id: "expolog24a-h2", type: "hint", dependencies: [], title: "Rate of $$\\frac{Growth}{Decay}$$", text: "We want to find the rate of decay, k, so that we can obtain the expression. The model for exponential decay is $$y=A_0 e^{k t}$$.", variabilization: {}}, {id: "expolog24a-h3", type: "hint", dependencies: ["expolog24a-h2"], title: "Rate of $$\\frac{Growth}{Decay}$$", text: "Divide by $$A_0$$ on both sides.", variabilization: {}}, {id: "expolog24a-h4", type: "hint", dependencies: ["expolog24a-h3"], title: "Rate of $$\\frac{Growth}{Decay}$$", text: "Take the natural log of both sides.", variabilization: {}}, {id: "expolog24a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{ln \\frac{y}{A_0}}{t}$$"], dependencies: ["expolog24a-h4"], title: "Rate of $$\\frac{Growth}{Decay}$$", text: "Divide by the time variable. We now obtain an expression for the rate of decay, k. What is k? Express in terms of y, $$A_0$$ and t.", variabilization: {}}, {id: "expolog24a-h6", type: "hint", dependencies: [], title: "Half-life", text: "Observe that the expression, $$\\frac{y}{A_0}$$ within the natural log expression is the proportion of the object's mass left. At half-life, this would be 50% or 0.5.", variabilization: {}}, {id: "expolog24a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-0.00012"], dependencies: ["expolog24a-h5", "expolog24a-h6"], title: "Substitution", text: "We can substitute $$\\frac{y}{A_0}=0.5$$ and the half-life time, $$t=5730$$ that is given. What is k? Round to five decimal places.", variabilization: {}}, {id: "expolog24a-h8", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{ln \\frac{y}{A_0}}{k}$$"], dependencies: ["expolog24a-h7"], title: "Solving for t", text: "We can rearrange the equation that we obtained such that t is the subject. Express t in terms of y,A_0,k.", variabilization: {}}, {id: "expolog24a-h9", type: "hint", dependencies: ["expolog24a-h8"], title: "Proportionality", text: "Observe that the expression, $$\\frac{y}{A_0}$$ within the natural log expression is the proportion of the object's mass left. We are interested to find how long it took to reach 60% of the carbon-14 present in living trees. Thus, we can let $$\\frac{y}{A_0}=0.6$$.", variabilization: {}}, {id: "expolog24a-h10", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["4223"], dependencies: ["expolog24a-h9"], title: "Substitution", text: "We can substitute $$\\frac{y}{A_0}=0.6$$ and the rate of decay,k that was previously found. What is t? Round to nearest year.", variabilization: {}}, ]; export {hints};