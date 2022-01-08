var hints = [{id: "b1ae05e04inverse16a-h1", type: "hint", dependencies: [], title: "Finding g(f(x))", text: "The first step is to find g(f(x)).", variabilization: {}}, {id: "b1ae05e04inverse16a-h2", type: "hint", dependencies: ["b1ae05e04inverse16a-h1"], title: "Calculating g(f(x))", text: "$$g(f(x))=\\frac{1}{\\frac{1}{x+2}}-2$$", variabilization: {}}, {id: "b1ae05e04inverse16a-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: ["b1ae05e04inverse16a-h2"], title: "Verifying the Value of g(f(x))", text: "Does $$g(f(x))=x$$?", choices: ["Yes", "No"], variabilization: {}}, {id: "b1ae05e04inverse16a-h4", type: "hint", dependencies: ["b1ae05e04inverse16a-h3"], title: "Interpreting the Meaning of g(f(x))", text: "If $$g(f(x))=x$$, then $$g(x)=f^{\\left(-1\\right)} x$$ and $$f(x)=g^{\\left(-1\\right)} x$$. If g(f(x)) is not equal to x, then these statements are false.", variabilization: {}}, ]; export {hints};