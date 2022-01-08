var hints = [{id: "b1a0f69c4conic1a-h1", type: "hint", dependencies: [], title: "Polar Equation of Conic", text: "For a conic with a focus at the origin, if the directrix is $$x=p$$ or $$x=-p$$, where p is a positive real number, and the eccentricity is a positive real number e, the conic has a polar equation \\n r=(e*p)/(1+e*cos(\theta)) or r=(e*p)/(1-e*cos(\theta)) \\n For a conic with a focus at the origin, if the directrix is $$y=p$$ or $$y=-p$$, where p is a positive real number, and the eccentricity is a positive real number e, the conic has a polar equation \\n r=(e*p)/(1+e*sin(\theta)) or r=(e*p)/(1-e*sin(\theta))", variabilization: {}}, {id: "b1a0f69c4conic1a-h2", type: "hint", dependencies: ["b1a0f69c4conic1a-h1"], title: "Standard Form", text: "We want to multiply the numerator and denominator by the reciprocal of the constant of the original equation, $$\\frac{1}{c}$$, where c is the constant so that we can change the equation to the standard polar form. What is the reciprocal that we want to multiply?", variabilization: {}}, {id: "b1a0f69c4conic1a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["2/(1+(2/3)*sin(\theta))"], dependencies: ["b1a0f69c4conic1a-h2"], title: "Standard Form", text: "After multiplying by the reciprocal of the constant, what is the polar equation now?", variabilization: {}}, {id: "b1a0f69c4conic1a-h4", type: "hint", dependencies: ["b1a0f69c4conic1a-h3"], title: "Eccentricity", text: "In the standard polar form, the coefficient in front of sin(\theta) or cos(\theta) is the eccentricity. What is the eccentricity?", variabilization: {}}, {id: "b1a0f69c4conic1a-h5", type: "hint", dependencies: ["b1a0f69c4conic1a-h4"], title: "Directrix", text: "Since sin(\theta) is in the denominator, is the directrix along the y or x axis?", variabilization: {}}, {id: "b1a0f69c4conic1a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3"], dependencies: ["b1a0f69c4conic1a-h5"], title: "Directrix", text: "The numerator is the product of the eccentricity and the directrix. Now that we know the eccentricity and numerator, what is the directrix?", variabilization: {}}, {id: "b1a0f69c4conic1a-h7", type: "hint", dependencies: ["b1a0f69c4conic1a-h6"], title: "Type of Conic", text: "For a conic with eccentricity e, \\n - if $$0 \\leq e<1$$, the conic is ellipse \\n - if $$e=1$$. the conic is a parabola \\n - if $$e>1$$, the conic is a hyperbola", variabilization: {}}, {id: "b1a0f69c4conic1a-h8", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Ellipse"], dependencies: ["b1a0f69c4conic1a-h7"], title: "Type of Conic", text: "Given that we have found the eccentricity $$e=\\frac{2}{3}$$, what type of conic is this?", choices: ["Ellipse", "Parabola", "Hyperbola"], variabilization: {}}, ]; export {hints};