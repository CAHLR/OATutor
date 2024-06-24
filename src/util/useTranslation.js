import { useState, useEffect } from 'react';
import { useLocalization } from './LocalizationContext';

export const useTranslation = () => {
  const { language } = useLocalization();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const loadTranslations = async (lang) => {
      try {
        const module = await import(`../locales/${lang}.json`);
        setTranslations(module.default || module);
      } catch (error) {
        console.error(`Could not load ${lang}.json`, error);
      }
    };

    if (['en', 'es', 'se'].includes(language)) {
      loadTranslations(language);
    }
  }, [language]);

  const translate = (key) => {
    return key.split('.').reduce((obj, k) => (obj || {})[k], translations);
  };

  return translate;
};
