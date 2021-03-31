import hints from "./real11a-index.js";
const step = {
    id: "real11a",
    stepAnswer: ["@{ans11a}"],
    //stepAnswer: ["2@{r}@{r}pi + 2@{r}@{h}pi"],
    problemType: "TextBox",
    //stepTitle: "Find the surface area of a cylinder with radius 6 in. and height 9 in. Leave the answer in terms of π.",
    stepTitle: "@{person} wants to find the surface area of a cylinder with radius @{r} in. and height @{h} in. Leave the answer in terms of π.",
    stepBody: "",
    answerType: "arithmetic",
    hints: hints,
    variabilization: {
        r: [1, 2, 3, 4, 5],
        h: [6, 7, 8, 9, 10],
        ans11a: ["14pi", "36pi", "66pi", "104pi", "150pi"]
    }
};

export {step};