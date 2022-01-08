var hints = [{id: "b1a1268beother15a-h1", type: "hint", dependencies: [], title: "Substitute Variable", text: "Let's start by setting a variable y equal to x-3. Now we can substitute y into the equation and solve like a normal quadradic: $$y^2-4=0$$.", variabilization: {}}, {id: "b1a1268beother15a-h2", type: "hint", dependencies: ["b1a1268beother15a-h1"], title: "Factor", text: "Here, we can factor the quadratic as $$\\left(y+2\\right) \\left(y-2\\right)=0$$.", variabilization: {}}, {id: "b1a1268beother15a-h3", type: "hint", dependencies: ["b1a1268beother15a-h2"], title: "$$x-3=y$$", text: "Now, because we need to find the answer in terms of x, we need to substitute x-3 back in for y. So we must solve for $$x-3=2$$ and $$x-3=-2$$.", variabilization: {}}, {id: "b1a1268beother15a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["5"], dependencies: ["b1a1268beother15a-h3"], title: "Solve First Equation", text: "Solve $$x-3=2$$. What is x?", variabilization: {}}, {id: "b1a1268beother15a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["1"], dependencies: ["b1a1268beother15a-h4"], title: "Solve Second Equation", text: "Solve $$x-3=-2$$. What is x?", variabilization: {}}, {id: "b1a1268beother15a-h6", type: "hint", dependencies: ["b1a1268beother15a-h4", "b1a1268beother15a-h5"], title: "Final Answer", text: "So our final answer is $$x=5$$ and $$x=1$$.", variabilization: {}}, ]; export {hints};