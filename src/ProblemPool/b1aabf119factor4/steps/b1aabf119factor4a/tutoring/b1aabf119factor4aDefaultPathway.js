var hints = [{id: "b1aabf119factor4a-h1", type: "hint", dependencies: [], title: "Factor the expression", text: "A trinomial of the form $$x^2+bx+c$$ can be written in factored form as(x+p)(x+q)(x+p)(x+q) where $$pq=c$$ and $$p+q=b$$.", variabilization: {}}, {id: "b1aabf119factor4a-h2", type: "hint", dependencies: ["b1aabf119factor4a-h1"], title: "Factor the expression", text: "To factor a polynomial $$x^2+bx+c$$, the first step is to find two numbers with a product of c and a sum of b.", variabilization: {}}, {id: "b1aabf119factor4a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["6"], dependencies: ["b1aabf119factor4a-h2"], title: "Product of Numbers", text: "What is $$\\left(-1\\right) \\left(-6\\right)$$?", variabilization: {}}, {id: "b1aabf119factor4a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-7"], dependencies: ["b1aabf119factor4a-h3"], title: "Sum of Numbers", text: "What is $$\\left(-1\\right)+\\left(-6\\right)$$?", variabilization: {}}, {id: "b1aabf119factor4a-h5", type: "hint", dependencies: ["b1aabf119factor4a-h4"], title: "In a polynomial $$x^2+bx+c$$, if $$f g=c$$ and $$f+g=b$$, then the polynomial can be factored as $$\\left(x+f\\right) \\left(x+g\\right)$$.", text: "", variabilization: {}}, ]; export {hints};