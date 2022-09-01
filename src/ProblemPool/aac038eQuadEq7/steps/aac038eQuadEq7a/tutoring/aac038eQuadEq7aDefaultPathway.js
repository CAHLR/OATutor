var hints = [{id: "aac038eQuadEq7a-h1", type: "hint", dependencies: [], title: "Procedure", text: "To solve the quadratic inequality, the procedure is as follows. Solve for the roots of the quadratic formula, divide the number line into intervals based on the roots of the quadratic formula, test the values of each interval to see if they are positive or negative, and determine the intervals where the inequality is correct.", variabilization: {}}, {id: "aac038eQuadEq7a-h2", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["-4,2"], dependencies: ["aac038eQuadEq7a-h1"], title: "Quadratic Roots", text: "What are the roots of the quadratic equation? Use ~ for $$\\frac{plus}{minus}$$ and i for imaginary numbers in the answer. Write the answer in the form of x1,x2 if applicable as well.", variabilization: {}}, {id: "aac038eQuadEq7a-h3", type: "hint", dependencies: ["aac038eQuadEq7a-h2"], title: "Interval Checking", text: "Now let's check our intervals. We will have 3 distinct intervals to check values for.", variabilization: {}}, {id: "aac038eQuadEq7a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["7"], dependencies: ["aac038eQuadEq7a-h3"], title: "Interval Checking", text: "If we plug in $$x=-5$$, what will our value be?", variabilization: {}}, {id: "aac038eQuadEq7a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-8"], dependencies: ["aac038eQuadEq7a-h4"], title: "Interval Checking", text: "If we plug in $$x=0$$, what will our value be?", variabilization: {}}, {id: "aac038eQuadEq7a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["7"], dependencies: ["aac038eQuadEq7a-h5"], title: "Interval Checking", text: "If we plug in $$x=3$$, what will our value be?", variabilization: {}}, {id: "aac038eQuadEq7a-h7", type: "scaffold", problemType: "TextBox", answerType: "string", hintAnswer: ["(-inf,-4]&[2,inf)"], dependencies: ["aac038eQuadEq7a-h6"], title: "Solution", text: "Since we have checked each interval, which ones have positive values in them?", variabilization: {}}, ]; export {hints};