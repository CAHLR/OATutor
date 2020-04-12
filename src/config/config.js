import React from 'react';
import algebraCheckOptions from './algebraCheck.js';
import credentials from './credentials.js';
import skillModel from './skillModel.js';

const logData = true;

const dynamicText = {
    "%CAR%": "Tesla car"
};

const ThemeContext = React.createContext(0);

export { 
    logData, 
    dynamicText, 
    algebraCheckOptions, 
    credentials, 
    skillModel,
    ThemeContext
}