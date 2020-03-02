import {part as part1} from './parts/part1.js'
import {part as part2} from './parts/part2.js'
import {part as part3} from './parts/part3.js'
import {part as part4} from './parts/part4.js'

const problem = {
  id: 'pythag1', //Subparts will be in the form problem.id + 'a' and so on
  title: "Car Forces",
  body: "A car experiences three horizontal forces of -3.10N, 1.70N and -4.00N. It also experiences three vertical forces of -4.30N, 0.20N and 4.20N. Round all answers to the hundredths place.",
  parts: [
    part1,
    part2,
    part3,
    part4
  ]
};
export { problem };