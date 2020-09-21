import hints from './pythag1a-index.js';
import React from 'react';
import { InlineMath } from 'react-katex';

const step = {
  id: 'pythag1a',
  stepTitle: "1. Vertical Component",
  stepBody: <div>
    What is the net force <InlineMath math={"\\sum F_y "} />, in the vertical direction?
  </div>,
  stepAnswer: ["0.10"],
  units: "$\\text{N}$",
  problemType: "TextBox",
  answerType: "algebra",
  hints: hints
}

export { step };