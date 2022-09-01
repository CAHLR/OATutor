var hints = [{id: "af23a60contingency21a-h1", type: "hint", dependencies: [], title: "Probability Rules", text: "To find the probability of this situation, we need to first figure out how many total people are in our situation, then we must figure out the total number of people that \"could\" be in our situation (Occurences vs Total Events).", variabilization: {}}, {id: "af23a60contingency21a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["10"], dependencies: ["af23a60contingency21a-h1"], title: "Number in Situation", text: "How many students play alone and outside?", variabilization: {}}, {id: "af23a60contingency21a-h3", type: "hint", dependencies: ["af23a60contingency21a-h2"], title: "Probability Rules", text: "Now that we have the total number of people who are already in our situation, we just need to find out the total number of people who \"could\" be in our situation.", variabilization: {}}, {id: "af23a60contingency21a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["475"], dependencies: ["af23a60contingency21a-h3"], title: "Number of Students", text: "How many students are in the sample?", variabilization: {}}, {id: "af23a60contingency21a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{10}{475}$$"], dependencies: ["af23a60contingency21a-h4"], title: "Answer", text: "Now that we have the total number of students and the number of students who play alone and outside, what is our answer?", variabilization: {}}, ]; export {hints};