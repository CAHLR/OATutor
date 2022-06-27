var hints = [{id: "a276c42SolveRational24a-h1", type: "hint", dependencies: [], title: "Put The Equation In The Correct Form with Zero By Itself On One Side", text: "Write the inequality as one quotient on the left and zero on the right.", variabilization: {}}, {id: "a276c42SolveRational24a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\left(x+4\\right) \\left(x-4\\right)$$"], dependencies: ["a276c42SolveRational24a-h1"], title: "Factor the denominator", text: "Factor $$x^2-16$$.", variabilization: {}}, {id: "a276c42SolveRational24a-h3", type: "hint", dependencies: ["a276c42SolveRational24a-h2"], title: "Find The Critical Points of Equation", text: "The quotient is 0 when the numerator is 0. Since the numerator is always 1, the quotient cannot be 0.", variabilization: {}}, {id: "a276c42SolveRational24a-h4", type: "hint", dependencies: ["a276c42SolveRational24a-h3"], title: "Find The Critical Points of Equation", text: "The quotient will be undefined when the denominator is zero. $$\\left(x+4\\right) \\left(x-4\\right)=0$$ when $$x=-4$$, $$x=4$$.", variabilization: {}}, {id: "a276c42SolveRational24a-h5", type: "hint", dependencies: ["a276c42SolveRational24a-h4"], title: "Use the Critical Points to Divide the Number Line into Intervals.", text: "Given that the $$x=-4$$ and $$x=4$$ are the two critical points, we can divide the number line into three intervals, namely, $$\\left(-\\infty-4\\right)$$, (-4,4) and $$4\\infty$$.", variabilization: {}}, {id: "a276c42SolveRational24a-h6", type: "hint", dependencies: ["a276c42SolveRational24a-h5"], title: "Test a Value in Each Interval.", text: "To find the sign of each factor in an interval, we choose any point in that interval and use it as a test point. Any point in the interval will give the expression the same sign, so we can choose any point in the interval.", variabilization: {}}, {id: "a276c42SolveRational24a-h7", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{9}$$"], dependencies: ["a276c42SolveRational24a-h6"], title: "Test a Value in Each Interval.", text: "For the interval $$\\left(-\\infty-4\\right)$$, take the point $$x=-5$$ within the interval and plug it into the quotient $$\\frac{1}{\\left(x+4\\right) \\left(x-4\\right)}$$. What is the value of $$\\frac{1}{\\left(x+4\\right) \\left(x-4\\right)}$$ after plugging in the value $$x=-5$$?", variabilization: {}}, {id: "a276c42SolveRational24a-h8", type: "hint", dependencies: ["a276c42SolveRational24a-h7"], title: "Test a Value in Each Interval.", text: "Since $$\\frac{1}{9}$$ is a positive numer greater than 0, we get the sign of quotient is positive in the interval $$\\left(-\\infty-4\\right)$$.", variabilization: {}}, {id: "a276c42SolveRational24a-h9", type: "hint", dependencies: ["a276c42SolveRational24a-h8"], title: "Test a Value in Each Interval.", text: "For the interval (-4,4), take the point $$x=0$$ within the interval and plug it into the expression $$\\frac{1}{\\left(x+4\\right) \\left(x-4\\right)}$$. We get $$\\frac{-1}{16}$$ after plugging in $$x=0$$ into the quotient $$\\frac{1}{\\left(x+4\\right) \\left(x-4\\right)}$$. $$\\frac{-1}{16}$$ is a negative number, so we can mark the quotient negative in the interval (-4,4).", variabilization: {}}, {id: "a276c42SolveRational24a-h10", type: "hint", dependencies: ["a276c42SolveRational24a-h9"], title: "Test a Value in Each Interval.", text: "For the interval $$4\\infty$$, take the point $$x=5$$ within the interval and plug it into the original expression $$\\frac{1}{\\left(x+4\\right) \\left(x-4\\right)}$$. We get $$\\frac{1}{9}$$ after plugging in $$x=5$$ into the quotient $$\\frac{1}{\\left(x+4\\right) \\left(x-4\\right)}$$. $$\\frac{1}{9}$$ is a positive number, so we can mark the quotient positive in the interval $$4\\infty$$.", variabilization: {}}, {id: "a276c42SolveRational24a-h11", type: "hint", dependencies: ["a276c42SolveRational24a-h10"], title: "Determine the Intervals Where the Inequality is Correct.", text: "We want the quotient to be less than zero, so the numbers in the intervals (-4,4) are the solution.", variabilization: {}}, ]; export {hints};