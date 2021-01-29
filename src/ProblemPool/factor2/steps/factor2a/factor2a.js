import React from 'react'; import { InlineMath } from 'react-katex';import hints from "./factor2a-index.js"; const step = {id: "factor2a", stepAnswer: ["$$\\left(x+\\left(6\\right)\\right) \\left(b^2-a\\right)$$"], problemType: "MultipleChoice", stepTitle: <div> <InlineMath math="x \left(b^2-a\right)+\left(6\right) \left(b^2-a\right)"/></div>, stepBody: "", choices: ["$$\\left(x+\\left(6\\right)\\right) \\left(b^2-a\\right)$$", "$$x \\left(b^2-a\\right)$$", "$$\\left(6\\right) \\left(b^2-a\\right)$$", "$$b^2 \\left(x+\\left(6\\right)\\right)$$"], answerType: "string", hints: hints}; export {step};