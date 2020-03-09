const step = {
  id: 'pythag1a',
  stepTitle: "1. Vertical Component",
  stepBody: "What is the net force, $\\sum F_y $, in the vertical direction?",
  stepAnswer: ["0.10"],
  answerType: "algebra",
  hints: [
    {
      id: 'pythag1a-h1',
      title: "Net Force",
      text: "Forces in the same direction just add.",
      type: "hint"
    },
    {
      id: 'pythag1a-h2',
      title: "Net Force Example",
      text: "What is the net vertical force if there are 2 vertical forces 2N, 3N?",
      hintAnswer: "5",
      type: "scaffold"
    },
    {
      id: 'pythag1a-h3',
      title: "Solution",
      text: "The net force simply adds, so $\\sum F_y = -4.30 + 0.20 + 4.20 = 0.10N$",
      type: "solution"
    }
  ]
}

export { step };