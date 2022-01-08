var hints = [{id: "b1aaff50dradical11a-h1", type: "hint", dependencies: [], title: "Finding the Largest Perfect Square", text: "You must first identify the largest perfect square factor of the number inside the radical.", variabilization: {}}, {id: "b1aaff50dradical11a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["25"], dependencies: ["b1aaff50dradical11a-h1"], title: "Finding the Largest Perfect Square", text: "What is the largest perfect square factor of the number inside the radical?", variabilization: {}}, {id: "b1aaff50dradical11a-h3", type: "hint", dependencies: ["b1aaff50dradical11a-h2"], title: "Rewriting the Radical", text: "You must now rewrite the radical as the product of two radicals. One of these radicals must include the perfect square. This is possible because of the product rule.", variabilization: {}}, {id: "b1aaff50dradical11a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$5+\\sqrt{25} \\sqrt{3}$$"], dependencies: ["b1aaff50dradical11a-h3"], title: "Rewriting the Radical", text: "What is the result?", variabilization: {}}, {id: "b1aaff50dradical11a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$5+5\\sqrt{3}$$"], dependencies: ["b1aaff50dradical11a-h4"], title: "Simplfying the Radicals", text: "What is the result after simplifying the square root with the perfect square?", variabilization: {}}, ]; export {hints};