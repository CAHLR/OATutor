import {step as step1} from './steps/pythag2a.js'

const problem = {
  id: 'pythag2', //Substeps will be in the form problem.id + 'a' and so on
  title: "Alice and Bob on a Walk",
  body: "Alice and Bob go on a walk, but decide to split up. Alice walks 15 meters to the right. Bob turns an unknown number of degrees ($0 < \\theta < 90$) and walks 12 meters. After that, Bob turns 90 degrees towards Alice and walks $n$ meters to Alice.",
  steps: [
    step1,
  ]
};
export { problem };