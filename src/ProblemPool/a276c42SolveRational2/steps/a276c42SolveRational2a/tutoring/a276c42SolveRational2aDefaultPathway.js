var hints = [{id: "a276c42SolveRational2a-h1", type: "hint", dependencies: [], title: "Put The Equation In The Correct Form with Zero By Itself On One Side", text: "Write the inequality as one quotient on the left and zero on the right.", variabilization: {}}, {id: "a276c42SolveRational2a-h2", type: "hint", dependencies: ["a276c42SolveRational2a-h1"], title: "Find The Critical Points of Equation", text: "Determine the critical points—the points where the rational expression will be zero or undefined.", variabilization: {}}, {id: "a276c42SolveRational2a-h3", type: "hint", dependencies: ["a276c42SolveRational2a-h2"], title: "Find The Critical Points of Equation", text: "When is the equation undefine? Note that the equation is undefined when the denominator equal to zero.", variabilization: {}}, {id: "a276c42SolveRational2a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["5"], dependencies: ["a276c42SolveRational2a-h3"], title: "Find The Critical Points of Equation", text: "Solve the equation $$x-5=0$$. What is the value of x?", variabilization: {}}, {id: "a276c42SolveRational2a-h5", type: "hint", dependencies: ["a276c42SolveRational2a-h3"], title: "Find The Critical Points of Equation", text: "When does the equation equal zero? Note that the equation is undefined when the numerator equal to zero.", variabilization: {}}, {id: "a276c42SolveRational2a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-6"], dependencies: ["a276c42SolveRational2a-h3"], title: "Find The Critical Points of Equation", text: "Solve the equation $$x+6=0$$. What is the value of x?", variabilization: {}}, {id: "a276c42SolveRational2a-h7", type: "hint", dependencies: ["a276c42SolveRational2a-h4", "a276c42SolveRational2a-h5", "a276c42SolveRational2a-h6"], title: "Use the Critical Points to Divide the Number Line into Intervals.", text: "Given that the $$x=-6$$ and $$x=5$$ are the two critical points, we can divide the number line into three intervals, namely, $$(-\\infty,-6)$$, (-6,5) and $$(5,\\infty)$$.", variabilization: {}}, {id: "a276c42SolveRational2a-h8", type: "hint", dependencies: ["a276c42SolveRational2a-h7"], title: "Test a Value in Each Interval.", text: "To find the sign of each factor in an interval, we choose any point in that interval and use it as a test point. Any point in the interval will give the expression the same sign, so we can choose any point in the interval.", variabilization: {}}, {id: "a276c42SolveRational2a-h9", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$\\frac{1}{12}$$"], dependencies: ["a276c42SolveRational2a-h8"], title: "Test a Value in Each Interval.", text: "For the interval $$(-\\infty,-6)$$, take the point $$x=-7$$ within the interval and plug it into the original expression. What is the value of $$\\frac{x+6}{x-5}$$ after plugging in the value $$x=-7$$?", variabilization: {}}, {id: "a276c42SolveRational2a-h10", type: "hint", dependencies: ["a276c42SolveRational2a-h9"], title: "Test a Value in Each Interval.", text: "Since $$\\frac{1}{12}$$ is a positive numer greater than 0, we get the sign of quotient is positive in the interval $$(-\\infty,-6)$$.", variabilization: {}}, {id: "a276c42SolveRational2a-h11", type: "hint", dependencies: ["a276c42SolveRational2a-h10"], title: "Test a Value in Each Interval.", text: "For the interval (-6,5), take the point $$x=0$$ within the interval and plug it into the original $$\\frac{\\operatorname{expression}\\left(x+6\\right)}{x-5}$$. We get $$\\frac{-6}{5}$$ after plugging in $$x=0$$ into the quotient $$\\frac{x+6}{x-5}$$. $$\\frac{-6}{5}$$ is a negative number, so we can mark the quotient negative in the interval (-6,5).", variabilization: {}}, {id: "a276c42SolveRational2a-h12", type: "hint", dependencies: ["a276c42SolveRational2a-h11"], title: "Test a Value in Each Interval.", text: "For the interval $$(5,\\infty)$$, take the point $$x=6$$ within the interval and plug it into the original expression $$\\frac{x+6}{x-5}$$. We get 12 after plugging in $$x=6$$ into the quotient $$\\frac{x+6}{x-5}$$. 12 is a positive number, so we can mark the quotient positive in the interval $$(5,\\infty)$$.", variabilization: {}}, {id: "a276c42SolveRational2a-h13", type: "hint", dependencies: ["a276c42SolveRational2a-h12"], title: "Determine the Intervals Where the Inequality is Correct.", text: "We want the quotient to be greater than or equal to zero, so the numbers in the intervals $$(-\\infty,-6)$$, and $$(5,\\infty)$$ are solutions.", variabilization: {}}, {id: "a276c42SolveRational2a-h14", type: "hint", dependencies: ["a276c42SolveRational2a-h13"], title: "Determine the Critical Points Where the Inequality is Correct", text: "The critical point $$x=5$$ makes the denominator 0, so it must be excluded from the solution and we mark it with a parenthesis. The critical point $$x=-6$$ makes the whole rational expression 0. The inequality requires that the rational expression be greater than or equal to 0. So, -6 is part of the solution and we will mark it with a bracket.", variabilization: {}}, {id: "a276c42SolveRational2a-h15", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["(-inf,-6]U(5,inf)"], dependencies: ["a276c42SolveRational2a-h14"], title: "Write the Final Answer in the interval Form", text: "We know that $$(-\\infty,-6)$$, $$(5,\\infty)$$ and $$x=-6$$ are the answer, please use \"[ ]\". \"( )\" and U to write it in a mathematical form.", variabilization: {}}, ]; export {hints};