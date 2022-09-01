var hints = [{id: "af23a60contingency4a-h1", type: "hint", dependencies: [], title: "Probability Rules", text: "To find the probability of this situation, we first have to find out the total number of occurrences in which someone is driving. AKA, we want to know how many drivers there are.", variabilization: {}}, {id: "af23a60contingency4a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["755"], dependencies: ["af23a60contingency4a-h1"], title: "Total Drivers", text: "How many total drivers are there?", variabilization: {}}, {id: "af23a60contingency4a-h3", type: "hint", dependencies: ["af23a60contingency4a-h2"], title: "Probability Rules", text: "After getting the total number of drivers, we just need to find the total number of people who fulfill our original requirement. AKA, how many people use their phone while driving or have had no tickets in the past year.", variabilization: {}}, {id: "af23a60contingency4a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["710"], dependencies: ["af23a60contingency4a-h3"], title: "Total Phone Users", text: "How many drivers are there that use their phone whilst driving or have had no violations in the past year? HINT: Inclusion Exclusion Principle", variabilization: {}}, {id: "af23a60contingency4a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{710}{755}$$"], dependencies: ["af23a60contingency4a-h4"], title: "Answer", text: "Now that we have our proportions set up, we can divide the \"phone\" or \"safe\" drivers by the number of total drivers to get our final probability. What is our final answer?", variabilization: {}}, ]; export {hints};