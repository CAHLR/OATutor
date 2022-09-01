var hints = [{id: "af23a60contingency10a-h1", type: "hint", dependencies: [], title: "Probability Rules", text: "To find the probability of this situation, we have to first identify how many athletes there are.", variabilization: {}}, {id: "af23a60contingency10a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["800"], dependencies: ["af23a60contingency10a-h1"], title: "Athlete Count", text: "How many athletes are there in this study?", variabilization: {}}, {id: "af23a60contingency10a-h3", type: "hint", dependencies: ["af23a60contingency10a-h2"], title: "Probability Rules", text: "To find the probability of this situation, we can divide the number of athletes who stretch and have gotten injured by the total number of athletes.", variabilization: {}}, {id: "af23a60contingency10a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["55"], dependencies: ["af23a60contingency10a-h3"], title: "Injured and Stretch Count", text: "How many athletes are there that have gotten injured and also stretch before exercising?", variabilization: {}}, {id: "af23a60contingency10a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{55}{800}$$"], dependencies: ["af23a60contingency10a-h4"], title: "Answer", text: "Given the information in the hints, what is our final answer going to be?", variabilization: {}}, ]; export {hints};