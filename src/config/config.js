import React from 'react';
import courses from './coursePlans.js';

const ThemeContext = React.createContext(0);
const siteVersion = "1.2.1";
const logData = true;
const logMouseData = false;
const debug = false;
const useBottomOutHints = true;

// DynamicText not supported for HTML body types
const dynamicText = {
  "%CAR%": "Tesla car"
};
const cookieID = "openITS-id";

const PROGRESS_STORAGE_KEY = 'openITS-progress'

// Firebase Config
const MAX_BUFFER_SIZE = 100;
const GRANULARITY = 5;

const autoCommands = "pi theta sqrt sum prod int alpha beta gamma rho nthroot pm";
const autoOperatorNames = "sin cos tan";

const middlewareURL = process.env.REACT_APP_MIDDLEWARE_URL || "https://askoski.berkeley.edu:1339";

var coursePlans = courses.sort((a, b) => a.courseName.localeCompare(b.courseName));

var lessonCounter = 0;
var lessonPlans = [];
for (var i = 0; i < coursePlans.length; i++) {
  var course = coursePlans[i];
  for (var j = 0; j < course.lessons.length; j++) {
    course.lessons[j].lessonNum = lessonCounter;
    lessonCounter += 1;
    lessonPlans.push({ ...course.lessons[j], courseName: course.courseName });
  }
}

export {
  ThemeContext,
  siteVersion,
  logData,
  logMouseData,
  dynamicText,
  cookieID,
  debug,
  useBottomOutHints,
  lessonPlans,
  coursePlans,
  MAX_BUFFER_SIZE,
  GRANULARITY,
  autoCommands,
  autoOperatorNames,
  middlewareURL,
  PROGRESS_STORAGE_KEY
};
