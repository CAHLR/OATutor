import { useState, useEffect } from 'react';
import { useLocalization } from './LocalizationContext';

export const useTranslation = () => {
  const { language } = useLocalization();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    import(`../locales/${language}.json`)
      .then((module) => {
        setTranslations(module.default || module);
      })
      .catch((error) => {
        console.error(`Could not load ${language}.json`, error);
      });
  }, [language]);

  const translate = (key) => {
    return key.split('.').reduce((obj, k) => (obj || {})[k], translations);
  };

  return translate;
};
