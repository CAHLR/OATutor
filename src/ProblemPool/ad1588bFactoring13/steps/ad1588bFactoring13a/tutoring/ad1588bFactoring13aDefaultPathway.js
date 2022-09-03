var hints = [{id: "ad1588bFactoring13a-h1", type: "hint", dependencies: [], title: "Factor out the greatest common term", text: "What is the greatest common factor of all terms in the expression $$4x^2+8b x-4a x-8a b$$?", variabilization: {}}, {id: "ad1588bFactoring13a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["4"], dependencies: ["ad1588bFactoring13a-h1"], title: "Factor out the greatest common term", text: "What is the greatest common factor of $$4x^2$$, $$8b x$$, $$4a x$$ and $$8a b$$?", variabilization: {}}, {id: "ad1588bFactoring13a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$x^2+2b x-a x-2a b$$"], dependencies: ["ad1588bFactoring13a-h2"], title: "Factor out the greatest common term", text: "$$4x^2+8b x-4a x-8a b=$$ 4*(?) What is ?", variabilization: {}}, {id: "ad1588bFactoring13a-h4", type: "hint", dependencies: ["ad1588bFactoring13a-h3"], title: "Factor by grouping", text: "Next, we will group the terms with similar factor together.", variabilization: {}}, {id: "ad1588bFactoring13a-h5", type: "hint", dependencies: ["ad1588bFactoring13a-h4"], title: "Factor by grouping", text: "In the expression, $$x^2+2b x-a x-2a b$$, we will group $$-\\left(a x\\right)$$ and $$-\\left(2a b\\right)$$ together", variabilization: {}}, {id: "ad1588bFactoring13a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$-a \\left(x+2b\\right)$$"], dependencies: ["ad1588bFactoring13a-h5"], title: "Factor by grouping", text: "Factor $$-\\left(a x\\right)-2a b$$", variabilization: {}}, {id: "ad1588bFactoring13a-h7", type: "hint", dependencies: ["ad1588bFactoring13a-h4"], title: "Factor by grouping", text: "We will group $$x^2$$ and $$2b x$$ together so that we can factor out the common factor x. Then we get $$x^2+2b x=x \\left(x+2b\\right)$$", variabilization: {}}, {id: "ad1588bFactoring13a-h8", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$x+2b$$"], dependencies: ["ad1588bFactoring13a-h7"], title: "Factor by grouping", text: "By putting together the result of factoring by grouping , we yield $$x^2+2b x-a x-2a b=x \\left(x+2b\\right)-a \\left(x+2b\\right)$$. What is the greatest common factor in $$x \\left(x+2b\\right)$$ and $$-a \\left(x+2b\\right)$$?", variabilization: {}}, {id: "ad1588bFactoring13a-h9", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["x-a"], dependencies: ["ad1588bFactoring13a-h8"], title: "Factor by grouping", text: "$$x \\left(x+2b\\right)-a \\left(x+2b\\right)$$ has the common factor $$x+2b$$, so we can further factor $$x \\left(x+2b\\right)-a \\left(x+2b\\right)$$ into (x+2b)*(?). what is ?", variabilization: {}}, {id: "ad1588bFactoring13a-h10", type: "hint", dependencies: ["ad1588bFactoring13a-h9"], title: "Put together all factors", text: "Based on the above steps, we get $$4x^2+8b x-4a x-8a b=4\\left(x \\left(x+2b\\right)-a \\left(x+2b\\right)\\right)=4\\left(x+2b\\right) \\left(x-a\\right)$$", variabilization: {}}, {id: "ad1588bFactoring13a-h11", type: "hint", dependencies: ["ad1588bFactoring13a-h10"], title: "Final remark", text: "Alternatively, you can also group (-a*x with x**2), (2*b*x with -2*a*b) then do factoring by group. You should yield the same final answer. You can try it as exercise.", variabilization: {}}, ]; export {hints};