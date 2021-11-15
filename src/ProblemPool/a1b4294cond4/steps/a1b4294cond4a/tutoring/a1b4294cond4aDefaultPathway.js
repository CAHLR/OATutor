var hints = [{id: "a1b4294cond4a-h1", type: "hint", dependencies: [], title: "Conditional Probability Formula", text: "The conditional probability of A given B may be computed by means of the following formula: P(A$$\mid$$B)=P(A$$\cap$$B)/P(B)", variabilization: {}}, {id: "a1b4294cond4a-h2", type: "hint", dependencies: ["a1b4294cond4a-h1"], title: "Sample Spaces", text: "Let F denote the event \"bag contains a forbidden item,\" let N denote the event \"bag does not contain a forbidden item,\" and let A denote the event \"alarm is triggered.\" Then P(F$$\mid$$A)=P(F$$\cap$$A)/P(A)", variabilization: {}}, {id: "a1b4294cond4a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0.049"], dependencies: ["a1b4294cond4a-h2"], title: "P(F$$\cap$$A)", text: "Find the probability that a randomly selected bag contains a forbidden item AND triggers the alarm. Round your answer to three decimal places", subHints: [{id: "a1b4294cond4a-h3-s1", type: "hint", dependencies: [], title: "P(F$$\cap$$A)", text: "Since 5% percent of bags contain a forbidden item and 98% percent of those bags trigger the alarm, we multiply those probabilities: $$P(F$$\\cap$$A)=\\left(0.05\\right) \\left(0.98\\right)=0.049$$", variabilization: {}}], variabilization: {}}, {id: "a1b4294cond4a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0.125"], dependencies: ["a1b4294cond4a-h2"], title: "P(A)", text: "Find the probability that a random random bag triggers the alarm. Round your answer to three decimal places", subHints: [{id: "a1b4294cond4a-h4-s1", type: "hint", dependencies: [], title: "P(A)", text: "There are two situations where a bag can trigger the alarm: the bag contains a forbidden item AND triggers the alarm or the bag does not contain a forbidden item AND triggers the alarm. We add those two probabilities together to get P(A). That is, P(A)=P(F$$\cap$$A)+P(N$$\cap$$A)", variabilization: {}}, {id: "a1b4294cond4a-h4-s2", type: "hint", dependencies: ["a1b4294cond4a-h4-s1"], title: "P(N$$\cap$$A)", text: "Since 95% percent of bags do not contain a forbidden item and 8% percent of those bags trigger the alarm, we multiply those probabilities: $$P(N$$\\cap$$A)=\\left(0.95\\right) \\left(0.08\\right)=0.076$$", variabilization: {}}, {id: "a1b4294cond4a-h4-s3", type: "hint", dependencies: ["a1b4294cond4a-h4-s2"], title: "P(A)", text: "P(A)=P(F$$\cap$$A)+P(N$$\cap$$A)=0.049+0.076=0.125. Therefore the probability of a random bag triggering the alarm is 0.125", variabilization: {}}], variabilization: {}}, {id: "a1b4294cond4a-h5", type: "hint", dependencies: ["a1b4294cond4a-h3", "a1b4294cond4a-h4"], title: "P(F$$\mid$$A)", text: "Using the conditional probability formula, calculate P(F$$\mid$$A) using P(F$$\cap$$A) and P(A)", variabilization: {}}, {id: "a1b4294cond4a-h6", type: "hint", dependencies: ["a1b4294cond4a-h5"], title: "P(F$$\mid$$A)", text: "P(F$$\mid$$A)=P(F$$\cap$$A)/P(A)=0.049/0.125=0.392", variabilization: {}}, ]; export {hints};