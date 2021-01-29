var hints = [{id: "rational19a-h1", type: "hint", dependencies: [], title: "Common Denominator", text: "The first step is to find the least common denominator of two rational expressions."}, {id: "rational19a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["(y-2)(y+1)"], dependencies: ["rational19a-h1"], title: "Common Denominator", text: "What is the least common denominator?"}, {id: "rational19a-h3", type: "hint", dependencies: ["rational19a-h2"], title: "Common Denominator", text: "Since we do not know the value of y, the least common multiple of the denominators is their product. So, the LCD is (y-2)(y+1)."}, {id: "rational19a-h4", type: "hint", dependencies: ["rational19a-h3"], title: "Multiplying the First Expression", text: "Now we need to multiply both expressions by a factor equal to 1 that makes the denominators equal to the LCD. Starting with the first expression, we can multiply $$\\frac{y+\\left(3\\right)}{y+\\left(1\\right)}$$ by a factor to make the denominator (y-2)(y+1)."}, {id: "rational19a-h5", type: "hint", dependencies: ["rational19a-h4"], title: "Multiplying the First Expression", text: "The denominator of $$\\frac{y+\\left(3\\right)}{y-\\left(2\\right)}$$ multiplied by $$y+\\left(1\\right)$$ equals (y-2)(y+1). So, we need to multiply $$\\frac{y+\\left(3\\right)}{y+\\left(1\\right)}$$ by (y+1)(y+1)."}, {id: "rational19a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["(y^2+4y+3/((y-2)(y+1))"], dependencies: ["rational19a-h5"], title: "Multiplying the First Expression", text: "What is ((y+3)/(y-2))*((y+1)(y+1))?"}, {id: "rational19a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["y^2+4y+3"], dependencies: ["rational19a-h6"], title: "Multiplying the First Expression", text: "$$\\left(y+\\left(3\\right)\\right) \\left(y+\\left(1\\right)\\right)$$"}, {id: "rational19a-h8", type: "hint", dependencies: ["rational19a-h7"], title: "Multiplying the First Expression", text: "When multiplying polynomials, we need to use FOIL."}, {id: "rational19a-h9", type: "hint", dependencies: ["rational19a-h8"], title: "Multiplying the First Expression", text: "First, multiply the first value in each polynomial: $$y y=y^2$$ Next, multiply the outside values: y*1=y. Then, multiply the inside values: 3*y=3y. Lastly, multiply the last values: $$\\left(3\\right) \\left(1\\right)=3$$ Finally, combine like terms: y+3y=4y. So, the expression reads $$y^2+\\left(4\\right) y+\\left(3\\right)$$"}, {id: "rational19a-h10", type: "hint", dependencies: ["rational19a-h9"], title: "Multiplying the Second Expression", text: "Next, we need to multiply the second expression by a fraction to make the denominator equal to the LCD. Because the denominator of $$\\frac{y-\\left(3\\right)}{y+\\left(1\\right)}$$ needs to by multiplied by y-2 to become $$\\left(y-\\left(2\\right)\\right) \\left(y+\\left(1\\right)\\right)$$ we need to $$\\frac{y-\\left(3\\right)}{y+\\left(1\\right)}$$ by (y-2)(y-2)."}, {id: "rational19a-h11", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["y^2-5y+6/((y-2)(y+1)"], dependencies: ["rational19a-h10"], title: "Multiplying the Second Expression", text: "What is ((y+3)/(y-2))*((y+1)/(y+1))?"}, {id: "rational19a-h12", type: "hint", dependencies: ["rational19a-h11"], title: "Multiplying the Second Expression", text: "When multiplying polynomials, we need to use FOIL."}, {id: "rational19a-h13", type: "hint", dependencies: ["rational19a-h12"], title: "Multiplying the Second Expression", text: "First, multiply the first value in each polynomial: $$y y=y^2$$ Next, multiply the outside values: y*1=y. Then, multiply the inside values: 3*y=3y. Lastly, multiply the last values: $$\\left(3\\right) \\left(1\\right)=3$$ Finally, combine like terms: y+3y=4y. So, the expression reads $$y^2+\\left(4\\right) y+\\left(3\\right)$$"}, {id: "rational19a-h14", type: "hint", dependencies: ["rational19a-h13"], title: "Adding the Expressions", text: "Because the expressions now have the same denominator, we can add the numerators to get the sum of the two expressions. We'll leave the denominator as it is, but combine the numerator's like terms."}, {id: "rational19a-h15", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["9a"], dependencies: ["rational19a-h14"], title: "Adding the Expressions", text: "What is (y**2+4y+3)-(y**2-5y+6)?"}, {id: "rational19a-h16", type: "hint", dependencies: ["rational19a-h15"], title: "Adding the Expressions", text: "Combine the like terms: $$y^2-y^2=0$$ $$\\left(4\\right) y+\\left(5\\right) y=\\left(9\\right) y$$ $$\\left(3\\right)-\\left(6\\right)=-\\left(3\\right)$$"}, {id: "rational19a-h17", type: "hint", dependencies: ["rational19a-h16"], title: "Final Expression", text: "Now we have our final expression: (2y**2-y+9)/((y-2)(y+1))."}, ]; export {hints};