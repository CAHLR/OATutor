var hints = [
  {
    id: 'circle2b-h1',
    title: "How to approach the problem",
    text: "What quantity/measurement are you looking for?",
    type: "hint",
    dependencies: []
  },
  {
    id: 'circle2b-h2',
    title: "Circumference of a circle",
    text: "Recall that the circumference of a circle is $C = 2\\pi r$",
    type: "hint",
    dependencies: ['circle2b-h1']
  },
  {
    id: 'circle2b-h3',
    title: "Solution",
    text: "Using the previous part and formula above, we get $C = 2\\pi r = 2 \\pi (20) \\approx 125.6$",
    type: "solution",
    dependencies: ['circle2b-h2']
  }
]

export {hints};