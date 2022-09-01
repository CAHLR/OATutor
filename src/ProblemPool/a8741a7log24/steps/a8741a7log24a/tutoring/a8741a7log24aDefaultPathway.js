var hints = [{id: "a8741a7log24a-h1", type: "hint", dependencies: [], title: "Identify the base and exponent", text: "To convert an exponential equation to logarithmic form, we need to identify the base of the exponential, a, and the exponent y since $$y=\\log_{a}\\left(x\\right)$$ is equivalent to $$x=a^y$$.", variabilization: {}}, {id: "a8741a7log24a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["x"], dependencies: ["a8741a7log24a-h1"], title: "Identify the base", text: "What is the base of the exponent?", variabilization: {}}, {id: "a8741a7log24a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{3}$$"], dependencies: ["a8741a7log24a-h2"], title: "Identify the exponent", text: "What is the exponent?", variabilization: {}}, {id: "a8741a7log24a-h4", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$\\frac{1}{3}=\\log_{x}\\left(\\sqrt[3]{6}\\right)$$"], dependencies: ["a8741a7log24a-h3"], title: "Determining Logarithmic Form", text: "Knowing the base and the exponent, what is the logarithmic form?", choices: ["$$\\frac{1}{3}=\\log_{x}\\left(\\sqrt[3]{6}\\right)$$", "$$\\sqrt[3]{6}=\\log_{1/3}\\left(x\\right)$$", "$$\\sqrt[3]{6}=\\log_{x}\\left(\\frac{1}{3}\\right)$$", "$$x=\\log_{1/3}\\left(\\sqrt[3]{6}\\right)$$"], variabilization: {}}, ]; export {hints};