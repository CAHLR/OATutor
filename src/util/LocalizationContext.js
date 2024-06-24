import React, { createContext, useState, useContext, useEffect } from 'react';

const LocalizationContext = createContext();

export const LocalizationProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const langFromUrl = hashParams.get('locale');
    if (langFromUrl && ['en', 'es', 'se'].includes(langFromUrl)) {
      localStorage.setItem('locale', langFromUrl);
      return langFromUrl;
    }
    const storedLocale = localStorage.getItem('locale');
    return storedLocale && ['en', 'es', 'se'].includes(storedLocale) ? storedLocale : 'en';
  });

  useEffect(() => {
    const updateLanguageFromUrl = () => {
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
      const langFromUrl = hashParams.get('locale');
      if (langFromUrl && ['en', 'es', 'se'].includes(langFromUrl)) {
        setLanguage(langFromUrl);
        localStorage.setItem('locale', langFromUrl); // Save to localStorage
      }
    };

    window.addEventListener('hashchange', updateLanguageFromUrl);

    return () => {
      window.removeEventListener('hashchange', updateLanguageFromUrl);
    };
  }, []);

  useEffect(() => {
    if (['en', 'es', 'se'].includes(language)) {
      localStorage.setItem('locale', language); // Save to localStorage
    }
  }, [language]);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);
