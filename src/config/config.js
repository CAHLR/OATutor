import React from 'react';
import courses from './coursePlans.js';
import { calculateSemester } from "../util/calculateSemester.js";
import { SITE_NAME } from "./shared-config"
import cleanObjectKeys from "../util/cleanObjectKeys";

const ThemeContext = React.createContext(0);
const SITE_VERSION = "1.3.2";

const CURRENT_SEMESTER = calculateSemester(Date.now())

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
 * If DO_LOG_DATA is enabled, indicates whether the site should also track user mouse interactions with the site. See
 * the README.md to properly enable this feature.
 * @type {boolean}
 */
const DO_LOG_MOUSE_DATA = false;

/**
 * TODO: document the usage of this boolean option
 * @type {boolean}
 */
const ENABLE_BOTTOM_OUT_HINTS = true;

// DynamicText not supported for HTML body types
const dynamicText = {
    "%CAR%": "Tesla car"
};

const _SHORT_SITE_NAME = SITE_NAME.toLowerCase().replace(/[^a-z]/g, '').substr(0, 16)

const USER_ID_STORAGE_KEY = `${_SHORT_SITE_NAME}-user_id`
const PROGRESS_STORAGE_KEY = `${_SHORT_SITE_NAME}-progress`

const CANVAS_WARNING_STORAGE_KEY = `${_SHORT_SITE_NAME}-canvas-warning-dismissed`

// Firebase Config
const MAX_BUFFER_SIZE = 100;
const GRANULARITY = 5;

const EQUATION_EDITOR_AUTO_COMMANDS = "pi theta sqrt sum prod int alpha beta gamma rho nthroot pm";
const EQUATION_EDITOR_AUTO_OPERATORS = "sin cos tan";

const MIDDLEWARE_URL = process.env.REACT_APP_MIDDLEWARE_URL || "https://oatutor.askoski.berkeley.edu";

const HELP_DOCUMENT = "https://docs.google.com/document/d/e/2PACX-1vToe2F3RiCx1nwcX9PEkMiBA2bFy9lQRaeWIbyqlc8W_KJ9q-hAMv34QaO_AdEelVY7zjFAF1uOP4pG/pub"

const coursePlans = courses.sort((a, b) => a.courseName.localeCompare(b.courseName));

let lessonCounter = 0;
const lessonPlans = [];
for (let i = 0; i < coursePlans.length; i++) {
    const course = coursePlans[i];
    for (let j = 0; j < course.lessons.length; j++) {
        course.lessons[j].lessonNum = lessonCounter;
        lessonCounter += 1;
        course.lessons[j].learningObjectives = cleanObjectKeys(course.lessons[j].learningObjectives)
        lessonPlans.push({ ...course.lessons[j], courseName: course.courseName });
    }
}

export {
    ThemeContext,
    SITE_VERSION,
    ENABLE_FIREBASE,
    DO_LOG_DATA,
    DO_LOG_MOUSE_DATA,
    dynamicText,
    ENABLE_BOTTOM_OUT_HINTS,
    lessonPlans,
    coursePlans,
    MAX_BUFFER_SIZE,
    GRANULARITY,
    EQUATION_EDITOR_AUTO_COMMANDS,
    EQUATION_EDITOR_AUTO_OPERATORS,
    MIDDLEWARE_URL,
    USER_ID_STORAGE_KEY,
    PROGRESS_STORAGE_KEY,
    SITE_NAME,
    HELP_DOCUMENT,
    SHOW_COPYRIGHT,
    CURRENT_SEMESTER,
    CANVAS_WARNING_STORAGE_KEY
};
