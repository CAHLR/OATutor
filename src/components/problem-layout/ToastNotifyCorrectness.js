import { toast } from "react-toastify";
import WrongAnswerReasons from "../../util/wrongAnswerReasons";

export function toastNotifyCorrectness(isCorrect, reason, translate) {
    if (isCorrect) {
        toast.success(translate("toast.correct"), {
            autoClose: 3000
        })
    } else {
        if (reason === WrongAnswerReasons.wrong) {
            toast.error(translate("toast.incorrect"), {
                autoClose: 3000
            })
        } else if (reason === WrongAnswerReasons.sameAsProblem) {
            toast.error(translate("toast.simplify"), {
                autoClose: 3000
            })
        } else if (reason === WrongAnswerReasons.errored) {
            toast.error(translate("toast.cantProcess"), {
                autoClose: 3000
            })
        }
    }
}

export function toastNotifyCompletion(translate) {
    toast.info(translate("toast.stepComplete"), {
        autoClose: 3000
    })
}

export function toastNotifyEmpty(translate) {
    toast.info(translate("toast.provideAnswer"), {
        autoClose: 3000
    })
}
