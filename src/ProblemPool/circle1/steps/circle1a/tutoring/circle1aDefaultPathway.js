var hints = [
    {
      id: 'circle1a-h1',
      title: "Size of the room",
      text: "Consider the shape of the room and the limitations this has on the radius of the rug.",
      type: "hint",
      dependencies: []
    },
    {
      id: 'circle1a-h2',
      title: "Constricting dimension",
      text: "The length (20ft) creates limitations on the size of the circle. What is the maximum diameter that the circle can be?",
      hintAnswer: ["20"],
      problemType: "TextBox",
      answerType: "numeric",
      type: "scaffold",
      dependencies: [0]
    },
    {
      id: 'circle1a-h3',
      title: "Solution",
      text: "Recall that the radius is half the diameter, so $r = \\frac{d}{2} = 10$",
      type: "solution",
      dependencies: [1]
    }
]

export {hints};