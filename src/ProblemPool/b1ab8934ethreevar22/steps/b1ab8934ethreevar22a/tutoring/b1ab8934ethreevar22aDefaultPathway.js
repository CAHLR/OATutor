var hints = [{id: "b1ab8934ethreevar22a-h1", type: "hint", dependencies: [], title: "Setting Up", text: "Set up three equatinos in variable form to represent the situation $$(c=children$$, $$p=parent$$, and $$g=grandparent)$$. We know that $$c+p+g=400$$, $$2g=p$$, and $$p+50=c$$.", variabilization: {}}, {id: "b1ab8934ethreevar22a-h2", type: "hint", dependencies: ["b1ab8934ethreevar22a-h1"], title: "Simplifying to 1 Variable", text: "Plug in the expressions $$c=p+50$$ and $$g=0.5p$$ into $$c+p+g=400$$ so that only the variable p is present.", variabilization: {}}, {id: "b1ab8934ethreevar22a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["140"], dependencies: ["b1ab8934ethreevar22a-h2"], title: "Solving for p", text: "Combine the p variables and solve for the number of parents using algebra", variabilization: {}}, {id: "b1ab8934ethreevar22a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["190"], dependencies: ["b1ab8934ethreevar22a-h3"], title: "Solving for c", text: "Plug in the value of p into the expression $$c=p+50$$ to solve for the number of children", variabilization: {}}, {id: "b1ab8934ethreevar22a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["70"], dependencies: ["b1ab8934ethreevar22a-h4"], title: "Solving for g", text: "Plug in the value of p into the expression $$g=0.5p$$ to solve for the number of grandparents", variabilization: {}}, ]; export {hints};