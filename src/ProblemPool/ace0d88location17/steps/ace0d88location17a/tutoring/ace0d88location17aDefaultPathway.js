var hints = [{id: "ace0d88location17a-h1", type: "hint", dependencies: [], title: "Formula for Finding the Percentile of a Value in a Data Set", text: "Remember the formula for finding the Percentile of a Value in a Data Set. We want to know three values once the list is ordered (which is already is from least to greatest): $$x=the$$ number of data values counting from the bottom of the data list up to but not including the data value for which you want to find the percentile; $$y=the$$ number of data values equal to the data vale for which you want to find the percentile; $$n=the$$ total number of data. Then, we can use the formula to calculate the percentile as $$100\\frac{x+0.5y}{n}$$. If the percentile is not an integer, round to the nearest integer.", variabilization: {}}, {id: "ace0d88location17a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["143"], dependencies: ["ace0d88location17a-h1"], title: "Determining x (Number of Points Below Desired Value)", text: "What is x? How many students ranked below Jesse?", subHints: [{id: "ace0d88location17a-h2-s1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["143"], dependencies: [], title: "Determining x (Number of Points Below Desired Value)", text: "What is 180-37?", variabilization: {}}], variabilization: {}}, {id: "ace0d88location17a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["1"], dependencies: ["ace0d88location17a-h2"], title: "Determining y (Repetition of Desired Value)", text: "How many times does 37 show up in the data? How many students can be ranked 37th?", variabilization: {}}, {id: "ace0d88location17a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["1"], dependencies: ["ace0d88location17a-h3"], title: "Determining y (Repetition of Desired Value)", text: "Assuming it is not possible for two students to tie in rank, how many students can be ranked 37th?", variabilization: {}}, {id: "ace0d88location17a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["180"], dependencies: ["ace0d88location17a-h4"], title: "Determining n (Total Number of Data)", text: "What is n, the total number of data in the set?", variabilization: {}}, {id: "ace0d88location17a-h6", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["79.72"], dependencies: ["ace0d88location17a-h5"], title: "Calculating the Percentile", text: "Calculate the percentile using the Formula for Finding the Percentile of a Value in a Data Set. Round your answer to the nearest hundredth.", choices: ["3.5", "0.1207", "12.07", "12"], subHints: [{id: "ace0d88location17a-h6-s2", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["79.72"], dependencies: [], title: "Calculating the Percentile", text: "What is $$100\\frac{143+0.5\\times1}{180}$$ rounded to the nearest hundredth?", choices: ["3.5", "0.1207", "12.07", "12"], variabilization: {}}], variabilization: {}}, {id: "ace0d88location17a-h7", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["No"], dependencies: ["ace0d88location17a-h6"], title: "Rounding the Percentile", text: "Is 79.72 a whole number?", choices: ["Yes", "No"], variabilization: {}}, {id: "ace0d88location17a-h8", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["80"], dependencies: ["ace0d88location17a-h7"], title: "Rounding the Percentile", text: "What is 79.72 rounded to the nearest whole number? This is the final percentile.", variabilization: {}}, ]; export {hints};