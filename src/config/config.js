import React from 'react';
import courses from './coursePlans.js';

const ThemeContext = React.createContext(0);
const SITE_VERSION = "1.3.0";

const SITE_NAME = "Open ITS"

/**
 * Indicates whether the site should use Firebase to store, process, and analyze general user interactions
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

// Firebase Config
const MAX_BUFFER_SIZE = 100;
const GRANULARITY = 5;

const EQUATION_EDITOR_AUTO_COMMANDS = "pi theta sqrt sum prod int alpha beta gamma rho nthroot pm";
const EQUATION_EDITOR_AUTO_OPERATORS = "sin cos tan";

const MIDDLEWARE_URL = process.env.REACT_APP_MIDDLEWARE_URL || "https://oatutor.askoski.berkeley.edu";

const coursePlans = courses.sort((a, b) => a.courseName.localeCompare(b.courseName));

let lessonCounter = 0;
const lessonPlans = [];
for (let i = 0; i < coursePlans.length; i++) {
    const course = coursePlans[i];
    for (let j = 0; j < course.lessons.length; j++) {
        course.lessons[j].lessonNum = lessonCounter;
        lessonCounter += 1;
        lessonPlans.push({ ...course.lessons[j], courseName: course.courseName });
    }
}

export {
    ThemeContext,
    SITE_VERSION,
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
    SITE_NAME
};
