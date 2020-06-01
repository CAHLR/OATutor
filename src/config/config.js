import React from 'react';
import algebraCheckOptions from './algebraCheck.js';
import lessonPlans from './lessonPlans.js'

const ThemeContext = React.createContext(0);
const siteVersion = 0.1;
const logData = false;
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

export {ThemeContext, 
    algebraCheckOptions,
    siteVersion,
    logData,
    logMouseData,
    dynamicText,
    cookieID,
    debug,
    useBottomOutHints,
    lessonPlans,
    MAX_BUFFER_SIZE,
    GRANULARITY
};