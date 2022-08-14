var hints = [{id: "aadff92AppQuad7a-h1", type: "hint", dependencies: [], title: "Set Up Equation For Problem", text: "Let the bases of the triangle be b, we can write the height of the triangle in terms of b as 4b-2.", variabilization: {}}, {id: "aadff92AppQuad7a-h2", type: "hint", dependencies: ["aadff92AppQuad7a-h1"], title: "Equation For Triangle Area", text: "Area of $$triangle=\\frac{1}{2} base height$$. We can set up the equation using given condition as $$45=\\frac{1}{2} b \\left(4b-2\\right)$$.", variabilization: {}}, {id: "aadff92AppQuad7a-h3", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["(-4.5,5)"], dependencies: ["aadff92AppQuad7a-h2"], title: "Solve For Unknown Using Quadratic Formula", text: "The quadratic formula states $${ax}^2+bx+c=0$$, then $$x=\\frac{\\left(-b\\pm \\sqrt{b^2-4ac}\\right)}{2a}$$. Given $$45=\\frac{1}{2} b \\left(4b-2\\right)$$, solve for b. Please enter your answer as (c,d) where $$c<d$$.", variabilization: {}}, {id: "aadff92AppQuad7a-h4", type: "hint", dependencies: ["aadff92AppQuad7a-h3"], title: "Solve For Unknown Using Quadratic Formula", text: "Given that base of a triangle has to be positive, we can omit the negative answer. Therefore, the base of given triangle is 5.", variabilization: {}}, {id: "aadff92AppQuad7a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["18"], dependencies: ["aadff92AppQuad7a-h4"], title: "Find the Height of Triangle", text: "Given that the base is 5 and the height is 2 less than 4 times the base, what is the height?", variabilization: {}}, ]; export {hints};