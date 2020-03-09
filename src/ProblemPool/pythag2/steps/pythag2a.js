const step = {
  id: 'pythag2a',
  stepTitle: "How long is Bob's final walk?",
  stepBody: "Express your answer in meters.",
  stepAnswer: ["9"],
  answerType: "algebra",
  hints: [
    {
      id: 'pythag2a-h1',
      title: "Visualizing the scenario.",
      text: "Draw out a diagram of Alice and Bob's walk. What shape does it form?",
      type: "hint"
    },
    {
      id: 'pythag1c-h2',
      title: "Formula",
      text: "Use the Pythagorean Theorem, $a^2 + b^2 = c^2$, to calculate the side of the triangle with unknown length.",
      type: "hint",
    },
    {
      id: 'pythag1a-h3',
      title: "Solution",
      text: "Alice and Bob's walking paths form a right triangle. We can use the Pythagorean Theorem using $b = 12, c = 15$, solving for $a$. $a^2 = c^2 - b^2 \\implies a = \\sqrt{c^2 -b^2} = \\sqrt{225 - 144} = \\sqrt{81} = 9$",
      type: "solution"
    }
  ]
}

export { step };