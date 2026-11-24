import { checkMultiAnswer, hasCompleteMultiAnswer, splitCombinedAnswer } from "./multiAnswer";

const parts = [
    { label: "Value", answerType: "arithmetic", answers: ["12"] },
    { label: "Unit", answerType: "unit", answers: ["cm"] },
];

describe.each(["combined", "sideBySide"])("%s multi-answer layout", (layout) => {
    const answer = (value, unit) => layout === "combined" ? `${value} ${unit}` : [value, unit];
    const check = (value, unit) => checkMultiAnswer({
        value: answer(value, unit), multiAnswer: { layout, parts },
    });

    it.each([
        ["12", "cm", [true, true], true],
        ["12", "mm", [true, false], false],
        ["13", "cm", [false, true], false],
        ["13", "mm", [false, false], false],
    ])("grades %s %s as a whole while preserving feedback for each part", (value, unit, feedback, isCorrect) => {
        const result = check(value, unit);
        expect(result.results.map(part => part.isCorrect)).toEqual(feedback);
        expect(result.isCorrect).toBe(isCorrect);
    });

    it.each([
        ["13.4", "M/S", [true, true]],
        ["13.4", "km/h", [true, false]],
        ["48.24", "km/h", [false, false]],
    ])("grades %s %s against 13.4 m/s without unit conversion", (value, unit, feedback) => {
        const result = checkMultiAnswer({
            value: answer(value, unit),
            multiAnswer: { layout, parts: [
                { ...parts[0], answers: ["13.4"] },
                { ...parts[1], answers: ["m/s"] },
            ] },
        });
        expect(result.results.map(part => part.isCorrect)).toEqual(feedback);
        expect(result.isCorrect).toBe(feedback.every(Boolean));
    });
});

it("parses a number and unit, including decimals and signs", () => {
    expect(splitCombinedAnswer(" -12.5cm ")).toEqual(["-12.5", "cm"]);
    expect(splitCombinedAnswer("12")).toBeNull();
    expect(splitCombinedAnswer("12.5")).toBeNull();
    expect(splitCombinedAnswer("12e3")).toBeNull();
    expect(splitCombinedAnswer("12 34")).toBeNull();
    expect(splitCombinedAnswer("cm")).toBeNull();
    expect(splitCombinedAnswer("12 ω")).toEqual(["12", "ω"]);
});

it("requires both side-by-side fields before grading", () => {
    const multiAnswer = { layout: "sideBySide", parts };
    expect(hasCompleteMultiAnswer(["12", ""], multiAnswer)).toBe(false);
    expect(hasCompleteMultiAnswer(["12", "cm"], multiAnswer)).toBe(true);
    expect(checkMultiAnswer({ value: ["12", ""], multiAnswer }).valid).toBe(false);
});

describe("three side-by-side fields", () => {
    const multiAnswer = { layout: "sideBySide", parts: [
        ...parts, { label: "Direction", answerType: "string", answers: ["east"] },
    ] };

    it("requires answers for all three parts before grading", () => {
        expect(hasCompleteMultiAnswer(["12", "cm"], multiAnswer)).toBe(false);
        expect(hasCompleteMultiAnswer(["12", "cm", " "], multiAnswer)).toBe(false);
        expect(checkMultiAnswer({ value: ["12", "cm"], multiAnswer }).valid).toBe(false);
    });

    it.each([["east", true], ["west", false]])(
        "grades the whole answer with %s as the third part", (direction, isCorrect) => {
            const value = ["12", "CM", direction];
            expect(hasCompleteMultiAnswer(value, multiAnswer)).toBe(true);
            const result = checkMultiAnswer({ value, multiAnswer });
            expect(result.valid).toBe(true);
            expect(result.results.map(part => part.isCorrect)).toEqual([true, true, isCorrect]);
            expect(result.isCorrect).toBe(isCorrect);
        }
    );

    it("does not accept a combined-field configuration with three parts", () => {
        expect(checkMultiAnswer({ value: "12 cm",
            multiAnswer: { ...multiAnswer, layout: "combined" } }).valid).toBe(false);
    });
});

it.each([
    ["make_array()", true],
    ["MAKE_ARRAY()", false],
])("keeps the ordinary Disc6 string answer %s case-sensitive", (attempt, isCorrect) => {
    const result = checkMultiAnswer({
        value: ["10000", attempt],
        multiAnswer: { layout: "sideBySide", parts: [
            { label: "Blank 1", answerType: "arithmetic", answers: ["10000"] },
            { label: "Blank 2", answerType: "string", answers: ["make_array()"] },
        ] },
    });
    expect(result.isCorrect).toBe(isCorrect);
});
