const problem = {
    id: 'add1', //Subparts will be in the form problem.id + 'a' and so on
    title: "Example Problem",
    prompt: "Long Addition",
    parts: [
        {
            partTitle: "1. Compute the following equation",
            partBody: "123 + 321 = ",
            partAnswer: "444",
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
            partTitle: "2. Compute the following equation",
            partBody: "4532 + 34 = ",
            partAnswer: "4566",
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
            partTitle: "3. Compute the following equation",
            partBody: "275 + 275 = ",
            partAnswer: "550",
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