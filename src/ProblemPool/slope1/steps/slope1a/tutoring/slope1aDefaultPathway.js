var hints = [
  {
    id: 'slope1a-h1',
    title: "Slope",
    text: "The slope of a line measures the steepness of the line.",
    type: "hint",
    dependencies: []
  },
  {
    id: 'slope1a-h2',
    title: "Positive Slope ",
    text: "When a line has a positive slope it goes up left to right. Which graph has a line that goes up from left to right?",
    type: "hint",
    dependencies: ['slope1a-h1']
  },
  {
    id: 'slope1a-h3',
    title: "Zero Slope Example",
    text: "This graph shows a line with no steepness. It has a zero slope. \n##zero_slope.gif##",
    type: "hint",
    dependencies: ['slope1a-h2']
  },
  {
    id: 'slope1a-h4',
    title: "Negative Slope Example",
    text: "This graph shows a line that goes down from left to right. It has a negative slope. \n##neg_slope.gif##",
    type: "hint",
    dependencies: ['slope1a-h2']
  },
  {
    id: 'slope1a-h5',
    title: "Undefined Slope Example",
    text: "This graph shows a line that goes straight up. Its slope is undefined\n##undef_slope.gif##",
    type: "hint",
    dependencies: ['slope1a-h2']
  },
  {
    id: 'slope1a-h6',
    title: "Positive Slope Example",
    text: "This graph shows a line that goes up from left to right. It has a positive slope. \n##pos_slope.gif##",
    type: "hint",
    dependencies: ['slope1a-h2']
  },
  {
    id: 'slope1a-h7',
    title: "Solution",
    text: "Graph A contains a line that goes up from left to right",
    type: "solution",
    dependencies: ['slope1a-h3', 'slope1a-h4', 'slope1a-h5', 'slope1a-h6']
  }
]

export {hints};