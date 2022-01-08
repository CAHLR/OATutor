var hints = [{id: "b1ae05e04inverse17a-h1", type: "hint", dependencies: [], title: "Finding f(g(x))", text: "The first step is to find f(g(x)).", variabilization: {}}, {id: "b1ae05e04inverse17a-h2", type: "hint", dependencies: ["b1ae05e04inverse17a-h1"], title: "Calculating f(g(x))", text: "$$f(g(x))=\\frac{x^3}{27}$$", variabilization: {}}, {id: "b1ae05e04inverse17a-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["No"], dependencies: ["b1ae05e04inverse17a-h2"], title: "Verifying the Value of g(f(x))", text: "Does $$f(g(x))=x$$?", choices: ["Yes", "No"], variabilization: {}}, {id: "b1ae05e04inverse17a-h4", type: "hint", dependencies: ["b1ae05e04inverse17a-h3"], title: "Interpreting the Meaning of g(f(x))", text: "If $$f(g(x))=x$$, then $$g(x)=f^{\\left(-1\\right)} x$$ and $$f(x)=g^{\\left(-1\\right)} x$$. If f(g(x)) is not equal to x, then these statements are false.", variabilization: {}}, ]; export {hints};