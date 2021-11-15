var hints = [{id: "ser19a-h1", type: "hint", dependencies: [], title: "Explicit Formula", text: "The given formula, $$27{\\left(\\frac{1}{3}\\right)}^k$$, is exponential with a base of $$\\frac{1}{3}$$.", variabilization: {}}, {id: "ser19a-h2", type: "hint", dependencies: ["ser19a-h1"], title: "Identify r", text: "The series is geometric with a common ratio of $$\\frac{1}{3}$$.", variabilization: {}}, {id: "ser19a-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["T"], dependencies: ["ser19a-h2"], title: "Confirm that $$-1<r<1$$", text: "Is $$-1<\\frac{1}{3}<1$$ True or False?", variabilization: {}}, {id: "ser19a-h4", type: "hint", dependencies: ["ser19a-h3"], title: "Sum of Infinite Geometric Series", text: "Since $$-1<\\frac{1}{3}<1$$ is T, then sum is defined.", variabilization: {}}, ]; export {hints};