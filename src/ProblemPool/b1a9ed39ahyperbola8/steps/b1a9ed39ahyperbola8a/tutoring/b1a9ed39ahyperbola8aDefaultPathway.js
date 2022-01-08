var hints = [{id: "b1a9ed39ahyperbola8a-h1", type: "hint", dependencies: [], title: "Standard Form of Hyperbola with Center (0,0)", text: "The standard form of the equation of a hyperbola with center (0,0) and transverse axis on the x-axis is \\n $$\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1$$ \\n where \\n the length of the transverse axis is 2a \\n the coordinates of the vertices are (a,0),(-a,0) \\n the length of the conjugate axis is 2b \\n the coordinates of the co-vertices are (0,b),(0,b) \\n the distance between the foci is 2c, where $$c^2=a^2+b^2$$ \\n the coordinates of the foci are (c,0),(-c,0) \\n the equations of the asymptotes are y=(b/a)*x,y=-(b/a)*x \\n (See the left image) \\n \\n The standard form of the equation of a hyperbola with center (0,0) and transverse axis on the y-axis is \\n $$\\frac{y^2}{a^2}-\\frac{x^2}{b^2}=1$$ \\n where \\n the length of the transverse axis is 2a \\n the coordinates of the vertices are (0,a),(0,-a) \\n the length of the conjugate axis is 2b \\n the coordinates of the co-vertices are (b,0),(-b,0) \\n the distance between the foci is 2c, where $$c^2=a^2+b^2$$ \\n the coordinates of the foci are (0,c),(0,-c) \\n the equations of the asymptotes are y=(a/b)*x,y=-(a/b)*x \\n (See the right image)\n##figure2.gif##", variabilization: {}}, {id: "b1a9ed39ahyperbola8a-h2", type: "hint", dependencies: ["b1a9ed39ahyperbola8a-h1"], title: "Transverse Axis", text: "Which axis is transverse axis on? We can tell based on vertices.", variabilization: {}}, {id: "b1a9ed39ahyperbola8a-h3", type: "hint", dependencies: ["b1a9ed39ahyperbola8a-h2"], title: "Appropriate Standard Form", text: "Since the transverse axis is on the x-axis, which standard form for hyperbola should we use?", variabilization: {}}, {id: "b1a9ed39ahyperbola8a-h4", type: "hint", dependencies: ["b1a9ed39ahyperbola8a-h3"], title: "Vertices", text: "We observe that the distance between the vertices (the closest distance between the two sides) is 40m with the center at (0,0). The length of the transverse axis, 2a, is bounded by the vertices. We can thus find a by dividing the length between the two vertices by 2. What is a in the standard form of hyperbola?", variabilization: {}}, {id: "b1a9ed39ahyperbola8a-h5", type: "hint", dependencies: ["b1a9ed39ahyperbola8a-h4"], title: "Finding b", text: "Since there are no information about loci directly provided, we need to substitute for x and y in our equation using a known point.point. To do this, we can use the dimensions of the tower to find some point (x,y) that lies on the hyperbola. We will use the top right corner of the tower to represent that point. Since the y-axis bisects the tower, our x-value can be represented by the radius of the top, or 30 meters. The y-value is represented by the distance from the origin to the top, which is given as 67.082 meters. We can thus substitute (30,67.082) and $$a=20$$ into our equation to solve for b.", variabilization: {}}, {id: "b1a9ed39ahyperbola8a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\sqrt{\\frac{y^2}{\\frac{x^2}{a^2}-1}}$$"], dependencies: ["b1a9ed39ahyperbola8a-h5"], title: "Finding b", text: "We want to isolate b in the standard form $$\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1$$. Isolating b, what is the algebraic expression that b is equals to?", variabilization: {}}, {id: "b1a9ed39ahyperbola8a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["60"], dependencies: ["b1a9ed39ahyperbola8a-h6"], title: "Finding b", text: "Having found an expression for b, we now substitute in $$x=20$$, $$y=67.082$$ and $$a=20$$ as previously explained. What is b? Round to four decimal places.", variabilization: {}}, {id: "b1a9ed39ahyperbola8a-h8", type: "hint", dependencies: ["b1a9ed39ahyperbola8a-h7"], title: "Equation", text: "Having found a and b, we can now substitute them into the standard form equation $$\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1$$", variabilization: {}}, ]; export {hints};