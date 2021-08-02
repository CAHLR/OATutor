import React from 'react';
//import lessonPlans from './lessonPlans.js'
import courses from './coursePlans.js';
import {bkt2Index, index2Bkt} from './bktIndex.js';

const ThemeContext = React.createContext(0);
const siteVersion = 1.105;
const logData = true;
const logMouseData = false;
const debug = false;
const useBottomOutHints = true;

// DynamicText not supported for HTML body types
const dynamicText = {
    "%CAR%": "Tesla car"
};
const cookieID = "openITS-id";

// Firebase Config
const MAX_BUFFER_SIZE = 100;
const GRANULARITY = 5;

const autoCommands = "pi theta sqrt sum prod int alpha beta gamma rho nthroot pm";
const autoOperatorNames = "sin cos tan";

const middlewareURL = "https://askoski.berkeley.edu:1339";

var coursePlans = courses.sort((a,b) => a.courseName.localeCompare(b.courseName));

var lessonCounter = 0;
var lessonPlans = [];
for (var i = 0; i < coursePlans.length; i++) {
    var course = coursePlans[i];
    for (var j = 0; j < course.lessons.length; j++) {
        course.lessons[j].lessonNum = lessonCounter;
        lessonCounter += 1;
        lessonPlans.push(course.lessons[j]);
    }
}

export {ThemeContext, 
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
    bkt2Index, 
    index2Bkt
};
