var hints = [{id: "b1a6f9727real15a-h1", type: "hint", dependencies: [], title: "Total Cups of Butter and Flour", text: "The first step is to calculate how many cups of each ingredient the students brought.", variabilization: {}}, {id: "b1a6f9727real15a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{17}{4}$$"], dependencies: ["b1a6f9727real15a-h1"], title: "Total Cups of Flour", text: "How many cups of Flour did the students bring?", subHints: [{id: "b1a6f9727real15a-h2-s1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{17}{4}$$"], dependencies: [], title: "Total Cups of Flour", text: "What is $$2+1+\\frac{5}{4}$$?", variabilization: {}}], variabilization: {}}, {id: "b1a6f9727real15a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{3}{2}$$"], dependencies: ["b1a6f9727real15a-h1"], title: "Total Cups of Butter", text: "How many cups of Butter did the students bring?", subHints: [{id: "b1a6f9727real15a-h3-s1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{3}{2}$$"], dependencies: [], title: "Total Cups of Butter", text: "What is $$\\frac{1}{4}+\\frac{1}{2}+\\frac{3}{4}$$?", variabilization: {}}], variabilization: {}}, {id: "b1a6f9727real15a-h4", type: "hint", dependencies: ["b1a6f9727real15a-h2", "b1a6f9727real15a-h3"], title: "Batches of Cookies", text: "Next, calculate how many batches of cookies each ingredient can contribute to.", variabilization: {}}, {id: "b1a6f9727real15a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{17}{3}$$"], dependencies: ["b1a6f9727real15a-h4"], title: "Flour for Cookies", text: "What is $$\\frac{\\frac{17}{4}}{\\frac{3}{4}}$$?", variabilization: {}}, {id: "b1a6f9727real15a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{9}{2}$$"], dependencies: ["b1a6f9727real15a-h4"], title: "Butter for Cookies", text: "What is $$\\frac{\\frac{3}{2}}{\\frac{1}{3}}$$?", variabilization: {}}, {id: "b1a6f9727real15a-h7", type: "hint", dependencies: ["b1a6f9727real15a-h5", "b1a6f9727real15a-h6"], title: "Limting Factor", text: "The butter serves as a limiting factor since it can only make 4 batches while the flour can make 5.", variabilization: {}}, ]; export {hints};