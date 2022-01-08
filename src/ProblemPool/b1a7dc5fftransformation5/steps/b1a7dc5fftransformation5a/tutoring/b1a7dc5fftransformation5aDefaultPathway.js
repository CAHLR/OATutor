var hints = [{id: "b1a7dc5fftransformation5a-h1", type: "hint", dependencies: [], title: "Definition of an Even Function", text: "A function is called an even function if for every input x, $$h(x)=h(-x)$$.", variabilization: {}}, {id: "b1a7dc5fftransformation5a-h2", type: "hint", dependencies: ["b1a7dc5fftransformation5a-h1"], title: "Definition of an Odd Function", text: "A function is called an odd function if for every input x, $$h(x)=-h(-x)$$.", variabilization: {}}, {id: "b1a7dc5fftransformation5a-h3", type: "hint", dependencies: ["b1a7dc5fftransformation5a-h2"], title: "How to Find h(-x)", text: "Find h(-x) by subsituting -x in wherever x appears in the original equation.", variabilization: {}}, {id: "b1a7dc5fftransformation5a-h4", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$\\frac{-1}{x}-3x$$"], dependencies: ["b1a7dc5fftransformation5a-h3"], title: "Determining h(-x)", text: "What is h(-x) equal to?", choices: ["$$\\frac{-1}{x}-3x$$", "$$\\frac{1}{x}+3x$$", "$$\\frac{1}{x}-3x$$", "$$\\frac{-1}{x}+3x$$"], variabilization: {}}, {id: "b1a7dc5fftransformation5a-h5", type: "hint", dependencies: ["b1a7dc5fftransformation5a-h4"], title: "How to Find -h(-x)", text: "Find -h(-x) by multiplying each term of g(-x) by -1.", variabilization: {}}, {id: "b1a7dc5fftransformation5a-h6", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$\\frac{1}{x}+3x$$"], dependencies: ["b1a7dc5fftransformation5a-h5"], title: "Determining -h(-x)", text: "What is -h(-x) equal to?", choices: ["$$\\frac{-1}{x}-3x$$", "$$\\frac{1}{x}+3x$$", "$$\\frac{1}{x}-3x$$", "$$\\frac{-1}{x}+3x$$"], variabilization: {}}, {id: "b1a7dc5fftransformation5a-h7", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["No"], dependencies: ["b1a7dc5fftransformation5a-h6"], title: "Checking if h(x) is Even", text: "Does $$h(x)=h(-x)$$?", choices: ["Yes", "No"], variabilization: {}}, {id: "b1a7dc5fftransformation5a-h8", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: ["b1a7dc5fftransformation5a-h7"], title: "Checking if h(x) is Odd", text: "Does $$h(x)=-h(-x)$$?", choices: ["Yes", "No"], variabilization: {}}, ]; export {hints};