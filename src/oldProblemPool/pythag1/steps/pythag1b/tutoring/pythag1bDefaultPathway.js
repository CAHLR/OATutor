var hints = [
  {
    id: 'pythag1b-h1',
    title: "Net Force",
    text: "Forces in the same direction just add.",
    type: "hint",
    dependencies: []
  },
  {
    id: 'pythag1b-h2',
    title: "Net Force Example",
    text: "What is the net horizontal force if there are 2 horizontal forces 2N, 3N?",
    hintAnswer: ["5"],
    problemType: "TextBox",
    answerType: "numeric",
    type: "scaffold",
    dependencies: ['pythag1b-h1']
  },
  {
    id: 'pythag1b-h3',
    title: "Solution",
    text: "The net force simply adds, so $\\sum F_x = -3.10N + 1.70 + -4.00 = -5.40$",
    type: "solution",
    dependencies: ['pythag1b-h2']
  }
]

export {hints};