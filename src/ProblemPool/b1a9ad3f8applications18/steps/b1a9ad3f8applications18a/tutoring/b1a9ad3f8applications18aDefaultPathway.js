var hints = [{id: "b1a9ad3f8applications18a-h1", type: "hint", dependencies: [], title: "Identify the Numbers", text: "The problem specifies there are \"two numbers.\"", variabilization: {}}, {id: "b1a9ad3f8applications18a-h2", type: "hint", dependencies: ["b1a9ad3f8applications18a-h1"], title: "Create Variables", text: "Name the two unknown numbers x and y to represent those quantities. Let $$x=one$$ number and $$y=second$$ number.", variabilization: {}}, {id: "b1a9ad3f8applications18a-h3", type: "hint", dependencies: ["b1a9ad3f8applications18a-h2"], title: "Translate Into System", text: "Since the sum of the two number is negative eighteen we can write $$x+y=-18$$. Additionally one number is fourty more than the other so we can write $$x=y+40$$.", variabilization: {}}, {id: "b1a9ad3f8applications18a-h4", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["$$x+y=-18, x=y+40$$"], dependencies: ["b1a9ad3f8applications18a-h3"], title: "Translate Into System", text: "What is the systems of equation represented in the problem?", choices: ["$$x+y=18, x=y+20Ix-y=-18, x=y-10Ix+y=-18, x=y-20Ix+y=-18, x=y+40$$"], variabilization: {}}, ]; export {hints};