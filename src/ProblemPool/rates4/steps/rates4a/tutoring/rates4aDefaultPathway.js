var hints = [{id: "rates4a-h1", type: "hint", dependencies: [], title: "average rate of change", text: "To find the average rate of change, we calculate the change in y, the change in x, and the average rate of change is the ratio (change in y)/(change in x)."}, {id: "rates4a-h2", type: "hint", dependencies: ["rates4a-h1"], title: "Computing endpoints", text: "We can start by computing the function values at each endpoint of the interval."}, {id: "rates4a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["1"], dependencies: ["rates4a-h2"], title: "Computing left endpoint", text: "What is g(0)?", subHints: [{id: "rates4a-h3-s1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["1"], dependencies: [], title: "Computing left endpoint", text: "To find g(0), we plug in 0 for every t in the equation. What is 0**2+3*0+1?"}]}, {id: "rates4a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["a^2+3a+1"], dependencies: ["rates4a-h2"], title: "Computing right endpoint", text: "What is g(a)?", subHints: [{id: "rates4a-h4-s1", type: "hint", dependencies: [], title: "Computing right endpoint", text: "To find g(a), we plug in a for every t in the equation. So we get the expression $$a^2+\\left(3\\right) a+\\left(1\\right)$$"}]}, {id: "rates4a-h5", type: "hint", dependencies: ["rates4a-h3", "rates4a-h4"], title: "Average rate of change", text: "The average rate of change=((g(a)-g(0))/(a-0)."}, {id: "rates4a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["a+3"], dependencies: ["rates4a-h5"], title: "Computing average rate of change", text: "What is the average rate of change, plugging in $$g \\left(0\\right)=1$$ and g(a)=a**2+3a+1?", subHints: [{id: "rates4a-h6-s1", type: "hint", dependencies: [], title: "Computing average rate of change", text: "g(0) and g(a), the average rate of $$change=\\frac{a^2+\\left(3\\right) a+\\left(1\\right)-\\left(1\\right)}{a-\\left(0\\right)}=\\frac{a^2+\\left(3\\right) a}{a}=\\frac{a \\left(a+\\left(3\\right)\\right)}{a}=a+\\left(3\\right)$$"}]}, ]; export {hints};