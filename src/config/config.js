import React from 'react';
import algebraCheckOptions from './algebraCheck.js';

const ThemeContext = React.createContext(0);
const siteVersion = 1.0;
const logData = true;
const debug = true;
const useBottomOutHints = false;

// DynamicText not supported for HTML body types
const dynamicText = {
    "%CAR%": "Tesla car"
};
const cookieID = "openITS-id";

export {ThemeContext, 
    algebraCheckOptions,
    siteVersion,
    logData,
    dynamicText,
    cookieID,
    debug,
    useBottomOutHints
};