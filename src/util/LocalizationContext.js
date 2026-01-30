import React, { createContext, useState, useContext, useEffect } from 'react';
import {DEFAULT_LANGUAGE, AVAILABLE_LANGUAGES} from '../config/config.js';

const LocalizationContext = createContext();

export const LocalizationProvider = ({ children }) => {
  const [platformLanguage, setPlatformLanguage ] = useState(() => {

    // REMOVES URL ENCODING OF LANGUAGE TO LOCAL STATE 

    // const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    // const langFromUrl = hashParams.get('locale');
    // if (langFromUrl && ['en', 'es', 'se'].includes(langFromUrl)) {
    //   localStorage.setItem('locale', langFromUrl);
    //   localStorage.setItem('defaultLocale', langFromUrl);
    //   return langFromUrl;
    // }

    const stored = localStorage.getItem('platformLanguage');
    return AVAILABLE_LANGUAGES.includes(stored) ? stored : DEFAULT_LANGUAGE;
  });

  const [activeLanguage, setActiveLanguage] = useState(platformLanguage);
  const [currentCourseName, setCurrentCourseName] = useState(null);

  useEffect(() => {

    // REMOVES URL ENCODING OF LANGUAGE TO LOCAL STATE
    
    // const updateLanguageFromUrl = () => {
    //   const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    //   const langFromUrl = hashParams.get('locale');
    //   if (langFromUrl && ['en', 'es', 'se'].includes(langFromUrl)) {
    //     setLanguage(langFromUrl);
    //     localStorage.setItem('locale', langFromUrl);
    //     localStorage.setItem('defaultLocale', langFromUrl);
    //   }
    // };

    // window.addEventListener('hashchange', updateLanguageFromUrl);

    // return () => {
    //   window.removeEventListener('hashchange', updateLanguageFromUrl);
    // };

    localStorage.setItem('platformLanguage', platformLanguage);
  }, [platformLanguage]);


  useEffect(() => {
    // if (['en', 'es', 'se'].includes(language)) {
    //   localStorage.setItem('locale', language);
    // }
    if (!currentCourseName) {
      setActiveLanguage(platformLanguage);
    }
  }, [platformLanguage, currentCourseName]);

  /**
   * Called when entering a course
   * @param courseName 
   * @param courseLanguage 
   */
  const enterCourse = (courseName, courseLanguage) => {
    setCurrentCourseName(courseName);
    const savedLang = sessionStorage.getItem(`course_lang_${courseName}`);
    
    if (savedLang && AVAILABLE_LANGUAGES.includes(savedLang)) {
      setActiveLanguage(savedLang);
    } else if (courseLanguage && AVAILABLE_LANGUAGES.includes(courseLanguage)) {
      setActiveLanguage(courseLanguage);
      sessionStorage.setItem(`course_lang_${courseName}`, courseLanguage);
    } else {
      setActiveLanguage(platformLanguage);
    }
  };

  /**
   * Called when leaving a course (going to home)
   */
  const exitCourse = () => {
    setCurrentCourseName(null);
    setActiveLanguage(platformLanguage);
  };

  const setLanguage = (lang) => {
    if (!AVAILABLE_LANGUAGES.includes(lang)) return;
    setPlatformLanguage(lang);
  };

  return (
    <LocalizationContext.Provider 
      value={{
        language: activeLanguage,
        platformLanguage, 
        setLanguage,
        enterCourse,
        exitCourse,
        SUPPORTED_LANGUAGES: AVAILABLE_LANGUAGES
      }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);

export const LocalizationConsumer = LocalizationContext.Consumer;
