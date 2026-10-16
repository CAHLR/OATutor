import {
    LAST_VISITED_KEY,
    courseNameForMetaLesson,
    getLastVisited,
    lessonStatus,
    recordLastVisited,
    resolveResume,
} from "./lastVisited";

const lesson = (id, kcs, extra = {}) => ({
    id,
    name: `Lesson ${id}`,
    learningObjectives: Object.fromEntries(kcs.map((kc) => [kc, 0.85])),
    ...extra,
});

const course = (courseName, lessons, metaLessons) => ({ courseName, lessons, metaLessons });
const bkt = (entries) => Object.fromEntries(Object.entries(entries).map(([kc, m]) => [kc, { probMastery: m }]));
const visits = (...list) => ({ byCourse: Object.fromEntries(list.map((v) => [v.courseName, v])) });

const memoryStorage = () => {
    const store = {};
    return {
        store,
        getByKey: async (key) => store[key],
        setByKey: async (key, value) => {
            store[key] = value;
        },
    };
};

describe("lessonStatus", () => {
    test("mastered at the lesson's threshold, in progress above the prior, else not started", () => {
        const l = lesson("a", ["k1", "k2"]);
        expect(lessonStatus(l, bkt({ k1: 0.9, k2: 0.85 }))).toBe("mastered");
        expect(lessonStatus(l, bkt({ k1: 0.5, k2: 0.3 }))).toBe("in-progress");
        expect(lessonStatus(l, bkt({ k1: 0.1, k2: 0.1 }))).toBe("not-started");
        expect(lessonStatus(l, {})).toBe("not-started");
    });
});

describe("resolveResume", () => {
    const stats = course("Stats", [lesson("s1", ["a"]), lesson("s2", ["b"]), lesson("s3", ["c"])]);
    const data8 = course("Data 8", [lesson("d1", ["x"]), lesson("d2", ["y"])]);
    const plans = [stats, data8];

    test("nothing visited means no card", () => {
        expect(resolveResume(null, plans, {})).toBeNull();
        expect(resolveResume({ byCourse: {} }, plans, {})).toBeNull();
    });

    test("resumes the most recent visit while its lesson isn't mastered", () => {
        const result = resolveResume(
            visits({ courseName: "Stats", lessonId: "s2", at: 1 }, { courseName: "Data 8", lessonId: "d1", at: 2 }),
            plans,
            bkt({ b: 0.4, x: 0.4 })
        );
        expect(result).toMatchObject({ kind: "resume", courseIndex: 1, lesson: { id: "d1" } });
    });

    test("a mastered lesson points to the next unmastered one in that course", () => {
        const result = resolveResume(
            visits({ courseName: "Stats", lessonId: "s1", at: 5 }),
            plans,
            bkt({ a: 0.95, b: 0.95 })
        );
        expect(result).toMatchObject({ kind: "up-next", lesson: { id: "s3" }, finished: { id: "s1" } });
    });

    test("a finished course falls through to the next most recent visit", () => {
        const result = resolveResume(
            visits({ courseName: "Data 8", lessonId: "d2", at: 9 }, { courseName: "Stats", lessonId: "s1", at: 3 }),
            plans,
            bkt({ y: 0.95 })
        );
        expect(result).toMatchObject({ kind: "resume", course: { courseName: "Stats" }, lesson: { id: "s1" } });
    });

    test("skips A/B variants and office hours when looking for the next lesson", () => {
        const withHidden = course(
            "Data 100",
            [
                lesson("l1", ["p"]),
                lesson("variantA", ["q"]),
                lesson("office", [], { chat_display_mode: "Full" }),
                lesson("l2", ["r"]),
            ],
            [{ id: "meta1", name: "Meta", lessons: ["variantA"] }]
        );
        const result = resolveResume(
            visits({ courseName: "Data 100", lessonId: "l1", at: 1 }),
            [withHidden],
            bkt({ p: 0.95 })
        );
        expect(result).toMatchObject({ kind: "up-next", lesson: { id: "l2" } });
    });

    test("resumes a meta-lesson as is", () => {
        const withMeta = course("Data 100", [lesson("l1", ["p"])], [{ id: "meta1", name: "Meta" }]);
        const result = resolveResume(visits({ courseName: "Data 100", lessonId: "meta1", at: 1 }), [withMeta], {});
        expect(result).toMatchObject({ kind: "resume", lesson: { id: "meta1" } });
        expect(courseNameForMetaLesson([withMeta], "meta1")).toBe("Data 100");
    });

    test("ignores visits to courses or lessons that no longer exist", () => {
        expect(resolveResume(visits({ courseName: "Gone", lessonId: "s1", at: 1 }), plans, {})).toBeNull();
        expect(resolveResume(visits({ courseName: "Stats", lessonId: "gone", at: 1 }), plans, {})).toBeNull();
    });
});

describe("recordLastVisited", () => {
    test("keeps one visit per course, newest wins", async () => {
        const storage = memoryStorage();
        await recordLastVisited(storage, { courseName: "Stats", lessonId: "s1" });
        await recordLastVisited(storage, { courseName: "Data 8", lessonId: "d1" });
        await recordLastVisited(storage, { courseName: "Stats", lessonId: "s2" });
        const saved = await getLastVisited(storage);
        expect(Object.keys(saved.byCourse)).toEqual(["Stats", "Data 8"]);
        expect(saved.byCourse.Stats.lessonId).toBe("s2");
        expect(LAST_VISITED_KEY in storage.store).toBe(true);
    });

    test("ignores incomplete entries and missing storage", async () => {
        const storage = memoryStorage();
        await recordLastVisited(storage, { courseName: "Stats" });
        await recordLastVisited(null, { courseName: "Stats", lessonId: "s1" });
        expect(await getLastVisited(storage)).toBeNull();
    });
});
