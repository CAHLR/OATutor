var hints = [{id: "b1a9cf449complex9a-h1", type: "hint", dependencies: [], title: "Associative Property", text: "The first step is to group the like terms. We can use the Associative Property to rewrite this expression as $$3+5+2i-3i$$.", variabilization: {}}, {id: "b1a9cf449complex9a-h2", type: "hint", dependencies: ["b1a9cf449complex9a-h1"], title: "Combining Like Terms", text: "Now, we can add numbers in the parentheses to combine like terms.", variabilization: {}}, {id: "b1a9cf449complex9a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["8"], dependencies: ["b1a9cf449complex9a-h2"], title: "Combining Like Terms", text: "What is $$3+5$$?", variabilization: {}}, {id: "b1a9cf449complex9a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-i"], dependencies: ["b1a9cf449complex9a-h2"], title: "Combining Like Terms", text: "What is 2i-3i?", variabilization: {}}, {id: "b1a9cf449complex9a-h5", type: "hint", dependencies: ["b1a9cf449complex9a-h3", "b1a9cf449complex9a-h4"], title: "Rewrite Answer", text: "Finally, we can write the expression in $$a+bi$$ form: 8-i.", variabilization: {}}, ]; export {hints};