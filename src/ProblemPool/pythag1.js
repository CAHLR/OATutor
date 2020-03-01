const problem = {
  id: 'pythag1', //Subparts will be in the form problem.id + 'a' and so on
  title: "Car Forces",
  body: "A car experiences three horizontal forces of -3.10N, 1.70N and -4.00N. It also experiences three vertical forces of -4.30N, 0.20N and 4.20N. Round all answers to the hundredths place.",
  parts: [
    {
      id: 'pythag1a',
      partTitle: "1. Vertical Component",
      partBody: "What is the net force, $\\sum F_y $, in the vertical direction?",
      partAnswer: "0.10",
      hints: [
        {
          title: "Net Force",
          text: "Forces in the same direction just add.",
          type: "hint"
        },
        {
          title: "Net Force Example",
          text: "What is the net vertical force if there are 2 vertical forces 2N, 3N?",
          hintAnswer: "5",
          type: "scaffold"
        }
      ]
    },
    {
      id: 'pythag1b',
      partTitle: "2. Horizontal Component",
      partBody: "What is the net force, $\\sum F_x $, in the horizontal direction?",
      partAnswer: "-5.40",
      hints: [
        {
          title: "Net Force",
          text: "Forces in the same direction just add.",
          type: "hint"
        }
      ]
    },
    {
      id: 'pythag1c',
      partTitle: "3. Net Force Magnitude",
      partBody: "What is the magnitude of the net force $\\sum F_{net}$ that the car experiences? ",
      partAnswer: "29.17",
      hints: [
        {
          title: "How to approach the problem",
          text: "How can you combine the net forces in each direction that you calculated in the previous parts? ",
          type: "hint"
        },
        {
          title: "Formula",
          text: "Use the Pythagorean Theorem, $a^2 + b^2 = c^2$, to calculate the resulting vector magnitude.",
          type: "hint",
        }
      ]
    },
    {
      id: 'pythag1d',
      partTitle: "4. Net Force Direction",
      partBody: "In what direction $\\theta_{net}$ (in degrees with respect to the x-axis) is the net force?",
      partAnswer: "-1.06",
      hints: [
        {
          title: "How to approach the problem",
          text: "How can you find the angle? Try drawing a triangle and using trigonometry",
          type: "hint"
        },
        {
          title: "Formula",
          text: "Use $\\theta = \\tan^{-1}(\\sum F_y /\\sum F_x )$",
          type: "hint",
        }
      ]
    }
  ]
};
export { problem };