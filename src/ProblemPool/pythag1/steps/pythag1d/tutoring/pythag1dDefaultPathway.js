var hints = [
  {
    id: 'pythag1d-h1',
    title: "How to approach the problem",
    text: "How can you find the angle? Try drawing a triangle and using trigonometry",
    type: "hint",
    dependencies: []
  },
  {
    id: 'pythag1d-h2',
    title: "Formula",
    text: "Use $\\theta = \\tan^{-1}(\\sum F_y /\\sum F_x )$",
    type: "hint",
    dependencies: ['pythag1d-h1']
  },
  {
    id: 'pythag1d-h3',
    title: "Solution",
    text: "Using the formula and previous steps, we get $\\theta = \\tan^{-1}(\\sum F_y /\\sum F_x ) = \\tan^{-1}(-5.40 / 0.10) = -1.06$",
    type: "solution",
    dependencies: ['pythag1d-h1', 'pythag1d-h2']
  }
]

export {hints};