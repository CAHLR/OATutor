import { useLocalization } from "./LocalizationContext";

import translationsEn from "../locales/en.json";
import translationsEs from "../locales/es.json";
import translationsSe from "../locales/se.json";

export const useTranslation = () => {
    const { language, setLanguage } = useLocalization();

    const translationsMap = {
        en: translationsEn,
        es: translationsEs,
        se: translationsSe,
    };

    const translations = translationsMap[language] || translationsMap['en'];

    const translate = (key) => {
        return key.split(".").reduce((obj, k) => (obj || {})[k], translations);
    };

    return { translate, setLanguage };
};
