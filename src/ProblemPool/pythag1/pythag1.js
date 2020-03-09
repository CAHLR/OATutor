import {step as step1} from './steps/pythag1a.js'
import {step as step2} from './steps/pythag1b.js'
import {step as step3} from './steps/pythag1c.js'
import {step as step4} from './steps/pythag1d.js'

const problem = {
  id: 'pythag1', //Substeps will be in the form problem.id + 'a' and so on
  title: "Car Forces",
  body: "A car experiences three horizontal forces of -3.10N, 1.70N and -4.00N. It also experiences three vertical forces of -4.30N, 0.20N and 4.20N. Round all answers to the hundredths place.",
  steps: [
    step1,
    step2,
    step3,
    step4
  ]
};
export { problem };