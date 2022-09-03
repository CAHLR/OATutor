var hints = [{id: "a10e4c3factoring7a-h1", type: "hint", dependencies: [], title: "Find factor pairs of the first term", text: "The only factors of $$2a^2$$ are a and 2a. Since its only that pair, lets put them in the parentheses.", variabilization: {}}, {id: "a10e4c3factoring7a-h2", type: "hint", dependencies: ["a10e4c3factoring7a-h1"], title: "Find factor pairs of the third term", text: "The only factors of 3 are 1 and 3.", variabilization: {}}, {id: "a10e4c3factoring7a-h3", type: "hint", dependencies: ["a10e4c3factoring7a-h2"], title: "Test", text: "Test all possibly combinations of the factors until the correct product is found.", variabilization: {}}, {id: "a10e4c3factoring7a-h4", type: "hint", dependencies: ["a10e4c3factoring7a-h3"], title: "Answer", text: "The answer is $$\\left(2a+3\\right) \\left(a+1\\right)$$.", variabilization: {}}, ]; export {hints};