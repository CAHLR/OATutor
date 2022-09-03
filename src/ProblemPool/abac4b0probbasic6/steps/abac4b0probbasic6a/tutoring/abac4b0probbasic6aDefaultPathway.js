var hints = [{id: "abac4b0probbasic6a-h1", type: "hint", dependencies: [], title: "Probability Rules", text: "To find the probability of our situation, we first need to find out how many M&M's we can choose from.", variabilization: {}}, {id: "abac4b0probbasic6a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["30"], dependencies: ["abac4b0probbasic6a-h1"], title: "Total M&M's", text: "How many blue, yellow and red M&M's are there?", variabilization: {}}, {id: "abac4b0probbasic6a-h3", type: "hint", dependencies: ["abac4b0probbasic6a-h2"], title: "Probability Rules", text: "Next, we need to find the amount of M&M's that correspond to our initial condition.", variabilization: {}}, {id: "abac4b0probbasic6a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["10"], dependencies: ["abac4b0probbasic6a-h3"], title: "Total Yellow M&M's", text: "How many yellow M&M's are there?", variabilization: {}}, {id: "abac4b0probbasic6a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{3}$$"], dependencies: ["abac4b0probbasic6a-h4"], title: "Answer", text: "To find our answer, we can take our first proportion and divide it by our second to get the probability. What is our final answer?", variabilization: {}}, ]; export {hints};