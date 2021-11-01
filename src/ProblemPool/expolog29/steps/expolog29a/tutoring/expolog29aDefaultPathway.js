var hints = [{id: "expolog29a-h1", type: "hint", dependencies: [], title: "Understanding the Model", text: "We were given that the model is for measuring magnitude of earthquake is $$M=\\frac{2}{3} \\log(\\frac{S}{S_0})$$. In the model, M is the magnitude of the earthquake, $$S_0$$ is the initial seismic moment that led to the occurence of earthquake. S is the seismic moment associated with an earthquake. If we denote the seismic moment of the first earthquake as $$S_1$$. In the context of the question, since the second earthquake has 750 times as much energy as the first, we can interpret its seismic moment as $$\\left(750\\right) S_1$$.", variabilization: {}}, {id: "expolog29a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{2}{3} \\log(\\frac{\\left(750\\right) S_1}{S_0})$$"], dependencies: ["expolog29a-h1"], title: "Logarithmic Model", text: "Given that the equation for the first earthquake is $$M=\\frac{2}{3} \\log(\\frac{S_1}{S_0})=3.9$$. What is M equals to for the second earthquake? Express in terms of $$S_1$$ and $$S_0$$.", variabilization: {}}, {id: "expolog29a-h3", type: "hint", dependencies: ["expolog29a-h2"], title: "Product Rule for Logarithms", text: "The product rule for logarithms can be used to simplify a logarithm of a product by rewriting it as a sum of individual logarithms. \\n $$\\log_{b}\\left(M N\\right)=\\log_{b}\\left(M\\right)+\\log_{b}\\left(N\\right)for$$ $$b>0$$ \\n \\n Given the logarithm of a product, use the product rule of logarithms to write an equivalent sum of logarithms. \\n \\n 1) Factor the argument completely, expressing each whole number factor as a product of primes. \\n 2) Write the equivalent expression by summing the logarithms of each factor.", variabilization: {}}, {id: "expolog29a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{2}{3} \\log(\\frac{S_1}{S_0})+\\frac{2}{3} \\log(750)$$"], dependencies: ["expolog29a-h3"], title: "Apply the Product Rule for Logarithms", text: "We can use the product rule to separate the factors, 750 and $$\\frac{S_1}{S_0}$$, from within the logarithmic expression of the equation of second earthquake. Write the equivalent expression by summing the logarithms of each factor. What is the new expression?", subHints: [{id: "expolog29a-h4-s1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\log(M)+\\log(N)$$"], dependencies: ["expolog29a-h4"], title: "Apply the Product Rule for Logarithms", text: "What is the expression after applying product rule to $$\\log(M N)$$? Express in terms of M and N.", variabilization: {}}, {id: "expolog29a-h4-s2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$a \\log(M)+a \\log(N)$$"], dependencies: ["expolog29a-h4-s1"], title: "Apply the Product Rule for Logarithms", text: "What is the expression after applying product rule to $$a \\log(M N)$$? Express in terms of a, M and N. (In our question, what values / variables does a, M and N refer to?)", variabilization: {}}], variabilization: {}}, {id: "expolog29a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["1.92"], dependencies: ["expolog29a-h4"], title: "Simplification", text: "What is $$\\frac{2}{3} \\log(750)$$? Round to the nearest hundredth.", variabilization: {}}, {id: "expolog29a-h6", type: "hint", dependencies: ["expolog29a-h5"], title: "Substitution", text: "We were previously given in the question that $$M=\\frac{2}{3} \\log(\\frac{S_1}{S_0})=3.9$$. We can substitute this as well as the simplification that was previously done into $$M=\\frac{2}{3} \\log(\\frac{S_1}{S_0})+\\frac{2}{3} \\log(750)$$ to find the magnitude of the second earthquake.", variabilization: {}}, ]; export {hints};