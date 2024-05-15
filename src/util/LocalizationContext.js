import React, { createContext, useState, useContext, useEffect } from 'react';

const LocalizationContext = createContext();

export const LocalizationProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const langFromUrl = hashParams.get('locale');
    if (langFromUrl) {
      localStorage.setItem('locale', langFromUrl);
      return langFromUrl;
    }
    return localStorage.getItem('locale') || 'en';
  });

  useEffect(() => {
    const updateLanguageFromUrl = () => {
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
      const langFromUrl = hashParams.get('locale');
      if (langFromUrl) {
        setLanguage(langFromUrl);
      }
    };

    window.addEventListener('hashchange', updateLanguageFromUrl);

    return () => {
      window.removeEventListener('hashchange', updateLanguageFromUrl);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('locale', language);
  }, [language]);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);
