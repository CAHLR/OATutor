var hints = [{id: "b1a53b893whole8b-h1", type: "hint", dependencies: [], title: "Rule", text: "If the sum of the digits is divisible by 3, then the number is divisible by 3", variabilization: {}}, {id: "b1a53b893whole8b-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["21"], dependencies: ["b1a53b893whole8b-h1"], title: "Sum", text: "What is the sum of the digits?", variabilization: {}}, {id: "b1a53b893whole8b-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: ["b1a53b893whole8b-h2"], title: "Divisibility", text: "Based on the information above, is 4,962 divisible by 3?", choices: ["Yes", "No"], variabilization: {}}, ]; export {hints};