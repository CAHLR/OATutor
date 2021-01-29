var hints = [{id: "measure24a-h1", type: "hint", dependencies: [], title: "Approach", text: "Since the problem wants the answer in centimeters, we will convert all measurements into centimeters before proceeding with arithmetics."}, {id: "measure24a-h2", type: "hint", dependencies: ["measure24a-h1"], title: "Relation between m and cm", text: "The relation between meters and centimeters is 1 $$m=100$$ cm."}, {id: "measure24a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["180"], dependencies: ["measure24a-h2"], title: "Converting Dad's Height", text: "We start by converting Matthias' height into centimeters. What is 1.8 m in cm?"}, {id: "measure24a-h4", type: "hint", dependencies: ["measure24a-h3"], title: "Applying the Conversion", text: "To convert 1.8 m into cm, we use the expression 1.8 m=(1.8 m)*(100 cm)/(1 m)=(1.8)*(100 cm)/(1)=180 cm. The first equality holds because 100 $$cm=1$$ m, and the second equation holds because we can cancel the m."}, {id: "measure24a-h5", type: "hint", dependencies: ["measure24a-h4"], title: "Final Answer", text: "Now that we have both Matthias and his son's heights in centimeters, to find the difference between their heights in centimeters, we can simply subtract the the two numbers."}, {id: "measure24a-h6", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["91"], dependencies: ["measure24a-h5"], title: "Final Answer", text: "What is 180-89?"}, ]; export {hints};