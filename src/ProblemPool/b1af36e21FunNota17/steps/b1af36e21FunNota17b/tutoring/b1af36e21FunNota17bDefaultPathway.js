var hints = [{id: "b1af36e21FunNota17b-h1", type: "hint", dependencies: [], title: "Evaluating functions", text: "Given the equation for a function, we should replace the input variable in the equation with the value provided and then calculate the result.", variabilization: {}}, {id: "b1af36e21FunNota17b-h2", type: "hint", dependencies: ["b1af36e21FunNota17b-h1"], title: "Replacement", text: "Replace the variable x with 2, and we get $$f(2)=\\sqrt{2-2}+5$$.", variabilization: {}}, {id: "b1af36e21FunNota17b-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["5"], dependencies: ["b1af36e21FunNota17b-h2"], title: "Calculation", text: "Calculate the expression sqrt(2 - 2)+5. What do you get?", variabilization: {}}, ]; export {hints};