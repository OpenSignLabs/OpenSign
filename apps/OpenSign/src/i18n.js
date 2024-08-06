import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(LanguageDetector) // Use LanguageDetector directly without creating an instance
  .use(initReactI18next)
  .init({
    fallbackLng: "en", // Fallback to English if no other language is detected
    detection: {
      // Order and from where user language should be detected
      order: ["localStorage", "navigator", "htmlTag", "path", "subdomain"],
      // Cache user language on
      caches: ["localStorage"]
    },
    debug: true,
    interpolation: {
      escapeValue: false // Not needed for react as it escapes by default
    },
    whitelist: ["en", "fr"] // List of allowed languages
  });

export default i18n;
