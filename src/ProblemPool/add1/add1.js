const problem = {
  id: 'add1', //Substeps will be in the form problem.id + 'a' and so on
  title: "Example Problem",
  body: "Long Addition",
  steps: [
    {
      id: 'add1a',
      stepTitle: "1. Compute the following equation",
      stepBody: "123 + 321 = ",
      stepAnswer: "444",
      hints: [
        {
          title: "Carries",
          text: "There are no carries for this problem :)",
          type: "hint"
        },
        {
          title: "Easier example",
          text: "What is 123 + 300?",
          type: "scaffold",
          hintAnswer: "423"
        }
      ]
    },
    {
      id: 'add1b',
      stepTitle: "2. Compute the following equation",
      stepBody: "4532 + 34 = ",
      stepAnswer: "4566",
      hints: [
        {
          title: "Carries",
          text: "There are no carries for this problem :)",
          type: "hint"
        },
        {
          title: "Easier example",
          text: "What is 4532 + 30?",
          type: "scaffold",
          hintAnswer: "4562"
        }
      ]
    },
    {
      id: 'add1c',
      stepTitle: "3. Compute the following equation",
      stepBody: "275 + 275 = ",
      stepAnswer: "550",
      hints: [
        {
          title: "Carries",
          text: "There are 2 carries for this problem. Be careful!",
          type: "hint"
        },
        {
          title: "Easier example",
          text: "What is 275 + 200?",
          type: "scaffold",
          hintAnswer: "475"
        }
      ]
    }
  ]
};
export { problem };