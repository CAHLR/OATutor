var hints = [{id: "afae108location2b-h9", type: "hint", dependencies: ["afae108location2a-h8"], title: "Using IQR to Determine Outliers", text: "The IQR can help to determine potential outliers. A value is a potential outlier if it is less than (1.5)(IQR) below the first quartile or more than (1.5)(IQR) above the third quartile.", variabilization: {}}, {id: "afae108location2b-h10", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["42750"], dependencies: ["afae108location2b-h9"], title: "Determine (1.5)(IQR)", text: "What is (1.5)(IQR)?", subHints: [{id: "afae108location2b-h10-s2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["42750"], dependencies: [], title: "Determine (1.5)(IQR)", text: "What is (1.5)(28500)?", variabilization: {}}], variabilization: {}}, {id: "afae108location2b-h11", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-2250"], dependencies: ["afae108location2b-h10"], title: "Determine Quartile 1-(1.5)(IQR)", text: "What is Quartile 1-(1.5)(IQR)?", subHints: [{id: "afae108location2b-h11-s3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-201625"], dependencies: [], title: "Determine Quartile 1-(1.5)(IQR)", text: "What is 40500-42750", variabilization: {}}], variabilization: {}}, {id: "afae108location2b-h12", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["111750"], dependencies: ["afae108location2b-h11"], title: "Determine Quartile $$3+1.5IQR$$", text: "What is Quartile $$3+1.5IQR$$?", subHints: [{id: "afae108location2b-h12-s4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["111750"], dependencies: [], title: "Determine Quartile $$3+1.5IQR$$", text: "What is $$69000+42750$$?", variabilization: {}}], variabilization: {}}, {id: "afae108location2b-h13", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["No"], dependencies: ["afae108location2b-h12"], title: "Determining Outliers", text: "Are there any values in the data set that are less than (1.5)(IQR) below the first quartile?", choices: ["Yes", "No"], variabilization: {}}, {id: "afae108location2b-h14", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: ["afae108location2b-h13"], title: "Determining Outliers", text: "Are there any values in the data set that are greater than (1.5)(IQR) above the third quartile?", choices: ["Yes", "No"], variabilization: {}}, {id: "afae108location2b-h15", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["120000"], dependencies: ["afae108location2b-h14"], title: "Determine the Potential Outlier", text: "What is the potential outlier that is greater than (1.5)(IQR) above Quartile 3?", choices: ["69000", "72000", "120000", "685000"], variabilization: {}}, ]; export {hints};