import { checkAnswer } from './checkAnswer';
import WrongAnswerReasons from '../util/wrongAnswerReasons';

const rounded = (attempt, actual, precision) => checkAnswer({
    attempt,
    actual,
    answerType: "rounded",
    precision,
});

// asserts the reason checkAnswer gives, and that it accepted the answer exactly when reason is null
const expectResult = ([, correctAnswer, reason], expectedReason) => {
    expect(reason).toBe(expectedReason);
    if (expectedReason === null) {
        expect(correctAnswer).not.toBe(false);
    } else {
        expect(correctAnswer).toBe(false);
    }
};

describe('checkAnswer rounded', () => {
    it('accepts answers that match to the required significant figures', () => {
        ["9.8", "9.81", "9.807"].forEach(attempt => {
            const [, correctAnswer, reason] = rounded(attempt, ["$$9.81$$"], 2);
            expect(correctAnswer).toBe("$$9.81$$");
            expect(reason).toBeNull();
        });
    });

    it('flags the right value given to too few significant figures', () => {
        const [, correctAnswer, reason] = rounded("10", ["$$9.81$$"], 2);
        expect(correctAnswer).toBe(false);
        expect(reason).toBe(WrongAnswerReasons.notPreciseEnough);
    });

    it('rejects answers that differ within the required significant figures', () => {
        ["9.7", "9.9"].forEach(attempt => {
            const [, correctAnswer, reason] = rounded(attempt, ["$$9.81$$"], 2);
            expect(correctAnswer).toBe(false);
            expect(reason).toBe(WrongAnswerReasons.wrong);
        });
    });

    it('cannot process answers that are not numbers', () => {
        ["9.8m", "abc"].forEach(attempt => {
            const [, correctAnswer, reason] = rounded(attempt, ["$$9.81$$"], 2);
            expect(correctAnswer).toBe(false);
            expect(reason).toBe(WrongAnswerReasons.errored);
        });
    });

    it('accepts scientific notation, decimals, fractions and negatives', () => {
        expectResult(rounded("7.8\\cdot10^{-4}", ["$$7.84\\times10^{-4}$$"], 2), null);
        expectResult(rounded("0.00078", ["$$7.84\\times10^{-4}$$"], 2), null);
        expectResult(rounded("7.84\\times{10}^{-4}", ["$$0.000784$$"], 3), null);
        expectResult(rounded("\\frac{1}{3}", ["$$0.333$$"], 3), null);
        expectResult(rounded("-80", ["$$-80.4$$"], 2), null);
    });

    it('rejects the wrong sign', () => {
        expectResult(rounded("80", ["$$-80.4$$"], 2), WrongAnswerReasons.wrong);
    });

    it('flags too few figures for large numbers too', () => {
        expectResult(rounded("1000", ["$$1176$$"], 2), WrongAnswerReasons.notPreciseEnough);
        expectResult(rounded("1200", ["$$1176$$"], 2), null);
    });

    it('never flags notPreciseEnough at one significant figure', () => {
        expectResult(rounded("10", ["$$9.81$$"], 1), null);
        expectResult(rounded("20", ["$$9.81$$"], 1), WrongAnswerReasons.wrong);
    });

    it('accepts any of several step answers', () => {
        const [, correctAnswer] = rounded("2.5", ["$$9.81$$", "$$2.45$$"], 2);
        expect(correctAnswer).toBe("$$2.45$$");
    });

    it('defaults to 5 significant figures', () => {
        const check = attempt => checkAnswer({ attempt, actual: ["$$9.81$$"], answerType: "rounded" });
        expectResult(check("9.8100"), null);
        expectResult(check("9.8"), WrongAnswerReasons.notPreciseEnough);
    });

    it('reads a decimal comma only for Swedish', () => {
        localStorage.setItem("locale", "se");
        expectResult(rounded("9,8", ["$$9.81$$"], 2), null);
        localStorage.removeItem("locale");
        expectResult(rounded("9,8", ["$$9.81$$"], 2), WrongAnswerReasons.errored);
    });

    afterEach(() => localStorage.removeItem("locale"));
});

describe('checkAnswer other types still behave as before', () => {
    it('arithmetic', () => {
        expectResult(checkAnswer({ attempt: "2/4", actual: ["$$\\frac{1}{2}$$"], answerType: "arithmetic" }), null);
        expectResult(checkAnswer({ attempt: "0.49", actual: ["$$\\frac{1}{2}$$"], answerType: "arithmetic" }), WrongAnswerReasons.wrong);
    });

    it('string', () => {
        expectResult(checkAnswer({ attempt: "Paris", actual: ["Paris"], answerType: "string" }), null);
        expectResult(checkAnswer({ attempt: "London", actual: ["Paris"], answerType: "string" }), WrongAnswerReasons.wrong);
    });
});
