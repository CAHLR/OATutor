var hints = [{id: "a8741a7log4a-h1", type: "hint", dependencies: [], title: "Identify the base and exponent", text: "To convert a logarithmic equation to exponential form, we need to identify the base of the exponential, a, and the exponent y since $$y=\\log_{a}\\left(x\\right)$$ is equivalent to $$x=a^y$$.", variabilization: {}}, {id: "a8741a7log4a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["8"], dependencies: ["a8741a7log4a-h1"], title: "Identify the base", text: "What is the base of the exponent?", variabilization: {}}, {id: "a8741a7log4a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["2"], dependencies: ["a8741a7log4a-h2"], title: "Identify the exponent", text: "What is the exponent?", variabilization: {}}, {id: "a8741a7log4a-h4", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$64=8^2$$"], dependencies: ["a8741a7log4a-h3"], title: "Determining Exponential Form", text: "Knowing the base and the exponent, what is the exponential form?", choices: ["$$64=8^2$$", "$$8=2^{64}$$", "$$8={64}^2$$", "$$64=2^3$$"], variabilization: {}}, ]; export {hints};