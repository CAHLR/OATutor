import React, { useMemo, useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import BrandLogoNav from "@components/BrandLogoNav";

// This is an intentionally small visual prototype. In production, Tooling can
// generate this metadata alongside each Debug Link from the source sheet.
const sampleCatalog = [
    {
        course: "Data 8 Discussion Worksheets",
        lessons: [
            {
                id: "7Odjp3Xo-WDyk-UDcQuiclaW",
                name: "Lesson Disc3",
                topic: "Data types and visualizations",
                problems: [
                    { id: "ace4be0A1-diag-P05", title: "Polynomial expansion: Find A", steps: 4 },
                    { id: "ace918bnlaws10", title: "Data table selection", steps: 1 },
                ],
            },
            {
                id: "0dJYDToW-hati-SjwIXGncTg",
                name: "Lesson Disc4",
                topic: "Visualizations",
                problems: [
                    { id: "ace788cLimitLaw5", title: "Limit laws", steps: 2 },
                ],
            },
        ],
    },
    {
        course: "OpenStax Statistics",
        lessons: [
            {
                id: "statistics-hypothesis-testing",
                name: "Hypothesis Testing",
                topic: "Null hypotheses",
                problems: [
                    { id: "acd9137measure33", title: "Calculate null hypothesis", steps: 1 },
                    { id: "statistics-pvalue-01", title: "Interpret a p-value", steps: 3 },
                ],
            },
        ],
    },
];

const allProblems = sampleCatalog.flatMap((course) =>
    course.lessons.flatMap((lesson) =>
        lesson.problems.map((problem) => ({ ...problem, course: course.course, lesson }))
    )
);

export default function DebugIndex({ history }) {
    const [selectedLessonId, setSelectedLessonId] = useState("all");
    const [query, setQuery] = useState("");

    const problems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return allProblems.filter((problem) => {
            const matchesLesson = selectedLessonId === "all" || problem.lesson.id === selectedLessonId;
            const matchesQuery = !normalizedQuery || [problem.id, problem.title, problem.lesson.name, problem.lesson.topic]
                .some((value) => value.toLowerCase().includes(normalizedQuery));
            return matchesLesson && matchesQuery;
        });
    }, [selectedLessonId, query]);

    return (
        <div style={{ minHeight: "100vh", background: "#F7FAFC", color: "#243B53" }}>
            <header style={{ height: 64, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", boxShadow: "0 1px 3px rgba(16,24,40,0.12)" }}>
                <BrandLogoNav noLink />
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.2 }}>Content QA</div>
                <Button color="primary" variant="outlined" onClick={() => history.push("/")}>Exit QA</Button>
            </header>

            <div style={{ background: "#243B53", color: "#F8FAFC", padding: "22px 32px" }}>
                <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
                    <div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>Debug Index</div>
                    </div>
                    <div style={{ border: "1px solid #78909C", color: "#E2E8F0", borderRadius: 14, padding: "5px 10px", fontSize: 12, fontWeight: 700 }}>PROTOTYPE</div>
                </div>
            </div>

            <main style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 32px", display: "grid", gridTemplateColumns: "280px minmax(0, 1fr)", gap: 24 }}>
                <aside style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, height: "fit-content", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}>
                    <div style={{ fontSize: 13, color: "#718096", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 10 }}>Content directory</div>
                    <button type="button" onClick={() => setSelectedLessonId("all")} style={navStyle(selectedLessonId === "all")}>All debug problems <span>{allProblems.length}</span></button>
                    {sampleCatalog.map((course) => (
                        <div key={course.course} style={{ marginTop: 18 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{course.course}</div>
                            {course.lessons.map((lesson) => (
                                <button key={lesson.id} type="button" onClick={() => setSelectedLessonId(lesson.id)} style={navStyle(selectedLessonId === lesson.id)}>
                                    <span><span style={{ display: "block", fontWeight: 600 }}>{lesson.name}</span><span style={{ display: "block", marginTop: 2, fontSize: 12, color: "#718096" }}>{lesson.topic}</span></span>
                                    <span>{lesson.problems.length}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </aside>

                <section>
                    <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
                        <div>
                            <h1 style={{ fontSize: 22, margin: 0 }}>Problems</h1>
                            <div style={{ marginTop: 4, color: "#718096", fontSize: 14 }}>{problems.length} available in this QA scope</div>
                        </div>
                        <TextField label="Search title or Problem ID" value={query} onChange={(event) => setQuery(event.target.value)} variant="outlined" size="small" style={{ minWidth: 260 }} />
                    </div>

                    <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 1fr) 170px 90px 160px", gap: 16, padding: "12px 20px", background: "#F1F5F9", color: "#64748B", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 }}>
                            <div>Problem</div><div>Lesson</div><div>Steps</div><div />
                        </div>
                        {problems.map((problem) => (
                            <div key={problem.id} style={{ display: "grid", gridTemplateColumns: "minmax(240px, 1fr) 170px 90px 160px", gap: 16, alignItems: "center", padding: "18px 20px", borderTop: "1px solid #E2E8F0" }}>
                                <div><div style={{ fontWeight: 700 }}>{problem.title}</div><div style={{ fontSize: 12, color: "#718096", marginTop: 4 }}>{problem.id}</div></div>
                                <div style={{ fontSize: 14 }}>{problem.lesson.name}<div style={{ fontSize: 12, color: "#718096", marginTop: 3 }}>{problem.lesson.topic}</div></div>
                                <div style={{ fontSize: 14 }}>{problem.steps}</div>
                                <Button variant="contained" color="primary" onClick={() => history.push(`/debug/${problem.id}`)}>Open debug view</Button>
                            </div>
                        ))}
                        {!problems.length && <div style={{ padding: 28, color: "#718096" }}>No matching debug problems.</div>}
                    </div>
                    <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 8, background: "#EEF6FF", color: "#35506B", fontSize: 13 }}>
                        Prototype note: production data would come from a Tooling-generated content manifest, not these sample rows.
                    </div>
                </section>
            </main>
        </div>
    );
}

function navStyle(active) {
    return {
        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", padding: "9px 10px", border: 0,
        borderRadius: 7, background: active ? "#E6F0F7" : "transparent", color: active ? "#1E5A7A" : "#344054", cursor: "pointer", fontSize: 13,
    };
}
