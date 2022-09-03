var hints = [{id: "a47ffd9Ind2a-h1", type: "hint", dependencies: [], title: "Definition of With Replacement", text: "If each member of a population is replaced after it is picked, then that member has the possibility of being chosen more than once. When sampling is done with replacement, then events are considered to be independent, meaning the result of the first pick will not change the probabilities for the second pick.", variabilization: {}}, {id: "a47ffd9Ind2a-h2", type: "hint", dependencies: ["a47ffd9Ind2a-h1"], title: "Definition of Without Replacement", text: "When sampling is done without replacement, each member of a population may be chosen only once. In this case, the probabilities for the second pick are affected by the result of the first pick. The events are considered to be dependent or not independent.", variabilization: {}}, {id: "a47ffd9Ind2a-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["With Replacement"], dependencies: ["a47ffd9Ind2a-h2"], title: "Answer", text: "Knowing the definitions of with and without replacement, what is the answer to our original question?", choices: ["With Replacement", "Without Replacement"], variabilization: {}}, ]; export {hints};