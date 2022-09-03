var hints = [{id: "a808aa5DiscreteD5a-h1", type: "hint", dependencies: [], title: "Calculating Binomial Probabilities", text: "To find a binomial probability, we can use the equation: (n choose x)*(p**x)*(q**n-x) where $$n=total$$ trials, $$x=number$$ of times our situation occurs, $$p=probability$$ of success, and $$q=probability$$ of failure.", variabilization: {}}, {id: "a808aa5DiscreteD5a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["2"], dependencies: ["a808aa5DiscreteD5a-h1"], title: "Acquiring Variables", text: "How many total trials are there? What is n in our equation?", variabilization: {}}, {id: "a808aa5DiscreteD5a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0"], dependencies: ["a808aa5DiscreteD5a-h2"], title: "Acquiring Variables", text: "How many times does our situation occur? What is x in our equation?", variabilization: {}}, {id: "a808aa5DiscreteD5a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{6}$$"], dependencies: ["a808aa5DiscreteD5a-h3"], title: "Acquiring Variables", text: "What is the probability of success in 1 trial? What is p?", variabilization: {}}, {id: "a808aa5DiscreteD5a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{5}{6}$$"], dependencies: ["a808aa5DiscreteD5a-h4"], title: "Acquiring Variables", text: "What is the probability of failure in 1 trial? What is q?", variabilization: {}}, {id: "a808aa5DiscreteD5a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0.6944"], dependencies: ["a808aa5DiscreteD5a-h5"], title: "Answer", text: "With all of our variables set up, what will our final answer be?", variabilization: {}}, ]; export {hints};