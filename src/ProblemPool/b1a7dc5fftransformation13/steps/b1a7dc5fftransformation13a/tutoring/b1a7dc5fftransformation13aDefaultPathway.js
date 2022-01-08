var hints = [{id: "b1a7dc5fftransformation13a-h1", type: "hint", dependencies: [], title: "Order of Transformations", text: "The first step is to recognize the order of transformations. First, $$x^2$$ is vertically compressed by a factor of $$\\frac{1}{2}$$, then, shifted to the right 5 units, and lastly, shifted up 1 unit.", variabilization: {}}, {id: "b1a7dc5fftransformation13a-h2", type: "hint", dependencies: ["b1a7dc5fftransformation13a-h1"], title: "Vertically Compressing by a Factor of 3", text: "To vertically compress the function by a factor of $$\\frac{1}{2}$$, multiply the entire function by $$\\frac{1}{2}$$ to get $$\\frac{1}{2} f{\\left(x\\right)}$$.", variabilization: {}}, {id: "b1a7dc5fftransformation13a-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$\\frac{1}{2} x^2$$"], dependencies: ["b1a7dc5fftransformation13a-h2"], title: "Vertically Compressing by a Factor of 3", text: "What is $$\\frac{1}{2} f{\\left(x\\right)}$$?", choices: ["$$2x^2$$", "$$\\frac{1}{2} x^2$$"], variabilization: {}}, {id: "b1a7dc5fftransformation13a-h4", type: "hint", dependencies: ["b1a7dc5fftransformation13a-h3"], title: "Shifting Right Five Units", text: "To shift the function right five units, replace x with x-5 in the function.", variabilization: {}}, {id: "b1a7dc5fftransformation13a-h5", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$\\frac{1}{2} {\\left(x-5\\right)}^2$$"], dependencies: ["b1a7dc5fftransformation13a-h4"], title: "Shifting Right Five Units", text: "What is the function after it has been shifted right 5 units?", choices: ["$$\\frac{1}{2} {\\left(x-5\\right)}^2$$", "$$\\frac{1}{2} {\\left(x+5\\right)}^2$$"], variabilization: {}}, {id: "b1a7dc5fftransformation13a-h6", type: "hint", dependencies: ["b1a7dc5fftransformation13a-h5"], title: "Shifting Up One Unit", text: "To shift the function up one unit, add 1 to the function.", variabilization: {}}, {id: "b1a7dc5fftransformation13a-h7", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$\\frac{1}{2} {\\left(x-5\\right)}^2+1$$"], dependencies: ["b1a7dc5fftransformation13a-h6"], title: "Shifting Up One Unit", text: "What is the function after it has been shifted up 1 unit?", choices: ["$$\\frac{1}{2} {\\left(x+5\\right)}^2+1$$", "$$\\frac{1}{2} {\\left(x-5\\right)}^2+1$$", "$$\\frac{1}{2} {\\left(x-5\\right)}^2-1$$", "$$2{\\left(x+5\\right)}^2-1$$"], variabilization: {}}, ]; export {hints};