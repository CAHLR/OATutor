import React from 'react'; import { InlineMath } from 'react-katex';import hints from "./factor4a-index.js"; const step = {id: "factor4a", stepAnswer: ["(x-1)(x-6)"], problemType: "MultipleChoice", stepTitle: <div> <InlineMath math="x^2-\left(7\right) x+\left(6\right)"/></div>, stepBody: "", choices: ["(x-2)(x-3)", "(x+2)(x-3", "$$\\left(x+\\left(1\\right)\\right) \\left(x+\\left(6\\right)\\right)$$", "(x-1)(x-6)"], answerType: "string", hints: hints}; export {step};