var hints = [{id: "Visualize9a-h1", type: "hint", dependencies: [], title: "Fraction Division", text: "To divide fractions, we multiply the first fraction by the reciprocal of the second."}, {id: "Visualize9a-h2", type: "hint", dependencies: ["Visualize9a-h1"], title: "Reciprocal", text: "The reciprocal of $$\\frac{a}{b}$$ is b/a."}, {id: "Visualize9a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["5/n"], dependencies: ["Visualize9a-h2"], title: "Reciprocal of the Second Fraction", text: "What is the reciprocal of n/5?"}, {id: "Visualize9a-h4", type: "hint", dependencies: ["Visualize9a-h3"], title: "Multiplying Fractions", text: "The next step is to multiply the first fraction by the reciprocal of the second."}, {id: "Visualize9a-h5", type: "hint", dependencies: ["Visualize9a-h4"], title: "Determining the Sign", text: "Since the signs are different, the product is negative."}, {id: "Visualize9a-h6", type: "hint", dependencies: ["Visualize9a-h5"], title: "Multiplying Fractions", text: "To multiply fractions, we multiply the numerators and the denominators."}, {id: "Visualize9a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["10"], dependencies: ["Visualize9a-h6"], title: "Multiplying the Numerators", text: "What is 2*5?"}, {id: "Visualize9a-h8", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3n"], dependencies: ["Visualize9a-h7"], title: "Multiplying the Denominators", text: "What is 3*n?"}, {id: "Visualize9a-h9", type: "hint", dependencies: ["Visualize9a-h8"], title: "Putting Top and Bottom Together", text: "Putting our answers to the last two steps together, we get the fraction -10/(3n). The next step is to simplify our answer if possible."}, {id: "Visualize9a-h10", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: ["Visualize9a-h9"], title: "Checking for Common Factors", text: "Is $$\\frac{-\\left(10\\right)}{\\left(3\\right) n}$$ already in its simplest form?", choices: ["Yes", "No"]}, ]; export {hints};