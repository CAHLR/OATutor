const { Enumify } = require("./enumify");

class WrongAnswerReasons extends Enumify {
    static wrong = new WrongAnswerReasons();
    static sameAsProblem = new WrongAnswerReasons();

    static errored = new WrongAnswerReasons();

    static _ = this.closeEnum();
}

export default WrongAnswerReasons
