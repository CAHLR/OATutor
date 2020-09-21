var hints = [
    {
      id: 'circle2a-h1',
      title: "Area of a circle",
      text: "Recall that the area of a circle is $A = \\pi r^2$",
      type: "hint",
      dependencies: []
    },
    {
      id: 'circle2a-h2',
      title: "Solution",
      text: "Rearranging the formula above, we get $r = \\sqrt{\\frac{A}{\\pi}} = 20$",
      type: "solution",
      dependencies: ['circle2a-h1']
    }
]

export {hints};