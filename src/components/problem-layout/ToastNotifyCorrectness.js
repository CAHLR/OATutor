import { toast } from "react-toastify";
import WrongAnswerReasons from "../../util/wrongAnswerReasons";

export function toastNotifyCorrectness(isCorrect, reason) {
    if (isCorrect) {
        toast.success("Correct Answer!", {
            autoClose: 3000
        })
    } else {
        if (reason === WrongAnswerReasons.wrong) {
            toast.error("Incorrect Answer!", {
                autoClose: 3000
            })
        } else if (reason === WrongAnswerReasons.sameAsProblem) {
            toast.error("Please simplify!", {
                autoClose: 3000
            })
        } else if (reason === WrongAnswerReasons.errored) {
            toast.error("Our system could not process that answer", {
                autoClose: 3000
            })
        }
    }
}

export function toastNotifyCompletion() {
    toast.info("Step Completed!", {
        autoClose: 3000
    })
}
