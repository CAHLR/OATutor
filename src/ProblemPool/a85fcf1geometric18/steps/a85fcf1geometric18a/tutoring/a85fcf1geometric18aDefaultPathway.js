var hints = [{id: "a85fcf1geometric18a-h1", type: "hint", dependencies: [], title: "Sum of the First n Terms Formula", text: "The sum, $$S_n$$, of the first n terms of a geometric sequence is $$S_n=\\frac{a_1 \\left(1-r^n\\right)}{1-r}$$. We note that the form that is given is $$\\sum_{i=1}^{10} 5\\times2^i$$ and this is written in the form $$\\sum_{i=1}^{k} a r^i$$ where we're summing the first k terms where r is the common ratio and $$a r$$ is the starting value.", variabilization: {}}, {id: "a85fcf1geometric18a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["10"], dependencies: ["a85fcf1geometric18a-h1"], title: "Determine $$a_1$$", text: "What is $$a_1$$?", subHints: [{id: "a85fcf1geometric18a-h2-s1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["10"], dependencies: [], title: "Determine $$a_1$$", text: "What is $$5\\times2^1$$?", variabilization: {}}], variabilization: {}}, {id: "a85fcf1geometric18a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["2"], dependencies: ["a85fcf1geometric18a-h2"], title: "Determine r", text: "What is r? What is the common ratio? This is usually the base of the exponent in the summation.", variabilization: {}}, {id: "a85fcf1geometric18a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["10"], dependencies: ["a85fcf1geometric18a-h3"], title: "Determine n", text: "What is n? As in, how many values are in the summation?", variabilization: {}}, {id: "a85fcf1geometric18a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["10230"], dependencies: ["a85fcf1geometric18a-h4"], title: "Solve for the Summation", text: "Plug in the values into the equation for $$S_n$$ and solve. What is the sum of the first 10 terms of the geometric sequence?", subHints: [{id: "a85fcf1geometric18a-h5-s1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["10230"], dependencies: [], title: "Solve for the Summation", text: "What is $$\\frac{10\\left(1-2^{10}\\right)}{1-2}$$?", variabilization: {}}], variabilization: {}}, ]; export {hints};