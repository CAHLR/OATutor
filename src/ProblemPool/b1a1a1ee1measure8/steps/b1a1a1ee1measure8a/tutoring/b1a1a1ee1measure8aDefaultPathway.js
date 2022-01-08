var hints = [{id: "b1a1a1ee1measure8a-h1", type: "hint", dependencies: [], title: "Convert", text: "Multiply the measurement to be converted by 1; write 1 as a fraction relating the units given and the units needed.", variabilization: {}}, {id: "b1a1a1ee1measure8a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["1000"], dependencies: ["b1a1a1ee1measure8a-h1"], title: "Convert", text: "How many grams are in one kilogram?", variabilization: {}}, {id: "b1a1a1ee1measure8a-h3", type: "hint", dependencies: ["b1a1a1ee1measure8a-h2"], title: "Multiply", text: "Multiply 3200 grams by 1 $$\\frac{kg}{1000}$$ grams (grams should be in the denominator so that the grams will divide out).", variabilization: {}}, {id: "b1a1a1ee1measure8a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3.2"], dependencies: ["b1a1a1ee1measure8a-h3"], title: "Multiply", text: "What do we get after the multiplication?", variabilization: {}}, ]; export {hints};