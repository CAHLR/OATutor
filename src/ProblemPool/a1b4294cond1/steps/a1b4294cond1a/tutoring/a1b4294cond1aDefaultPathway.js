var hints = [{id: "a1b4294cond1a-h1", type: "hint", dependencies: [], title: "Conditional Probability Formula", text: "The conditional probability of A given B may be computed by means of the following formula: P(A$$\mid$$B)=P(A$$\cap$$B)/P(B)", variabilization: {}}, {id: "a1b4294cond1a-h2", type: "hint", dependencies: ["a1b4294cond1a-h1"], title: "Sample Spaces", text: "The sample space for this experiment is the set $$S=1, 2, 3, 4, 5, 6$$ consisting of six equally likely outcomes. Let F denote the event “a five is rolled” and let O denote the event “an odd number is rolled,” so that $$F=5$$ and $$O=1, 3, 5$$", variabilization: {}}, {id: "a1b4294cond1a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{6}$$"], dependencies: ["a1b4294cond1a-h2"], title: "P(F$$\cap$$O)", text: "What is the probability of rolling a number in both set F AND set O?", subHints: [{id: "a1b4294cond1a-h3-s1", type: "hint", dependencies: [], title: "P(F$$\cap$$O)", text: "5 is the only number in both F AND O. Rolling a 5 is only 1 possible outcome out of 6. Therefore, probability of rolling a 5 is $$\\frac{1}{6}$$", variabilization: {}}], variabilization: {}}, {id: "a1b4294cond1a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{2}$$"], dependencies: ["a1b4294cond1a-h2"], title: "P(O)", text: "What is the probability of rolling a number in set O?", subHints: [{id: "a1b4294cond1a-h4-s1", type: "hint", dependencies: [], title: "P(O)", text: "Rolling a 1, 3, or 5 is 3 possible outcomes out of 6. Therefore, the probability of rolling a number in set O is $$\\frac{3}{6}$$, or $$\\frac{1}{2}$$", variabilization: {}}], variabilization: {}}, {id: "a1b4294cond1a-h5", type: "hint", dependencies: ["a1b4294cond1a-h3", "a1b4294cond1a-h4"], title: "P(F$$\mid$$O)", text: "Using the conditional probability formula, calculate P(F$$\mid$$O) using P(F$$\cap$$O) and P(O)", variabilization: {}}, ]; export {hints};