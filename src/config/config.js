import React from "react";
import courses from "../content-sources/oatutor/coursePlans.json";
import { calculateSemester } from "../util/calculateSemester.js";

import { SITE_NAME } from "@common/global-config";
import { cleanObjectKeys } from "../util/cleanObject";

const ThemeContext = React.createContext(0);
const SITE_VERSION = "1.6";

const CURRENT_SEMESTER = calculateSemester(Date.now());

/**
 * If user does not access the website through Canvas, show a warning (for the first time).
 * @type {boolean}
 */
const SHOW_NOT_CANVAS_WARNING = false;

/**
 * Indicates whether the copyright disclaimer should be shown in the footer of the website.
 * @type {boolean}
 */
const SHOW_COPYRIGHT = false;

/**
 * Only set to true if firebaseConfig.js is set, and you wish to use Firebase to store events. Events include user
 * feedback, user interactions, and site logs.
 * @type {boolean}
 */
const ENABLE_FIREBASE = true;

/**
 * If ENABLE_FIREBASE, indicates whether the site should use Firebase to store, process, and analyze general user
 * interactions.
 * @type {boolean}
 */
const DO_LOG_DATA = true;

/**
 * Indicates whether a log event should be fired everytime a user leaves or returns to this window.
 * @type {boolean}
 */
const DO_FOCUS_TRACKING = true;

/**
 * If DO_LOG_DATA is enabled, indicates whether the site should also track user mouse interactions with the site. See
 * the README.md to properly enable this feature.
 * @type {boolean}
 */
const DO_LOG_MOUSE_DATA = false;

/**
 * Flag to enable or disable A/B testing
 * @type {boolean}
 */
const AB_TEST_MODE = false;

/**
 * If reach bottom of provided hints, give correct answer to question
 * @type {boolean}
 */
const ENABLE_BOTTOM_OUT_HINTS = true;

// DynamicText not supported for HTML body types
const dynamicText = {
    "%CAR%": "Tesla car",
};

const _SHORT_SITE_NAME = SITE_NAME.toLowerCase()
    .replace(/[^a-z]/g, "")
    .substr(0, 16);

const USER_ID_STORAGE_KEY = `${_SHORT_SITE_NAME}-user_id`;
const PROGRESS_STORAGE_KEY = `${_SHORT_SITE_NAME}-progress`;
export const LESSON_PROGRESS_STORAGE_KEY = (lessonId) =>
    `${PROGRESS_STORAGE_KEY}-${lessonId}`;

const CANVAS_WARNING_STORAGE_KEY = `${_SHORT_SITE_NAME}-canvas-warning-dismissed`;

// Firebase Config
const MAX_BUFFER_SIZE = 100;
const GRANULARITY = 5;

const EQUATION_EDITOR_AUTO_COMMANDS =
    "pi theta sqrt sum prod int alpha beta gamma rho nthroot pm";
const EQUATION_EDITOR_AUTO_OPERATORS = "sin cos tan";

const MIDDLEWARE_URL = "https://di2iygvxtg.execute-api.us-west-1.amazonaws.com/prod";

const LOCALES_URL = "https://fdp8ici4ui.execute-api.us-west-1.amazonaws.com/prod";

const HELP_DOCUMENT =
    "https://docs.google.com/document/d/e/2PACX-1vToe2F3RiCx1nwcX9PEkMiBA2bFy9lQRaeWIbyqlc8W_KJ9q-hAMv34QaO_AdEelVY7zjFAF1uOP4pG/pub";

const DYNAMIC_HINT_URL = "https://oatutor-backend.herokuapp.com/get_hint";

const DYNAMIC_HINT_TEMPLATE =
    "<{problem_title}.> <{problem_subtitle}.> <{question_title}.> <{question_subtitle}.> <Student's answer is: {student_answer}.> <The correct answer is: {correct_answer}.> Please give a hint for this.";

const MASTERY_THRESHOLD = 0.95
// const coursePlans = courses.sort((a, b) => a.courseName.localeCompare(b.courseName));
const coursePlans = courses;
const _coursePlansNoEditor = coursePlans.filter(({ editor }) => !!!editor);

const lessonPlans = [];
for (let i = 0; i < coursePlans.length; i++) {
    const course = coursePlans[i];
    for (let j = 0; j < course.lessons.length; j++) {
        course.lessons[j].learningObjectives = cleanObjectKeys(
            course.lessons[j].learningObjectives
        );
        lessonPlans.push({
            ...course.lessons[j],
            courseName: course.courseName,
            courseOER: course.courseOER != null ? course.courseOER : "",
            courseLicense:
                course.courseLicense != null ? course.courseLicense : "",
        });
    }
}
const _lessonPlansNoEditor = lessonPlans.filter(
    ({ courseName }) => !courseName.startsWith("!!")
);

const findLessonById = (ID) => {
    return _lessonPlansNoEditor.find((lessonPlan) => lessonPlan.id === ID);
};

export {
    ThemeContext,
    SITE_VERSION,
    ENABLE_FIREBASE,
    DO_LOG_DATA,
    DO_LOG_MOUSE_DATA,
    AB_TEST_MODE,
    dynamicText,
    ENABLE_BOTTOM_OUT_HINTS,
    lessonPlans,
    coursePlans,
    _lessonPlansNoEditor,
    _coursePlansNoEditor,
    MAX_BUFFER_SIZE,
    GRANULARITY,
    EQUATION_EDITOR_AUTO_COMMANDS,
    EQUATION_EDITOR_AUTO_OPERATORS,
    MIDDLEWARE_URL,
    LOCALES_URL,
    DYNAMIC_HINT_URL,
    DYNAMIC_HINT_TEMPLATE,
    MASTERY_THRESHOLD,
    USER_ID_STORAGE_KEY,
    PROGRESS_STORAGE_KEY,
    SITE_NAME,
    HELP_DOCUMENT,
    SHOW_COPYRIGHT,
    CURRENT_SEMESTER,
    CANVAS_WARNING_STORAGE_KEY,
    DO_FOCUS_TRACKING,
    findLessonById,
    SHOW_NOT_CANVAS_WARNING,
};
