var hints = [{id: "geo12a-h1", type: "hint", dependencies: [], title: "Draw", text: "Draw the figure to try to better understand what the problem is asking"}, {id: "geo12a-h2", type: "hint", dependencies: ["geo12a-h1"], title: "Identify and Name", text: "We are looking for the third angle of the triangle and we can name it \"x\", we know the second side is 90 because it is a right triangle"}, {id: "geo12a-h3", type: "hint", dependencies: ["geo12a-h2"], title: "Translate", text: "Each of the three angles added together equals 180 degrees, $$x+\\left(90\\right)+\\left(56\\right)=180$$"}, {id: "geo12a-h4", type: "hint", dependencies: ["geo12a-h3"], title: "Solve", text: "Solve the equation using algebra"}, {id: "geo12a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["146"], dependencies: ["geo12a-h4"], title: "Solve", text: "First let's simplify the left side of the equation. What is 56+90?"}, {id: "geo12a-h6", type: "hint", dependencies: ["geo12a-h5"], title: "Solve", text: "Now, we can subtract 146 from both sides of the equation to find x"}, ]; export {hints};