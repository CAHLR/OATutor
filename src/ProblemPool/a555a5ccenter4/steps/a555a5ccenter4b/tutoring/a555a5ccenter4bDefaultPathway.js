var hints = [{id: "a555a5ccenter4b-h5", type: "hint", dependencies: ["a555a5ccenter4a-h4"], title: "Determining the Houses worth $315,000", text: "Note that out of the 60 data points, we have one at $2,500,000, twenty-nine at $280,000, and the others at $315,000. Since we don't know how many houses are worth $315,000, we want to determine that before trying to find the location of the median or the median itself.", variabilization: {}}, {id: "a555a5ccenter4b-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["30"], dependencies: ["a555a5ccenter4b-h5"], title: "Determining the Houses worth $315,000", text: "How many households are worth $315,000?", subHints: [{id: "a555a5ccenter4b-h6-s1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["30"], dependencies: [], title: "Determining the Houses worth $315,000", text: "What is 60-1-29?", variabilization: {}}], variabilization: {}}, {id: "a555a5ccenter4b-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["30.5"], dependencies: ["a555a5ccenter4b-h6"], title: "Determining Location of the Median", text: "What is the location of the median? What is $$\\frac{n+1}{2}$$ where n represents the total number of households in the data set?", variabilization: {}}, {id: "a555a5ccenter4b-h8", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["315,000 and 315,000"], dependencies: ["a555a5ccenter4b-h7"], title: "Determining the 30th and 31st Data Values", text: "Because the location of the median is 30.5, we must take the average of the 30th and 31st data point. What are the 30th and 31st data points respectively?", choices: ["315,000 and 315,000", "280,000 and 315,000", "315,000 and 2,500,000", "280,000 and 280,000"], variabilization: {}}, {id: "a555a5ccenter4b-h9", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["315,000"], dependencies: ["a555a5ccenter4b-h8"], title: "Determining the Median Knowing Location", text: "What is the median? What is the average between the 30th and 31st data point?", variabilization: {}}, ]; export {hints};