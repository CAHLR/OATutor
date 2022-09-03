var hints = [{id: "ace0d88location1b-h9", type: "hint", dependencies: ["ace0d88location1a-h8"], title: "Using IQR to Determine Outliers", text: "The IQR can help to determine potential outliers. A value is a potential outlier if it is less than (1.5)(IQR) below the first quartile or more than (1.5)(IQR) above the third quartile.", variabilization: {}}, {id: "ace0d88location1b-h10", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["510375"], dependencies: ["ace0d88location1b-h9"], title: "Determine (1.5)(IQR)", text: "What is (1.5)(IQR)?", subHints: [{id: "ace0d88location1b-h10-s2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["510375"], dependencies: [], title: "Determine (1.5)(IQR)", text: "What is (1.5)(340250)?", variabilization: {}}], variabilization: {}}, {id: "ace0d88location1b-h11", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-201625"], dependencies: ["ace0d88location1b-h10"], title: "Determine Quartile 1-(1.5)(IQR)", text: "What is Quartile 1-(1.5)(IQR)?", subHints: [{id: "ace0d88location1b-h11-s3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-201625"], dependencies: [], title: "Determine Quartile 1-(1.5)(IQR)", text: "What is 308750-510375", variabilization: {}}], variabilization: {}}, {id: "ace0d88location1b-h12", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["1159375"], dependencies: ["ace0d88location1b-h11"], title: "Determine Quartile $$3+1.5IQR$$", text: "What is Quartile $$3+1.5IQR$$?", subHints: [{id: "ace0d88location1b-h12-s4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["1159375"], dependencies: [], title: "Determine Quartile $$3+1.5IQR$$", text: "What is $$649000+510375$$?", variabilization: {}}], variabilization: {}}, {id: "ace0d88location1b-h13", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["No"], dependencies: ["ace0d88location1b-h12"], title: "Determining Outliers", text: "Are there any values in the data set that are less than (1.5)(IQR) below the first quartile?", choices: ["Yes", "No"], variabilization: {}}, {id: "ace0d88location1b-h14", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: ["ace0d88location1b-h13"], title: "Determining Outliers", text: "Are there any values in the data set that are greater than (1.5)(IQR) above the third quartile?", choices: ["Yes", "No"], variabilization: {}}, {id: "ace0d88location1b-h15", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["5500000"], dependencies: ["ace0d88location1b-h14"], title: "Determine the Potential Outlier", text: "What is the potential outlier that is greater than (1.5)(IQR) above Quartile 3?", choices: ["5500000", "1095000", "659000", "639000"], variabilization: {}}, ]; export {hints};