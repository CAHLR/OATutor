var hints = [{id: "a85fcf1geometric15a-h1", type: "hint", dependencies: [], title: "Sum of the First n Terms Formula", text: "The sum, $$S_n$$, of the first n terms of a geometric sequence is $$S_n=\\frac{a_1 \\left(1-r^n\\right)}{1-r}$$.", variabilization: {}}, {id: "a85fcf1geometric15a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["6"], dependencies: ["a85fcf1geometric15a-h1"], title: "Determine $$a_1$$", text: "What is $$a_1$$ in the formula above? Essentially, what is the starting term?", variabilization: {}}, {id: "a85fcf1geometric15a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3"], dependencies: ["a85fcf1geometric15a-h2"], title: "Determine r", text: "What is r? What is the common ratio?", variabilization: {}}, {id: "a85fcf1geometric15a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["20"], dependencies: ["a85fcf1geometric15a-h3"], title: "Determine n", text: "What is n? How many terms of the sequence do we want to sum?", variabilization: {}}, {id: "a85fcf1geometric15a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["10460353200"], dependencies: ["a85fcf1geometric15a-h4"], title: "Solve for the Summation", text: "Plug in the values into the equation for $$S_n$$ and solve. What is the sum of the first 20 terms of the geometric sequence?", subHints: [{id: "a85fcf1geometric15a-h5-s1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["10460353200"], dependencies: [], title: "Solve for the Summation", text: "What is $$S_{20}$$? Effectively, what is $$\\frac{6\\left(1-3^{20}\\right)}{1-3}$$?", variabilization: {}}], variabilization: {}}, ]; export {hints};