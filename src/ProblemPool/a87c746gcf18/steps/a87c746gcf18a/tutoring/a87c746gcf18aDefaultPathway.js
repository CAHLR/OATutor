var hints = [{id: "a87c746gcf18a-h1", type: "hint", dependencies: [], title: "Greatest Common Factor", text: "The first step is determining the greatest common factor between the three terms.", variabilization: {}}, {id: "a87c746gcf18a-h2", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["5*x"], dependencies: ["a87c746gcf18a-h1"], title: "GCF", text: "What is the GCF for the three terms?", subHints: [{id: "a87c746gcf18a-h2-s1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["5"], dependencies: [], title: "GCF for Constants", text: "What is the GCF for 5, 15, and 20?", variabilization: {}}, {id: "a87c746gcf18a-h2-s2", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["x"], dependencies: [], title: "GCF for Variables", text: "What is the GCF for $$x^3$$, $$x^2$$, and x?", variabilization: {}}, {id: "a87c746gcf18a-h2-s3", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["5*x"], dependencies: [], title: "Overall GCF", text: "Multiply the two previous partial GCFS you found to get the overall GCF. What is it?", variabilization: {}}], variabilization: {}}, {id: "a87c746gcf18a-h3", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["x**2-3x+4"], dependencies: ["a87c746gcf18a-h2"], title: "Factorization", text: "Now, factor each of the terms separately. What is the sum of the terms?", subHints: [{id: "a87c746gcf18a-h3-s4", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["x**2"], dependencies: [], title: "Factor $$3x^2$$", text: "Factor out $$5x$$ from $$5x^3$$. What remains?", variabilization: {}}, {id: "a87c746gcf18a-h3-s5", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["-3*x"], dependencies: [], title: "Factor 6x", text: "Factor out $$5x$$ from $$-15x^2$$. What remains?", variabilization: {}}, {id: "a87c746gcf18a-h3-s6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["4"], dependencies: [], title: "Factor -9", text: "Factor out $$5x$$ from $$20x$$. What remains?", variabilization: {}}, {id: "a87c746gcf18a-h3-s7", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$x^2-3x+4$$"], dependencies: [], title: "Summation of factors", text: "Using the \"reverse\" Distributive Property, add together the three factors previously found. What is the sum?", choices: ["$$x^2-3x+4$$", "$$3x^2-4x+1$$", "$$4x^2-3x+1$$", "$$x^2-4x+3$$"], variabilization: {}}], variabilization: {}}, {id: "a87c746gcf18a-h4", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["5*x*(x**2-3x+4)"], dependencies: ["a87c746gcf18a-h3"], title: "Final Answer", text: "Using knowledge of the distributive property, multiply the GCF with the sum of the factored values to get the final answer for the factorization of $$5x^3-15x^2+20x$$.", variabilization: {}}, ]; export {hints};