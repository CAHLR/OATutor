import React from 'react'; import { InlineMath } from 'react-katex';import hints from "./domain3a-index.js"; const step = {id: "domain3a", stepAnswer: ["all real numbers where $$x<2$$ or $$x>2$$"], problemType: "MultipleChoice", stepTitle: <div> <InlineMath math="f x=\frac{x+\left(1\right)}{\left(2\right)-x}"/></div>, stepBody: "", choices: ["all real numbers where x cannot be -1 or 2", "all real numbers where $$x<2$$ or $$x>2$$", "all real numbers", "all real numbers where x cannot be -1"], answerType: "string", hints: hints}; export {step};