var hints = [{id: "a6041a9Solvquad5a-h1", type: "hint", dependencies: [], title: "Isolate the Quadratic Term and Make Its Coefficient One", text: "We add 54 to both sides to get $$x^2$$ by itself which gives $$x^2=54$$. Since the coefficient of $$x^2$$ is 1 already, we do not need to take extra step.", variabilization: {}}, {id: "a6041a9Solvquad5a-h2", type: "hint", dependencies: ["a6041a9Solvquad5a-h1"], title: "Use Square root Property", text: "The square root property: if $$x^2$$ $$=$$ k, then x $$=$$ $$\\sqrt{k}$$, or x $$=$$ $$-\\sqrt{k}$$. $$x^2=54$$, we can take square root both sides and get $$x=\\sqrt{54}$$ or $$x=-\\sqrt{54}$$.", variabilization: {}}, {id: "a6041a9Solvquad5a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$-3\\sqrt{6}$$"], dependencies: ["a6041a9Solvquad5a-h2"], title: "Simplify the Radical", text: "Simplify $$-\\sqrt{54}$$.", variabilization: {}}, {id: "a6041a9Solvquad5a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$3\\sqrt{6}$$"], dependencies: ["a6041a9Solvquad5a-h3"], title: "Simplify the Radical", text: "Simplify $$\\sqrt{54}$$.", variabilization: {}}, {id: "a6041a9Solvquad5a-h5", type: "hint", dependencies: ["a6041a9Solvquad5a-h4"], title: "Final Answer", text: "Therefore, $$x^2-54$$ $$=$$ 0 has two solutions which are $$x=-3\\sqrt{6}$$ and $$x=3\\sqrt{6}$$.", variabilization: {}}, ]; export {hints};