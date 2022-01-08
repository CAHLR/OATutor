var hints = [{id: "b1a9cf449complex12a-h1", type: "hint", dependencies: [], title: "Distributive Property", text: "The first step is to apply the Distributive Property, which turns our expression into $$3i\\times5+3i \\left(-2i\\right)$$.", variabilization: {}}, {id: "b1a9cf449complex12a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["15i"], dependencies: ["b1a9cf449complex12a-h1"], title: "Simple Multiplication", text: "What is $$3i\\times5$$?", variabilization: {}}, {id: "b1a9cf449complex12a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["6"], dependencies: ["b1a9cf449complex12a-h1"], title: "Simple Multiplication", text: "What is $$3i \\left(-2i\\right)$$?", subHints: [{id: "b1a9cf449complex12a-h3-s1", type: "hint", dependencies: [], title: "Distributive Property", text: "Because i is the square root of -1, when we multiply (3i)(-2i), the i is squared and becomes -1. So, (3i)(-2i) becomes (-6)(-1), or 6.", variabilization: {}}], variabilization: {}}, {id: "b1a9cf449complex12a-h4", type: "hint", dependencies: ["b1a9cf449complex12a-h2", "b1a9cf449complex12a-h3"], title: "Standard Form", text: "Finally, we can write the expression in $$a+bi$$ form: $$6+15i$$.", variabilization: {}}, ]; export {hints};