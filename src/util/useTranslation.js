import { useState, useEffect } from 'react';
import { useLocalization } from './LocalizationContext';
import { LOCALES_URL } from '../config/config';

export const useTranslation = () => {
  const { language } = useLocalization();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const loadTranslations = async (lang) => {
      try {
        const response = await fetch(`${LOCALES_URL}/fetch-locale/?locale=${lang}`);
        if (!response.ok) {
          throw new Error(`Could not fetch ${lang}.json`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setTranslations(data);
        console.log("Translations for " + lang + " loaded successfully");
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
