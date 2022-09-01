var hints = [{id: "a6f50b8bin6a-h1", type: "hint", dependencies: [], title: "Identify the a and b.", text: "Identify the a, b, and n of $${\\left(a+b\\right)}^n$$. Here, $$a=x$$, $$b=-2$$, $$n=5$$.", variabilization: {}}, {id: "a6f50b8bin6a-h2", type: "hint", dependencies: ["a6f50b8bin6a-h1"], title: "Use the binomial theorm.", text: "Follow the binomial theorem from this image.\n##figure1.gif##", variabilization: {}}, {id: "a6f50b8bin6a-h3", type: "hint", dependencies: ["a6f50b8bin6a-h2"], title: "Substitude into the binomial theorem.", text: "Substitue the a, b, and n that you found into the binomial equation.", variabilization: {}}, {id: "a6f50b8bin6a-h4", type: "hint", dependencies: ["a6f50b8bin6a-h3"], title: "Simplify.", text: "Simplify, resulting in $$x^5-10x^4+40x^3-80x^2+80x^1-32$$.", variabilization: {}}, ]; export {hints};