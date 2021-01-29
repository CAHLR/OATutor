var hints = [{id: "measure10a-h1", type: "hint", dependencies: [], title: "Convert", text: "We can convert both measurements to either centimeters or meters. Since meters is the larger unit, we will subtract the lengths in meters."}, {id: "measure10a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["100"], dependencies: ["measure10a-h1"], title: "Convert", text: "How many centimeters are in one meter?"}, {id: "measure10a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0.85"], dependencies: ["measure10a-h2"], title: "Convert", text: "We convert 85 centimeters to meters by moving the decimal 2 places to the left. What do we get after the conversion?"}, {id: "measure10a-h4", type: "hint", dependencies: ["measure10a-h3"], title: "Subtract", text: "We now want to find the difference between 1.60 and 0.85."}, {id: "measure10a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0.75"], dependencies: ["measure10a-h4"], title: "Subtract", text: "What do we get after the subtraction?"}, ]; export {hints};