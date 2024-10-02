import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";
import fr from "./locales/fr/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },
      es: {
        translation: es
      },
      fr: {
        translation: fr
      }
    },

    fallbackLng: "en", // fallback language
    detection: {
      // Specifies the default language to fall back to if the detected language is not available.
      order: ["localStorage", "navigator"]
      // Defines where the detected language should be cached.
    },
    debug: false,
    interpolation: {
      escapeValue: false // React already does escaping
    },
    whitelist: ["en", "es", "fr"] // List of allowed languages
  });

export default i18n;
