var hints = [{id: "b1af69facexpolog26c-h1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$2A_0$$"], dependencies: [], title: "Population Count", text: "The population doubles when y is equal to? Express in terms of $$A_0$$.", variabilization: {}}, {id: "b1af69facexpolog26c-h2", type: "hint", dependencies: ["b1af69facexpolog26c-h1"], title: "Doubling Time", text: "We can substitute $$y=2A_0$$ and solve for t.", variabilization: {}}, {id: "b1af69facexpolog26c-h3", type: "hint", dependencies: ["b1af69facexpolog26c-h2"], title: "Doubling Time", text: "Divide by $$A_0$$ on both sides.", variabilization: {}}, {id: "b1af69facexpolog26c-h4", type: "hint", dependencies: ["b1af69facexpolog26c-h3"], title: "Doubling Time", text: "Take natural log on both sides.", variabilization: {}}, {id: "b1af69facexpolog26c-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["10"], dependencies: ["b1af69facexpolog26c-h4"], title: "Doubling Time", text: "Divide by k on both sides. This should have isolated t. Substitute $$A_0$$ and k that was previously found to solve for t. What is t? Round to the nearest minute", variabilization: {}}, ]; export {hints};