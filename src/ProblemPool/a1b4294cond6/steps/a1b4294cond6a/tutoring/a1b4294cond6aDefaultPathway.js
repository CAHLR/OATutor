var hints = [{id: "a1b4294cond6a-h1", type: "hint", dependencies: [], title: "Conditional Probability Formula", text: "The conditional probability of A given B may be computed by means of the following formula: P(A$$\mid$$B)=P(A$$∩$$B)/P(B). This can be rewritten as P(A$$∩$$B)=P(A$$\mid$$B)*P(B)", variabilization: {}}, {id: "a1b4294cond6a-h2", type: "hint", dependencies: ["a1b4294cond6a-h1"], title: "Sample Spaces", text: "Let F denote the event \"draw a face card first\" and let N denote the event \"draw a nonface card second.\" Then P(N$$∩$$F)=P(N$$\mid$$F)*P(F)", variabilization: {}}, {id: "a1b4294cond6a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{12}{52}$$"], dependencies: ["a1b4294cond6a-h2"], title: "P(F)", text: "What is the probability that the first card drawn is a face card? Enter your answer as a fraction", subHints: [{id: "a1b4294cond6a-h3-s1", type: "hint", dependencies: [], title: "P(F)", text: "When the card is drawn, 12 cards are face cards out of the 52 possible cards chosen. Therefore, the probability of drawing a face card is $$\\frac{12}{52}$$", variabilization: {}}], variabilization: {}}, {id: "a1b4294cond6a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{40}{51}$$"], dependencies: ["a1b4294cond6a-h2"], title: "P(N$$\mid$$F)", text: "What is the probability that the second card drawn is a nonface card? Enter your answer as a fraction", variabilization: {}}, {id: "a1b4294cond6a-h5", type: "hint", dependencies: ["a1b4294cond6a-h4"], title: "P(N$$\mid$$F)", text: "When the second card is drawn, 40 cards are nonface cards out of the 51 possible cards chosen. Therefore, the probability of drawing a nonface card is $$\\frac{40}{51}$$", variabilization: {}}, {id: "a1b4294cond6a-h6", type: "hint", dependencies: ["a1b4294cond6a-h3", "a1b4294cond6a-h4", "a1b4294cond6a-h5"], title: "P(N$$∩$$F)", text: "Using the conditional probability formula, P(F$$∩$$N)=P(N$$\mid$$F)*P(F)=(40/51)*(12/52)=480/2652=40/221", variabilization: {}}, ]; export {hints};