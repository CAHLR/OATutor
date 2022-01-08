var hints = [{id: "b1a7dc5fftransformation4a-h1", type: "hint", dependencies: [], title: "Definition of an Even Function", text: "A function is called an even function if for every input x, $$g(x)=g(-x)$$.", variabilization: {}}, {id: "b1a7dc5fftransformation4a-h2", type: "hint", dependencies: ["b1a7dc5fftransformation4a-h1"], title: "Definition of an Odd Function", text: "A function is called an odd function if for every input x, $$g(x)=-g(-x)$$.", variabilization: {}}, {id: "b1a7dc5fftransformation4a-h3", type: "hint", dependencies: ["b1a7dc5fftransformation4a-h2"], title: "How to Find g(-x)", text: "Find g(-x) by subsituting -x in wherever x appears in the original equation.", variabilization: {}}, {id: "b1a7dc5fftransformation4a-h4", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$\\sqrt{-x}$$"], dependencies: ["b1a7dc5fftransformation4a-h3"], title: "Determining g(-x)", text: "What is g(-x) equal to?", choices: ["$$\\sqrt{-x}$$", "$$-\\sqrt{-x}$$"], variabilization: {}}, {id: "b1a7dc5fftransformation4a-h5", type: "hint", dependencies: ["b1a7dc5fftransformation4a-h4"], title: "How to Find -g(-x)", text: "Find -g(-x) by multiplying each term of g(-x) by -1.", variabilization: {}}, {id: "b1a7dc5fftransformation4a-h6", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$-\\sqrt{-x}$$"], dependencies: ["b1a7dc5fftransformation4a-h5"], title: "Determining -g(-x)", text: "What is -g(-x) equal to?", choices: ["$$\\sqrt{-x}$$", "$$-\\sqrt{-x}$$"], variabilization: {}}, {id: "b1a7dc5fftransformation4a-h7", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["No"], dependencies: ["b1a7dc5fftransformation4a-h6"], title: "Checking if g(x) is Even", text: "Does $$g(x)=g(-x)$$?", choices: ["Yes", "No"], variabilization: {}}, {id: "b1a7dc5fftransformation4a-h8", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["No"], dependencies: ["b1a7dc5fftransformation4a-h7"], title: "Checking if g(x) is Odd", text: "Does $$g(x)=-g(-x)$$?", choices: ["Yes", "No"], variabilization: {}}, ]; export {hints};