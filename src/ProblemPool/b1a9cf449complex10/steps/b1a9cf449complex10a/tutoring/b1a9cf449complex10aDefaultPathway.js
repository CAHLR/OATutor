var hints = [{id: "b1a9cf449complex10a-h1", type: "hint", dependencies: [], title: "Distributing the Negative Sign", text: "Because the second part of the expression is being subtracted, we can distribute the negative sign into that part. $$-(6-i)=-6+i$$. The expression is now $$\\left(-5+3i\\right)+\\left(-6+i\\right)$$.", variabilization: {}}, {id: "b1a9cf449complex10a-h2", type: "hint", dependencies: ["b1a9cf449complex10a-h1"], title: "Associative Property", text: "The next step is to group the like terms. We can use the Associative Property to rewrite this expression as $$\\left(-5+\\left(-6\\right)\\right)+3i+i$$.", variabilization: {}}, {id: "b1a9cf449complex10a-h3", type: "hint", dependencies: ["b1a9cf449complex10a-h2"], title: "Combining Like Terms", text: "Now, we can add numbers in the parentheses to combine like terms.", variabilization: {}}, {id: "b1a9cf449complex10a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-11"], dependencies: ["b1a9cf449complex10a-h3"], title: "Combining Like Terms", text: "What is $$-5+\\left(-6\\right)$$?", variabilization: {}}, {id: "b1a9cf449complex10a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["4i"], dependencies: ["b1a9cf449complex10a-h3"], title: "Combining Like Terms", text: "What is $$3i+i$$?", variabilization: {}}, {id: "b1a9cf449complex10a-h6", type: "hint", dependencies: ["b1a9cf449complex10a-h4", "b1a9cf449complex10a-h5"], title: "Standard Form", text: "Finally, we can write the expression in $$a+bi$$ form: $$-11+4i$$.", variabilization: {}}, ]; export {hints};