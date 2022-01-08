var hints = [{id: "b1af69facexpolog28c-h1", type: "hint", dependencies: [], title: "Solving for t", text: "Substitute $$T(t)=110$$ to solve for t.", variabilization: {}}, {id: "b1af69facexpolog28c-h2", type: "hint", dependencies: ["b1af69facexpolog28c-h1"], title: "Solving for t", text: "Subtract 75 from both sides.", variabilization: {}}, {id: "b1af69facexpolog28c-h3", type: "hint", dependencies: ["b1af69facexpolog28c-h2"], title: "Solving for t", text: "Divide by 90 from both sides.", variabilization: {}}, {id: "b1af69facexpolog28c-h4", type: "hint", dependencies: ["b1af69facexpolog28c-h3"], title: "Solving for t", text: "Take natural log on both sides.", variabilization: {}}, {id: "b1af69facexpolog28c-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["113"], dependencies: ["b1af69facexpolog28c-h4"], title: "Solving for t", text: "Divide by continuous rate of cooling, $$k=-0.008377$$. What is t? Round to the nearest minute.", variabilization: {}}, ]; export {hints};