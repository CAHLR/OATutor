import React from "react";
import courses from "../content-sources/oatutor/coursePlans.json";

const coursePlans = courses.filter(
    course => course.courseName === "OpenStax: Elementary Algebra"
);

const lessonPlans = [];
for (let i = 0; i < coursePlans.length; i++) {
    const course = coursePlans[i];
    for (let j = 0; j < course.lessons.length; j++) {
        lessonPlans.push({
            ...course.lessons[j],
            courseName: course.courseName,
        });
    }
}

const getLessonGroup = (title) => {
    const match = title.match(/Lesson\s*(\d+)\.\d+/i); 
    return match 
        ? `Lesson ${match[1]}`
        : "Other";
}

const groupedLessons = {}
lessonPlans.forEach((lesson) => {
    const title = lesson.name || lesson.topics || " ";
    const group = getLessonGroup(title); 

    if (!groupedLessons[group]) {
        groupedLessons[group] = [];
    }

    groupedLessons[group].push(lesson);
});

const LessonList = () => {
    return (
        <div>
            {Object.entries(groupedLessons).map(([groupTitle, lessons]) => (

            <div key={groupTitle}>
                <h3>
                    {groupTitle}
                </h3>

            <ul>
                {lessons.map((lesson, index) => (
                    <li key={lesson.id || index}>
                        {lesson.name} {lesson.topics}
                    </li>
                ))}
            </ul>
            </div>
        ))}   
    </div> 
)};
export default LessonList;