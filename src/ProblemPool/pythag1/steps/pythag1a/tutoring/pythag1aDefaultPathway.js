var hints = [
    {
      id: 'pythag1a-h1',
      title: "Net Force",
      text: "Forces in the same direction just add.",
      type: "hint",
      dependencies: []
    },
    {
      id: 'pythag1a-h2',
      title: "Net Force Example",
      text: "What is the net vertical force if there are 2 vertical forces 2N, 3N?",
      hintAnswer: ["5"],
      problemType: "MultipleChoice",
      choices: ["-5", "0", "2", "5"],
      answerType: "string",
      type: "scaffold",
      dependencies: [], 
      subHints: [{
        id: 'pythag1a-h2-s1',
        title: "Simple Net Force",
        text: "What is the net vertical force if there are 2 vertical forces 1N, 2N?",
        hintAnswer: ["3"],
        problemType: "TextBox",
        answerType: "numeric",
        type: "scaffold",
        dependencies: []
      }],
    },
    {
      id: 'pythag1a-h3',
      title: "Solution",
      text: "The net force simply adds, so $\\sum F_y = -4.30 + 0.20 + 4.20 = 0.10N$",
      type: "solution",
      dependencies: [0, 1]
    }
]

export {hints};