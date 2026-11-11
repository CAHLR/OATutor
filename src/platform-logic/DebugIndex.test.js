import { buildDebugDirectory } from "./DebugIndex.js";

describe("buildDebugDirectory", () => {
    it("lists only problems that belong to configured lessons", () => {
        const plans = [{
            courseName: "Course A",
            lessons: [{
                id: "lesson-a",
                name: "Lesson A",
                learningObjectives: { data_types: 0.85 },
            }],
        }];
        const pool = [
            { id: "problem-b", courseName: "Course A", lessonId: "lesson-a", title: "Beta", steps: [{}] },
            { id: "problem-a", courseName: "Course A", lessonId: "lesson-a", title: "Alpha", steps: [{}, {}] },
            { id: "other", courseName: "Course A", lessonId: "missing-lesson", title: "Other", steps: [] },
        ];

        expect(buildDebugDirectory(plans, pool)).toEqual([{
            course: "Course A",
            lessons: [{
                id: "lesson-a",
                name: "Lesson A",
                topic: "Data Types",
                problems: [
                    { id: "problem-a", title: "Alpha", steps: 2 },
                    { id: "problem-b", title: "Beta", steps: 1 },
                ],
            }],
        }]);
    });
});
