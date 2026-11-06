import React, { useEffect, useMemo, useState } from "react";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import BrandLogoNav from "@components/BrandLogoNav";
import { coursePlans } from "../config/config.js";
import { CONTENT_SOURCE } from "@common/global-config";

// DebugPlatform reads this same generated content pool. Building the directory
// from it guarantees every entry has a currently loadable /debug/:problemID route.
const problemPool = require(`@generated/processed-content-pool/${CONTENT_SOURCE}.json`);

const toLabel = (value) => String(value || "")
    .replace(/[_&]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const topicFor = (lesson) => {
    if (lesson?.topics) return lesson.topics;
    const objectives = Object.keys(lesson?.learningObjectives || {});
    return objectives.length ? objectives.map(toLabel).join(", ") : "No topic specified";
};

export const buildDebugDirectory = (plans, pool) => {
    const problemsByLesson = new Map();

    pool.forEach((problem) => {
        if (!problem?.id || !problem.courseName) return;
        const key = `${problem.courseName}::${problem.lessonId || problem.lesson || "unassigned"}`;
        if (!problemsByLesson.has(key)) problemsByLesson.set(key, []);
        problemsByLesson.get(key).push(problem);
    });

    return plans
        .filter((course) => !course.editor)
        .map((course) => {
            const lessons = (course.lessons || []).map((lesson) => {
                const problems = (problemsByLesson.get(`${course.courseName}::${lesson.id}`) || [])
                    .map((problem) => ({
                        id: problem.id,
                        title: problem.title || problem.id,
                        steps: Array.isArray(problem.steps) ? problem.steps.length : 0,
                    }))
                    .sort((a, b) => a.title.localeCompare(b.title));

                return {
                    id: lesson.id,
                    name: lesson.displayName || lesson.name || lesson.id,
                    topic: topicFor(lesson),
                    problems,
                };
            }).filter((lesson) => lesson.problems.length);

            return { course: course.courseName, lessons };
        })
        .filter((course) => course.lessons.length);
};

const directory = buildDebugDirectory(coursePlans, problemPool);
const PAGE_SIZE = 50;
const allProblems = directory.flatMap((course) =>
    course.lessons.flatMap((lesson) =>
        lesson.problems.map((problem) => ({ ...problem, course: course.course, lesson }))
    )
);

export default function DebugIndex({ history }) {
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedLessonId, setSelectedLessonId] = useState("all");
    const [selectedTopic, setSelectedTopic] = useState("all");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(0);

    const course = directory.find((entry) => entry.course === selectedCourse);
    const lessons = course?.lessons || [];
    const topics = [...new Set(lessons.map((lesson) => lesson.topic))].sort();

    const problems = useMemo(() => {
        if (!selectedCourse) return [];
        const normalizedQuery = query.trim().toLowerCase();
        return allProblems.filter((problem) => {
            const matchesCourse = problem.course === selectedCourse;
            const matchesLesson = selectedLessonId === "all" || problem.lesson.id === selectedLessonId;
            const matchesTopic = selectedTopic === "all" || problem.lesson.topic === selectedTopic;
            const matchesQuery = !normalizedQuery || [
                problem.id,
                problem.title,
                problem.course,
                problem.lesson.name,
                problem.lesson.topic,
            ].some((value) => value.toLowerCase().includes(normalizedQuery));
            return matchesCourse && matchesLesson && matchesTopic && matchesQuery;
        });
    }, [selectedCourse, selectedLessonId, selectedTopic, query]);

    useEffect(() => {
        setPage(0);
    }, [selectedCourse, selectedLessonId, selectedTopic, query]);

    const selectCourse = (event) => {
        setSelectedCourse(event.target.value);
        setSelectedLessonId("all");
        setSelectedTopic("all");
    };

    const pageCount = Math.max(1, Math.ceil(problems.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount - 1);
    const visibleProblems = problems.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
    const firstProblem = problems.length ? currentPage * PAGE_SIZE + 1 : 0;
    const lastProblem = Math.min((currentPage + 1) * PAGE_SIZE, problems.length);

    return (
        <div style={{ minHeight: "100vh", background: "#F7FAFC", color: "#243B53" }}>
            <header style={{ height: 64, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", boxShadow: "0 1px 3px rgba(16,24,40,0.12)" }}>
                <BrandLogoNav noLink />
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.2 }}>Content QA</div>
                <Button color="primary" variant="outlined" onClick={() => history.push("/")}>Exit QA</Button>
            </header>

            <div style={{ background: "#243B53", color: "#F8FAFC", padding: "22px 32px" }}>
                <div style={{ maxWidth: 1240, margin: "0 auto", fontSize: 24, fontWeight: 700 }}>Debug Links Directory</div>
            </div>

            <main style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 32px" }}>
                <section>
                    <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}>
                        <div style={{ fontSize: 13, color: "#64748B", fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 14 }}>Choose QA scope</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                            <TextField select required label="Course" value={selectedCourse} onChange={selectCourse} variant="outlined" size="small">
                                <MenuItem value=""><em>Select a course</em></MenuItem>
                                {directory.map((entry) => <MenuItem key={entry.course} value={entry.course}>{entry.course}</MenuItem>)}
                            </TextField>
                            <TextField select label="Lesson" value={selectedLessonId} onChange={(event) => setSelectedLessonId(event.target.value)} variant="outlined" size="small" disabled={!selectedCourse}>
                                <MenuItem value="all">All lessons</MenuItem>
                                {lessons.map((lesson) => <MenuItem key={lesson.id} value={lesson.id}>{lesson.name} ({lesson.problems.length})</MenuItem>)}
                            </TextField>
                            <TextField select label="Topic" value={selectedTopic} onChange={(event) => setSelectedTopic(event.target.value)} variant="outlined" size="small" disabled={!selectedCourse}>
                                <MenuItem value="all">All topics</MenuItem>
                                {topics.map((topic) => <MenuItem key={topic} value={topic}>{topic}</MenuItem>)}
                            </TextField>
                            <TextField label="Search title or Problem ID" value={query} onChange={(event) => setQuery(event.target.value)} variant="outlined" size="small" disabled={!selectedCourse} />
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
                        <div>
                            <h1 style={{ fontSize: 22, margin: 0 }}>Problems</h1>
                            <div style={{ marginTop: 4, color: "#718096", fontSize: 14 }}>{selectedCourse ? `${selectedCourse} · ${problems.length} available in this QA scope` : "Select a course to browse its debug links."}</div>
                        </div>
                    </div>

                    <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 1fr) 170px 90px 160px", gap: 16, padding: "12px 20px", background: "#F1F5F9", color: "#64748B", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 }}>
                            <div>Problem</div><div>Lesson</div><div>Steps</div><div />
                        </div>
                        {visibleProblems.map((problem) => (
                            <div key={problem.id} style={{ display: "grid", gridTemplateColumns: "minmax(240px, 1fr) 170px 90px 160px", gap: 16, alignItems: "center", padding: "18px 20px", borderTop: "1px solid #E2E8F0" }}>
                                <div><div style={{ fontWeight: 700 }}>{problem.title}</div><div style={{ fontSize: 12, color: "#718096", marginTop: 4 }}>{problem.id}</div></div>
                                <div style={{ fontSize: 14 }}>{problem.lesson.name}<div style={{ fontSize: 12, color: "#718096", marginTop: 3 }}>{problem.lesson.topic}</div></div>
                                <div style={{ fontSize: 14 }}>{problem.steps}</div>
                                <Button variant="contained" color="primary" onClick={() => history.push(`/debug/${problem.id}`)}>Open debug view</Button>
                            </div>
                        ))}
                        {!problems.length && <div style={{ padding: 28, color: "#718096" }}>{selectedCourse ? "No matching debug problems." : "Choose a course above to view its debug links."}</div>}
                    </div>
                    {problems.length > PAGE_SIZE && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, gap: 12 }}>
                            <div style={{ color: "#718096", fontSize: 13 }}>Showing {firstProblem}–{lastProblem} of {problems.length}</div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <Button variant="outlined" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</Button>
                                <Button variant="outlined" disabled={currentPage === pageCount - 1} onClick={() => setPage(currentPage + 1)}>Next</Button>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
