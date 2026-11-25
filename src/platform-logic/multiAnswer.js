import { checkAnswer } from "./checkAnswer";

// A combined field is deliberately limited to a number followed by a unit.
// Other answer combinations use separate fields.
const NUMBER_AND_UNIT = /^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)\s*([A-Za-zµμ°%Ω](?:.*\S)?)\s*$/iu;

export function splitCombinedAnswer(value) {
    if (typeof value !== "string" || value.trim() === "" ||
        Number.isFinite(Number(value.trim()))) {
        return null;
    }
    const match = value.match(NUMBER_AND_UNIT);
    return match ? [match[1], match[2]] : null;
}

const hasAnswerText = (value) => typeof value === "string" && value.trim() !== "";

export function hasCompleteMultiAnswer(value, { layout, parts }) {
    if (!Array.isArray(parts)) return false;
    if (layout === "combined") {
        return parts.length === 2 && hasAnswerText(value);
    }
    return layout === "sideBySide" && parts.length >= 2 &&
        Array.isArray(value) && value.length === parts.length &&
        parts.every((_, index) => hasAnswerText(value[index]));
}

export function checkMultiAnswer({ value, multiAnswer, variabilization = {}, questionText = "" }) {
    const { layout, parts } = multiAnswer;
    const attempts = layout === "combined" ? splitCombinedAnswer(value) : value;
    if (!hasCompleteMultiAnswer(value, multiAnswer) || attempts === null) {
        return { valid: false, isCorrect: false, results: [], attempts: null };
    }

    const results = parts.map((part, index) => {
        const [parsed, correct, reason] = checkAnswer({
            attempt: attempts[index],
            actual: part.answers,
            answerType: part.answerType,
            variabilization,
            questionText,
        });
        return { label: part.label, attempt: attempts[index], parsed, isCorrect: !!correct, reason };
    });
    return {
        valid: true,
        isCorrect: results.every((result) => result.isCorrect),
        results,
        attempts,
    };
}
