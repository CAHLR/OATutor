var hints = [{id: "abac4b0probbasic17a-h1", type: "hint", dependencies: [], title: "Probability Rules", text: "To find the probability of our situation, we first need to find out how many students we can choose from.", variabilization: {}}, {id: "abac4b0probbasic17a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["450"], dependencies: ["abac4b0probbasic17a-h1"], title: "Total Employees", text: "How many students have a job?", variabilization: {}}, {id: "abac4b0probbasic17a-h3", type: "hint", dependencies: ["abac4b0probbasic17a-h2"], title: "Probability Rules", text: "Next, we need to find the amount of students that correspond to our initial condition.", variabilization: {}}, {id: "abac4b0probbasic17a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["50"], dependencies: ["abac4b0probbasic17a-h3"], title: "Total Working Athletes", text: "How many students play sports and have a job?", variabilization: {}}, {id: "abac4b0probbasic17a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{9}$$"], dependencies: ["abac4b0probbasic17a-h4"], title: "Answer", text: "To find our answer, we can take our first proportion and divide it by our second to get the probability. What is our final answer?", variabilization: {}}, ]; export {hints};