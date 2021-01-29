var hints = [{id: "other17a-h1", type: "hint", dependencies: [], title: "First Step", text: "The first step is to square both sides."}, {id: "other17a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["15-2x=x^2"], dependencies: ["other17a-h1"], title: "Result of Squaring Both Sides", text: "What does the equation turn into just after you have squared both sides?"}, {id: "other17a-h3", type: "hint", dependencies: ["other17a-h2"], title: "Solving a Quadratic Equation", text: "We see that the resulting equation is quadratic. Set the equation up in qudaratic format, $${ax}^2+bx+c=0$$ and solve for x."}, {id: "other17a-h4", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["x=-5,3"], dependencies: ["other17a-h3"], title: "Proposed Solutions of the Quadratic Equation", text: "What are the solutions for x from the quadratic equation?", choices: ["$$x=53$$", "$$x=31$$", "$$x=-\\\\left(53\\\\right)$$", "$$x=-\\\\left(31\\\\right)$$"]}, {id: "other17a-h5", type: "hint", dependencies: ["other17a-h4"], title: "Checking for Extraneous Solutions", text: "Despite the fact that the solutions work in the quadratic equation, they might not work when subsituted for x in the original equation. Next, check each x value to see it it fits the original equation."}, {id: "other17a-h6", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["no"], dependencies: ["other17a-h5"], title: "scaffold", text: "When $$x=-\\left(5\\right)$$ does sqrt(15-2x)=x?", choices: ["yes", "no"]}, {id: "other17a-h7", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["yes"], dependencies: ["other17a-h5"], title: "scaffold", text: "When $$x=3$$ does sqrt(15-2x)=x?", choices: ["yes", "no"]}, {id: "other17a-h8", type: "hint", dependencies: ["other17a-h6", "other17a-h7"], title: "hint", text: "If an x value does not work in the original equation, then it is extraneous and not a solution of the original equation."}, ]; export {hints};