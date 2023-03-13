const { Enumify } = require("./enumify");

class ToastID extends Enumify {
    static expired_session = new ToastID();
    static not_authorized = new ToastID();

    static set_lesson_unknown_error = new ToastID();
    static set_lesson_duplicate_error = new ToastID();

    static set_lesson_success = new ToastID();

    static submit_grade_unknown_error = new ToastID();
    static submit_grade_link_lost = new ToastID();
    static submit_grade_unable = new ToastID();

    static warn_not_from_canvas = new ToastID();

    static successfully_completed_lesson = new ToastID();

    // noinspection JSVoidFunctionReturnValueUsed
    /**
     * @private
     */
    static _ = this.closeEnum();
}

export default ToastID
