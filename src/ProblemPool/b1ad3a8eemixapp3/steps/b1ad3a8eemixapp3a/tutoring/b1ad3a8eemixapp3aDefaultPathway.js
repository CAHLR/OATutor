var hints = [{id: "b1ad3a8eemixapp3a-h1", type: "hint", dependencies: [], title: "Writing mathematical expressions", text: "The first step is to express the value of the total number of each type of coin in a mathematical expression.", variabilization: {}}, {id: "b1ad3a8eemixapp3a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$3x-4$$"], dependencies: ["b1ad3a8eemixapp3a-h1"], title: "Assigning variables", text: "Let $$x=number$$ of 20-cent stamps. How can we write a mathematical expression for the number of 41-cent stamps in terms of x?", variabilization: {}}, {id: "b1ad3a8eemixapp3a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0.2"], dependencies: ["b1ad3a8eemixapp3a-h2"], title: "Finding the Value of each coin", text: "What is 20 cents in dollars?", variabilization: {}}, {id: "b1ad3a8eemixapp3a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0.41"], dependencies: ["b1ad3a8eemixapp3a-h3"], title: "Finding the Value of each coin", text: "What is 41 cents in dollars?", variabilization: {}}, {id: "b1ad3a8eemixapp3a-h5", type: "hint", dependencies: ["b1ad3a8eemixapp3a-h4"], title: "Writing the mathematical equation", text: "The next step is to write the mathematical equation to solve for x", variabilization: {}}, {id: "b1ad3a8eemixapp3a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$0.2x$$"], dependencies: ["b1ad3a8eemixapp3a-h5"], title: "Expressing the total value of 20-cent coins", text: "What is the total value of x number of 21-cent coins? Express as a mathematical expression", variabilization: {}}, {id: "b1ad3a8eemixapp3a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$0.41\\left(3x-4\\right)$$"], dependencies: ["b1ad3a8eemixapp3a-h6"], title: "Expressing the total value of 41-cent coins", text: "What is the total value of all the 41-cent coins? Express as a mathematical expression", variabilization: {}}, {id: "b1ad3a8eemixapp3a-h8", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["12.66"], dependencies: ["b1ad3a8eemixapp3a-h7"], title: "Total value", text: "What should the numbers in the previous two clues add up to?", variabilization: {}}, ]; export {hints};