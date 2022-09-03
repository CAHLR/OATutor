var hints = [{id: "a8741a7log1b-h1", type: "hint", dependencies: [], title: "Identify the base and exponent", text: "To convert an exponential equation to logarithmic form, we need to identify the base of the exponential, a, and the exponent y since $$y=\\log_{a}\\left(x\\right)$$ is equivalent to $$x=a^y$$.", variabilization: {}}, {id: "a8741a7log1b-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["5"], dependencies: ["a8741a7log1b-h1"], title: "Identify the base", text: "What is the base of the exponent?", variabilization: {}}, {id: "a8741a7log1b-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{2}$$"], dependencies: ["a8741a7log1b-h2"], title: "Identify the exponent", text: "What is the exponent?", variabilization: {}}, {id: "a8741a7log1b-h4", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$\\frac{1}{2}=\\log_{5}\\left(\\sqrt{5}\\right)$$"], dependencies: ["a8741a7log1b-h3"], title: "Determining Logarithmic Form", text: "Knowing the base and the exponent, what is the logarithmic form?", choices: ["$$\\frac{1}{2}=\\log_{5}\\left(\\sqrt{5}\\right)$$", "$$\\sqrt{5}=\\log_{5}\\left(\\frac{1}{2}\\right)$$", "$$5=\\log_{sqrt(5)}\\left(\\frac{1}{2}\\right)$$", "$$\\frac{1}{2}=\\log_{sqrt(5)}\\left(5\\right)$$"], variabilization: {}}, ]; export {hints};