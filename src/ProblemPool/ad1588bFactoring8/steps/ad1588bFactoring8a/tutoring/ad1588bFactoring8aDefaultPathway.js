var hints = [{id: "ad1588bFactoring8a-h1", type: "hint", dependencies: [], title: "Find the common factor", text: "What is the greatest common factor of all terms in the expression $$12x^3 y^2+75x y^2$$?", variabilization: {}}, {id: "ad1588bFactoring8a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$3x y^2$$"], dependencies: ["ad1588bFactoring8a-h1"], title: "Find the common factor", text: "What is the greatest common factor of $$12x^3 y^2$$ and $$75x y^2$$?", variabilization: {}}, {id: "ad1588bFactoring8a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$4x^2+25$$"], dependencies: ["ad1588bFactoring8a-h2"], title: "Factor out the greatest common term", text: "(12*(x**3)*(y**2))+(75*x*y**2)=3*x*(y**2)*(?). What is ?", variabilization: {}}, {id: "ad1588bFactoring8a-h4", type: "hint", dependencies: ["ad1588bFactoring8a-h3"], title: "Factoring Completely", text: "There is no way to further factor $$3x y^2$$. Are there any ways to factor $$4x^2+25$$?", variabilization: {}}, {id: "ad1588bFactoring8a-h5", type: "hint", dependencies: ["ad1588bFactoring8a-h4"], title: "Finished Factoring", text: "We can rewrite $$4x^2+25$$ as $${\\left(2x\\right)}^2+5^2$$. Note that sum of squares is prime so it is not factorable. Therefore, we can not further than the factor $$4x^2+25$$.", variabilization: {}}, {id: "ad1588bFactoring8a-h6", type: "hint", dependencies: ["ad1588bFactoring8a-h5"], title: "Put together all factors", text: "Since we can not further factor $$3x y^2 \\left(4x^2+25\\right)$$, $$12x^3 y^2+75x y^2$$ can factor completely into $$3x y^2 \\left(4x^2+25\\right)$$", variabilization: {}}, ]; export {hints};