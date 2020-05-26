var hints = [
  {
    id: 'slope2a-h1',
    title: "Slope",
    text: "Slope is a number that measures the steepness of a straight line.",
    type: "hint",
    dependencies: []
  },
  {
    id: 'slope2a-h2',
    title: "How to find slope ",
    text: "We measure slope by picking 2 points and dividing the change along the y-axis by the change along the x-axis.",
    type: "hint",
    dependencies: [0]
  },
  {
    id: 'slope2a-h3',
    title: "Slope Example (Pt 1)",
    text: "What is the change along the y-axis for this line from point A to point B? \n##slope2a-h1.gif##",
    type: "scaffold",
	problemType: "TextBox",
    answerType: "numeric",
	hintAnswer: ["3"],
    dependencies: [0, 1],
	subHints: [{
        id: 'slope2a-h3-s1',
        title: "Change in y",
        text: 'The change in y is the amount the line "goes up" from point A to point B. How many spaces does the green line go up?',
        type: "hint",
        dependencies: []
      }, {
        id: 'slope2a-h3-s2',
        title: "Hint Answer",
        text: "The change in y is 3",
        type: "hint",
        dependencies: [0]
      }],
  },
  {
    id: 'slope2a-h4',
    title: "Slope Example (Pt 2)",
    text: "What is the change in x for this line from point A to point B? \n##slope2a-h2.gif##",
    type: "scaffold",
	problemType: "TextBox",
    answerType: "numeric",
	hintAnswer: ["6"],
    dependencies: [0, 1, 2],
	subHints: [{
        id: 'slope2a-h4-s1',
        title: "Change in x",
        text: 'The change in x is the amount the line "goes over" from point A to point B. How many spaces does the blue line go from point A to point B?',
        type: "hint",
        dependencies: []
      }, {
        id: 'slope2a-h4-s2',
        title: "Hint Answer",
        text: "The change in x is 6.",
        type: "hint",
        dependencies: [0]
      }],
  },
  {
    id: 'slope2a-h5',
    title: "Slope Example (Pt 3)",
    text: "	Good. Remember, the slope is the change in y divided by the change in x.\nWhat is the slope for this line?",
    type: "scaffold",
	problemType: "TextBox",
    answerType: "numeric",
	hintAnswer: ["3/6"],
    dependencies: [0, 1, 2, 3],
	subHints: [{
        id: 'slope2a-h5-s1',
        title: "Change in x",
        text: 'The change in y from point A to point B is 3.\nThe change in x from point A to point B is 6.\nThe slope can be found by dividing the change in y by the change in x.',
        type: "hint",
        dependencies: []
      }, {
        id: 'slope2a-h5-s2',
        title: "Hint Answer",
        text: "The slope is 3/6.",
        type: "hint",
        dependencies: [0]
      }],
  },
  {
    id: 'slope2a-h7',
    title: "Solution",
    text: "The slope is 2 rise over 6 run = $\\frac{1}{2}$",
    type: "solution",
    dependencies: [0, 1, 2, 3, 4]
  }
]

export {hints};