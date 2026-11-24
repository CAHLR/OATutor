import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-dom/test-utils";
import MultiAnswerInput from "./MultiAnswerInput";

const parts = [
    { label: "Value", answerType: "arithmetic", answers: ["12"] },
    { label: "Unit", answerType: "string", answers: ["cm"] },
];

describe.each(["combined", "sideBySide"])("%s input", (layout) => {
    let container;
    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });
    afterEach(() => {
        ReactDOM.unmountComponentAtNode(container);
        container.remove();
    });

    it("renders the expected number of labeled fields", () => {
        ReactDOM.render(<MultiAnswerInput index={0} multiAnswer={{ layout, parts }}
            value={layout === "combined" ? "" : ["", ""]} onChange={() => {}} />, container);
        const fields = container.querySelectorAll("input");
        expect(fields).toHaveLength(layout === "combined" ? 1 : 2);
        expect(fields[0].getAttribute("aria-label")).toBe(layout === "combined"
            ? "Answer with value and unit" : "Value");
    });

    it("reports edits without losing the other field", () => {
        const onChange = jest.fn();
        ReactDOM.render(<MultiAnswerInput index={0} multiAnswer={{ layout, parts }}
            value={layout === "combined" ? "12 " : ["12", ""]} onChange={onChange} />, container);
        const field = container.querySelectorAll("input")[layout === "combined" ? 0 : 1];
        TestUtils.Simulate.change(field, { target: { value: layout === "combined" ? "12 cm" : "cm" } });
        expect(onChange).toHaveBeenCalledWith(layout === "combined" ? "12 cm" : ["12", "cm"]);
    });
});

it("allows a student to fill the third field first without losing the other fields", () => {
    const container = document.createElement("div");
    const onChange = jest.fn();
    const multiAnswer = { layout: "sideBySide", parts: [
        ...parts, { label: "Direction", answerType: "string", answers: ["east"] },
    ] };

    try {
        ReactDOM.render(<MultiAnswerInput index={0} multiAnswer={multiAnswer}
            value="" onChange={onChange} />, container);
        const fields = container.querySelectorAll("input");
        expect(fields).toHaveLength(3);
        expect(fields[2].getAttribute("aria-label")).toBe("Direction");
        TestUtils.Simulate.change(fields[2], { target: { value: "east" } });
        expect(onChange).toHaveBeenLastCalledWith(["", "", "east"]);
    } finally {
        ReactDOM.unmountComponentAtNode(container);
    }
});
