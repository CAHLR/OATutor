const problem = {
  id: 'mul2',
  title: "Example Problem",
  body: "Long Multiplication",
  parts: [
    {
      id: 'mul2a',
      partTitle: "1. Compute the following equation",
      partBody: "23 x 12 = ",
      partAnswer: "276",
      hints: [
        {
          title: "Part A",
          text: "What is 23 * 2?",
          type: "scaffold",
          hintAnswer: "46"
        },
        {
          title: "Part B",
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
      partTitle: "2. Compute the following equation",
      partBody: "12 x 13 = ",
      partAnswer: "156",
      hints: [
        {
          title: "Part A",
          text: "What is 12 * 3?",
          type: "scaffold",
          hintAnswer: "36"
        },
        {
          title: "Part B",
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
      partTitle: "3. Compute the following equation",
      partBody: "103 x 7 = ",
      partAnswer: "721",
      hints: [
        {
          title: "Part A",
          text: "What is 3 * 7?",
          type: "scaffold",
          hintAnswer: "21"
        },
        {
          title: "Part B",
          text: "What is 0 * 7?",
          type: "scaffold",
          hintAnswer: "0"
        },
        {
          title: "Part C",
          text: "What is 1 * 7?",
          type: "scaffold",
          hintAnswer: "7"
        }
      ]
    }
  ]
};

export { problem };