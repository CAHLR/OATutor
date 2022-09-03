var hints = [{id: "aa4fe43SolveRational9a-h1", type: "hint", dependencies: [], title: "Put The Equation In The Correct Form with Zero By Itself On One Side", text: "Write the inequality as one quotient on the left and zero on the right.", variabilization: {}}, {id: "aa4fe43SolveRational9a-h2", type: "hint", dependencies: ["aa4fe43SolveRational9a-h1"], title: "Put The Equation In The Correct Form with Zero By Itself On One Side", text: "By subtracting 1 to get zero on the right, we get $$\\frac{5x}{x-2}-1<0$$.", variabilization: {}}, {id: "aa4fe43SolveRational9a-h3", type: "hint", dependencies: ["aa4fe43SolveRational9a-h2"], title: "Rewrite 1 As a Fraction Using the LCD.", text: "LCD for $$\\frac{5x}{x-2}$$ and 1 is (x-2), we can rewrite 1 as $$\\frac{x-2}{x-2}$$. We can rewrite (5*x)/(x-2)-1as $$\\frac{5x}{x-2}-\\frac{x-2}{x-2}$$.", variabilization: {}}, {id: "aa4fe43SolveRational9a-h4", type: "hint", dependencies: ["aa4fe43SolveRational9a-h3"], title: "Rewrite 1 As a Fraction Using the LCD.", text: "By subtracting the numerators and placing the difference over the common denominator, we can rewrite $$\\frac{5x}{x-2}-\\frac{x-2}{x-2}$$ as $$\\frac{5x-x-2}{x-2}$$.", variabilization: {}}, {id: "aa4fe43SolveRational9a-h5", type: "hint", dependencies: ["aa4fe43SolveRational9a-h4"], title: "Simplify $$\\frac{5x-x-2}{x-2}$$", text: "$$\\frac{5x-x-2}{x-2}=\\frac{4x+2}{x-2}$$", variabilization: {}}, {id: "aa4fe43SolveRational9a-h6", type: "hint", dependencies: ["aa4fe43SolveRational9a-h5"], title: "Find The Critical Points of Equation", text: "Determine the critical points—the points where the rational expression will be zero or undefined.", variabilization: {}}, {id: "aa4fe43SolveRational9a-h7", type: "hint", dependencies: ["aa4fe43SolveRational9a-h6"], title: "Find The Critical Points of Equation", text: "When is the equation undefine? Note that the equation is undefined when the denominator equal to zero.", variabilization: {}}, {id: "aa4fe43SolveRational9a-h8", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["2"], dependencies: ["aa4fe43SolveRational9a-h7"], title: "Find The Critical Points of Equation", text: "Solve the equation $$x-2=0$$. What is the value of x?", variabilization: {}}, {id: "aa4fe43SolveRational9a-h9", type: "hint", dependencies: ["aa4fe43SolveRational9a-h8"], title: "Find The Critical Points of Equation", text: "When does the equation equal zero? Note that the equation is undefined when the numerator equal to zero.", variabilization: {}}, {id: "aa4fe43SolveRational9a-h10", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{-1}{2}$$"], dependencies: ["aa4fe43SolveRational9a-h9"], title: "Find The Critical Points of Equation", text: "Solve the equation $$4x+2=0$$. What is the value of x?", variabilization: {}}, {id: "aa4fe43SolveRational9a-h11", type: "hint", dependencies: ["aa4fe43SolveRational9a-h10"], title: "Use the Critical Points to Divide the Number Line into Intervals.", text: "Given that the $$x=\\frac{-1}{2}$$ and $$x=2$$ are the two critical points, we can divide the number line into three intervals, namely, $$(-\\infty,\\frac{-1}{2})$$, $$(\\frac{-1}{2},2)$$ and $$(2,\\infty)$$.", variabilization: {}}, {id: "aa4fe43SolveRational9a-h12", type: "hint", dependencies: ["aa4fe43SolveRational9a-h11"], title: "Test a Value in Each Interval.", text: "To find the sign of each factor in an interval, we choose any point in that interval and use it as a test point. Any point in the interval will give the expression the same sign, so we can choose any point in the interval.", variabilization: {}}, {id: "aa4fe43SolveRational9a-h13", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{3}{2}$$"], dependencies: ["aa4fe43SolveRational9a-h12"], title: "Test a Value in Each Interval.", text: "For the interval $$(-\\infty,\\frac{-1}{2})$$, take the point $$x=-2$$ within the interval and plug it into the quotient $$\\frac{4x+2}{x-2}$$. What is the value of $$\\frac{4x+2}{x-2}$$ after plugging in the value $$x=-2$$?", variabilization: {}}, {id: "aa4fe43SolveRational9a-h14", type: "hint", dependencies: ["aa4fe43SolveRational9a-h13"], title: "Test a Value in Each Interval.", text: "Since $$\\frac{3}{2}$$ is a positive numer greater than 0, we get the sign of quotient is positive in the interval $$(-\\infty,\\frac{-1}{2})$$.", variabilization: {}}, {id: "aa4fe43SolveRational9a-h15", type: "hint", dependencies: ["aa4fe43SolveRational9a-h14"], title: "Test a Value in Each Interval.", text: "For the interval $$(\\frac{-1}{2},2)$$, take the point $$x=0$$ within the interval and plug it into the original expression $$\\frac{4x+2}{x-2}$$. We get --1 after plugging in $$x=0$$ into the quotient $$\\frac{4x+2}{x-2}$$. -1 is a negative number, so we can mark the quotient negative in the interval $$(\\frac{-1}{2},2)$$.", variabilization: {}}, {id: "aa4fe43SolveRational9a-h16", type: "hint", dependencies: ["aa4fe43SolveRational9a-h15"], title: "Test a Value in Each Interval.", text: "For the interval $$(2,\\infty)$$, take the point $$x=3$$ within the interval and plug it into the original expression $$\\frac{4x+2}{x-2}$$. We get 14 after plugging in $$x=3$$ into the quotient $$\\frac{4x+2}{x-2}$$. 14 is a positive number, so we can mark the quotient positive in the interval $$(2,\\infty)$$.", variabilization: {}}, {id: "aa4fe43SolveRational9a-h17", type: "hint", dependencies: ["aa4fe43SolveRational9a-h16"], title: "Determine the Intervals Where the Inequality is Correct.", text: "We want the quotient to be less than zero, so the numbers in the interval $$(\\frac{-1}{2},2)$$ are the solution.", variabilization: {}}, ]; export {hints};