import { useState, useEffect } from "react";
import { useLocalization } from "./LocalizationContext";

export const useTranslation = () => {
    const { language } = useLocalization();
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        const loadTranslations = async (lang) => {
            const module = await import(`../locales/${lang}.json`);
            setTranslations(module.default || module);
        };

        if (["en", "es", "se"].includes(language)) {
            loadTranslations(language);
        }
    }, [language]);

    const translate = (key) => {
        return key.split(".").reduce((obj, k) => (obj || {})[k], translations);
    };

    return translate;
};
