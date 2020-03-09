const problem = {
  id: 'mul2',
  title: "Example Problem",
  body: "Long Multiplication",
  steps: [
    {
      id: 'mul2a',
      stepTitle: "1. Compute the following equation",
      stepBody: "23 x 12 = ",
      stepAnswer: "276",
      hints: [
        {
          title: "Step A",
          text: "What is 23 * 2?",
          type: "scaffold",
          hintAnswer: "46"
        },
        {
          title: "Step B",
          text: "What is 23 * 10?",
          type: "scaffold",
          hintAnswer: "230"
        },
        {
          title: "Putting it all together",
          text: "What is the sum of 46 + 230",
          type: "scaffold",
          hintAnswer: "276"
        }
      ]
    },
    {
      id: 'mul2b',
      stepTitle: "2. Compute the following equation",
      stepBody: "12 x 13 = ",
      stepAnswer: "156",
      hints: [
        {
          title: "Step A",
          text: "What is 12 * 3?",
          type: "scaffold",
          hintAnswer: "36"
        },
        {
          title: "Step B",
          text: "What is 12 * 10?",
          type: "scaffold",
          hintAnswer: "120"
        },
        {
          title: "Putting it all together",
          text: "What is the sum of 46 + 230",
          type: "scaffold",
          hintAnswer: "156"
        }
      ]
    },
    {
      id: 'mul2c',
      stepTitle: "3. Compute the following equation",
      stepBody: "103 x 7 = ",
      stepAnswer: "721",
      hints: [
        {
          title: "Step A",
          text: "What is 3 * 7?",
          type: "scaffold",
          hintAnswer: "21"
        },
        {
          title: "Step B",
          text: "What is 0 * 7?",
          type: "scaffold",
          hintAnswer: "0"
        },
        {
          title: "Step C",
          text: "What is 1 * 7?",
          type: "scaffold",
          hintAnswer: "7"
        }
      ]
    }
  ]
};

export { problem };