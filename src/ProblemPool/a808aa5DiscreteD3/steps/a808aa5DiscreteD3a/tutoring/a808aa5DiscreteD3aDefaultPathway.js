var hints = [{id: "a808aa5DiscreteD3a-h1", type: "hint", dependencies: [], title: "Calculating Expected Values", text: "To calculate the expected value of something, we can use the equation E[X] $$=$$ $$\\sum_{i=0}^{...-1} p\\left(X_i\\right) X_i$$, where $$p\\left(X_i\\right)$$ is the probability of $$X_i$$.", variabilization: {}}, {id: "a808aa5DiscreteD3a-h2", type: "hint", dependencies: ["a808aa5DiscreteD3a-h1"], title: "What is X?", text: "Since $$X=Getting$$ one point, we can set $$X=1$$ in our formula.", variabilization: {}}, {id: "a808aa5DiscreteD3a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{6}$$"], dependencies: ["a808aa5DiscreteD3a-h2"], title: "Calculating Probabilities", text: "What is the probability that we get a point? In other words, what is the probability our guess matches a random dice roll?", variabilization: {}}, {id: "a808aa5DiscreteD3a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{6}$$"], dependencies: ["a808aa5DiscreteD3a-h3"], title: "Answer", text: "Now that we have all of our variables, what is our final answer going to be?", variabilization: {}}, ]; export {hints};