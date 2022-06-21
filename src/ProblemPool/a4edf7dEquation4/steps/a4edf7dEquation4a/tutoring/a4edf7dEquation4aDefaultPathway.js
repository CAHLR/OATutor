var hints = [{id: "a4edf7dEquation4a-h1", type: "hint", dependencies: [], title: "Assumption", text: "Assume one angle is m and the other angle is n", variabilization: {}}, {id: "a4edf7dEquation4a-h2", type: "hint", dependencies: ["a4edf7dEquation4a-h1"], title: "Principle", text: "Two supplementary angles means the addition of the two angles are 180, so $$m+n=180$$", variabilization: {}}, {id: "a4edf7dEquation4a-h3", type: "hint", dependencies: ["a4edf7dEquation4a-h1"], title: "Translation", text: "Converting the other statement to $$m=5n-12$$", variabilization: {}}, {id: "a4edf7dEquation4a-h4", type: "hint", dependencies: ["a4edf7dEquation4a-h2", "a4edf7dEquation4a-h3"], title: "Addition", text: "Combining the two equation together", variabilization: {}}, {id: "a4edf7dEquation4a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["32"], dependencies: ["a4edf7dEquation4a-h4"], title: "Calculation", text: "What is the value of n when $$6n=192$$?", variabilization: {}}, {id: "a4edf7dEquation4a-h6", type: "hint", dependencies: [], title: "Calculation", text: "Find the value of m with the known value of n", variabilization: {}}, ]; export {hints};