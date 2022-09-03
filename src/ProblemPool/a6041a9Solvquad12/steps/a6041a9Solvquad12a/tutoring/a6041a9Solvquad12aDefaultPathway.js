var hints = [{id: "a6041a9Solvquad12a-h1", type: "hint", dependencies: [], title: "Isolate the Quadratic Term", text: "We minus 4 on both sides to get $$u^2$$ by itself which gives $$\\frac{1}{2} u^2=20$$.", variabilization: {}}, {id: "a6041a9Solvquad12a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{2}$$"], dependencies: ["a6041a9Solvquad12a-h1"], title: "Find Leading Coefficient", text: "What's the coefficient of $$u^2$$ now?", variabilization: {}}, {id: "a6041a9Solvquad12a-h3", type: "hint", dependencies: ["a6041a9Solvquad12a-h2"], title: "Make the Leading Coefficient \"1\"", text: "Divide by the leading coefficient on both sides which gives $$u^2$$ $$=40$$.", variabilization: {}}, {id: "a6041a9Solvquad12a-h4", type: "hint", dependencies: ["a6041a9Solvquad12a-h3"], title: "Use Square root Property", text: "The square root property: if $$x^2$$ $$=$$ k, then x $$=$$ $$\\sqrt{k}$$, or x $$=$$ $$-\\sqrt{k}$$, or x $$=\\sqrt{k}$$. $$u^2=40$$, we can take square root both sides and get $$u=\\sqrt{40}$$ or $$u=-\\sqrt{40}$$.", variabilization: {}}, {id: "a6041a9Solvquad12a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$-2\\sqrt{10}$$"], dependencies: ["a6041a9Solvquad12a-h4"], title: "Simplify the Radical", text: "Simplify $$-\\sqrt{40}$$.", variabilization: {}}, {id: "a6041a9Solvquad12a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$2\\sqrt{10}$$"], dependencies: ["a6041a9Solvquad12a-h5"], title: "Simplify the Radical", text: "Simplify $$\\sqrt{40}$$.", variabilization: {}}, {id: "a6041a9Solvquad12a-h7", type: "hint", dependencies: ["a6041a9Solvquad12a-h6"], title: "Final Answer", text: "Therefore, $$\\frac{1}{2} u^2+4=24$$ has two solutions which are $$u=-2\\sqrt{10}$$, and $$u=2\\sqrt{10}$$.", variabilization: {}}, ]; export {hints};