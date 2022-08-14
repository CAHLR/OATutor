var hints = [{id: "af4e405log26a-h1", type: "hint", dependencies: [], title: "Convert to Exponential Form", text: "First, convert the expression to exponential form. To convert a logarithmic equation to exponential form, we need to identify the base of the exponential, a, and the exponent y since $$y=\\log_{a}\\left(x\\right)$$ is equivalent to $$x=a^y$$.", variabilization: {}}, {id: "af4e405log26a-h2", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$x^2=121$$"], dependencies: ["af4e405log26a-h1"], title: "Determining the Exponential Form", text: "What is the exponential form of the equation?", choices: ["$$x^2=121$$", "$${121}^2=x$$", "$$x^{121}=2$$", "$$2^x=121$$"], variabilization: {}}, {id: "af4e405log26a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["11"], dependencies: ["af4e405log26a-h2"], title: "Solve for x", text: "Knowing that the bases of a logarithmic function must be positive, what is the solution to the exponential equation you found above?", variabilization: {}}, ]; export {hints};