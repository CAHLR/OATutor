var hints = [{id: "b1a1f0162sequences11a-h1", type: "hint", dependencies: [], title: "Identifying Given Values", text: "Identify the initial term, a1, which is given as part of the formula. This is the first term.", variabilization: {}}, {id: "b1a1f0162sequences11a-h2", type: "hint", dependencies: ["b1a1f0162sequences11a-h1"], title: "Finding Next Terms", text: "To find the second term, a2, substitute the initial term into the formula for an-1. Solve. Repeat until you have solved for the 5th term.", variabilization: {}}, {id: "b1a1f0162sequences11a-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["9,11,14,18,23"], dependencies: ["b1a1f0162sequences11a-h2"], title: "First 5 Terms of Sequence", text: "What are the first 5 terms of the sequence?", choices: ["-9,11,-14,18,-23", "9,11,14,18,23", "0,9,11,14,18", "1,9,11,14,18"], variabilization: {}}, ]; export {hints};