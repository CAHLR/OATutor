var hints = [{id: "ad220b3GraphQuadratic24a-h1", type: "hint", dependencies: [], title: "Decide the Shape of Parabola", text: "Given any parabola in the form $${ax}^2+bx+c$$, a is called the leading coefficient of the parabola. If a is negative, the parabola opens downward. If a is positive, the parabola opens upward.", variabilization: {}}, {id: "ad220b3GraphQuadratic24a-h2", type: "hint", dependencies: ["ad220b3GraphQuadratic24a-h1"], title: "Decide the Shape of Parabola", text: "Since a is negative, the parabola opens downward. So the quadratic equation has a maximum.", variabilization: {}}, {id: "ad220b3GraphQuadratic24a-h3", type: "hint", dependencies: ["ad220b3GraphQuadratic24a-h2"], title: "Find the Equation For Axis of Symmetry", text: "Given $${ax}^2+bx+c$$, the axis of symmetry for the parabola is $$x=\\frac{-b}{2a}$$.", variabilization: {}}, {id: "ad220b3GraphQuadratic24a-h4", type: "hint", dependencies: ["ad220b3GraphQuadratic24a-h3"], title: "Find the Equation For Axis of Symmetry", text: "In the given parabola, $$a=-9$$, $$b=0$$. The axis of symmetry is $$x=0$$.", variabilization: {}}, {id: "ad220b3GraphQuadratic24a-h5", type: "hint", dependencies: ["ad220b3GraphQuadratic24a-h4"], title: "Find the y coordinate of Vertex", text: "The maximum or minimum point of the parabola is located on the axis of symmetry. Given that $$x=a$$ is the axis of symmetry, we can find the y coordinate of the maximum or minimum point by computing f(a).", variabilization: {}}, {id: "ad220b3GraphQuadratic24a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["16"], dependencies: ["ad220b3GraphQuadratic24a-h5"], title: "Find the y coordinate of Vertex", text: "Subsitute $$x=0$$ into $$f(x)=-9x^2+16$$. $$f(x)=$$? Please enter your answer in decimal form.", variabilization: {}}, {id: "ad220b3GraphQuadratic24a-h7", type: "hint", dependencies: ["ad220b3GraphQuadratic24a-h6"], title: "Put The Answer Into (x,y)", text: "We know the maximum point of the parabola exists at $$x=0$$ and $$f(0)=16$$. So the minimum point in xy-coordinate is (0,16).", variabilization: {}}, ]; export {hints};