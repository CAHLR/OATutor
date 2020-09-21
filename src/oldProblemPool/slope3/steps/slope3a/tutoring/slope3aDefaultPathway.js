var hints = [
  {
    id: 'slope3a-h1',
    title: "Slope",
    text: "Let us break this problem into a few steps. \nFirst, slope is defined as being the change along the y-axis over the change along the x-axis, commonly referred to as the rise over the run. First, does this line have a positive or a negative slope?.",
    type: "scaffold",
    problemType: "MultipleChoice",
    choices: ["A: Negative", "B: Positive"],
    hintAnswer: ["B: Positive"],
    answerType: "string",
    dependencies: [],
    subHints: [{
      id: 'slope3a-h1-s1',
      title: "Direction of slope",
      text: 'When you move along the line from point A to point B, from left to right (in the direction in which you read) is the line going up or down? Based on this, does this line have a positive or negative slope?',
      type: "hint",
      dependencies: []
    }, {
      id: 'slope3a-h1-s2',
      title: "Direction of negative slope",
      text: "If the line is going up, the slope of the line is positive. If it is going down, the slope is negative.",
      type: "hint",
      dependencies: ['slope3a-h1-s1']
    }, {
      id: 'slope3a-h1-s3',
      title: "Direction of positive slope",
      text: "In moving along the line from point A to B, you see that the line is going up. Therefore, the slope of the line is positive.",
      type: "hint",
      dependencies: ['slope3a-h1-s2']
    }],
  },
  {
    id: 'slope3a-h2',
    title: "Rise from A to B",
    text: "	Let's calculate the slope by finding the rise and dividing it by the run. How much is the rise for the line from point A to point B?",
    type: "scaffold",
    problemType: "TextBox",
    answerType: "numeric",
    hintAnswer: ["6"],
    dependencies: ['slope3a-h1'],
    subHints: [{
      id: 'slope3a-h2-s1',
      title: "Finding the rise of a line",
      text: 'The rise of a line is the change in y, or the amount the line "goes up" from point A to point B.',
      type: "hint",
      dependencies: []
    }, {
      id: 'slope3a-h2-s2',
      title: "Rise of this line",
      text: "The line goes up 6 units (squares) from point A to point B. Therefore, the rise of the line is 6.",
      type: "hint",
      dependencies: ['slope3a-h2-s1']
    }],
  },
  {
    id: 'slope3a-h3',
    title: "Run from A to B",
    text: "Now let's calcuate the run. How much is the run for the line from point A to point B?",
    type: "scaffold",
    problemType: "TextBox",
    answerType: "numeric",
    hintAnswer: ["4"],
    dependencies: ['slope3a-h2'],
    subHints: [{
      id: 'slope3a-h3-s1',
      title: "Finding the run of a line",
      text: 'The run of a line is the change in x, or the amount the line "goes over" from point A to point B.',
      type: "hint",
      dependencies: []
    }, {
      id: 'slope3a-h3-s2',
      title: "Run of this line",
      text: "The line goes over 4 units (squares) from point A to point B. Therefore, the run of the line is 4.",
      type: "hint",
      dependencies: ['slope3a-h3-s1']
    }],
  },
  {
    id: 'slope3a-h4',
    title: "Slope of A to B",
    text: "Now select the statement that best describes the slope of the line graphed above.",
    type: "scaffold",
    problemType: "MultipleChoice",
    choices: ["A: -6", "B: -2/3", "C: 3/2", "D: 4", "E: 0"],
    answerType: "string",
    hintAnswer: ["C: 3/2"],
    dependencies: ['slope3a-h3'],
    subHints: [{
      id: 'slope3a-h4-s1',
      title: "Finding the slope of a line",
      text: 'The slope of a line is the ratio of the rise/run. You know that the rise of the line from point A to B is 6 units and the run is 4 units. Therefore, what is the slope of the line?.',
      type: "hint",
      dependencies: []
    }, {
      id: 'slope3a-h4-s2',
      title: "Slope of this line",
      text: "To find the slope of the line you need to divide 6 by 4. You need to reduce this expression to get the final answer.",
      type: "hint",
      dependencies: ['slope3a-h4-s1']
    } , {
      id: 'slope3a-h4-s3',
      title: "Hint Answer",
      text: "6/4 can be reduced to 3/2. Select option C. The slope is 3/2",
      type: "hint",
      dependencies: ['slope3a-h4-s2']
    }],
  },
  {
    id: 'slope3a-h5',
    title: "Slope",
    text: "	Lastly, is the slope of the line between the points A and C also 3/2?",
    type: "scaffold",
    problemType: "MultipleChoice",
    choices: ["A: Yes", "B: No"],
    hintAnswer: ["A: Yes"],
    answerType: "string",
    dependencies: ['slope3a-h4'],
    subHints: [{
      id: 'slope3a-h5-s1',
      title: "Rise and run from A to C",
      text: 'First, find the slope of the line between points A and C using the steps demonstrated above. What is the rise of the line from point A to point C? What is the run of the line from point A to point C?',
      type: "hint",
      dependencies: []
    }, {
      id: 'slope3a-h5-s2',
      title: "Calculating the slope from A to C",
      text: "The rise of the line from point A to C is 3 units and the run is 2 units. Now to calculate the slope of the line, you need to find the ratio of rise/run so you need to divide 3 by 2.",
      type: "hint",
      dependencies: ['slope3a-h5-s1']
    }, {
      id: 'slope3a-h5-s3',
      title: "Hint Answer",
      text: "The slope of the line between points A and B is 3/2, and the slope of the line between A and C is also 3/2. Therefore, the slope of the line is the same between these points.",
      type: "hint",
      dependencies: ['slope3a-h5-s2']
    }],
  },
]

export { hints };