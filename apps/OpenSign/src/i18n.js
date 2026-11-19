import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(LanguageDetector) // Use LanguageDetector directly without creating an instance
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json"
    },
    fallbackLng: "en", // Fallback to English if no other language is detected
    detection: {
      // Specifies the default language to fall back to if the detected language is not available.
      order: ["localStorage", "navigator"],
      // Defines where the detected language should be cached.
      caches: ["localStorage"]
    },
    ns: ["translation"], // default namespace
    defaultNS: "translation", // default namespace
    //Enables debug mode, which outputs detailed logs to the console about the translation process.
    debug: false,
    interpolation: {
      escapeValue: false // Not needed for react as it escapes by default
    },
    // i18next v22+ renamed `whitelist` to `supportedLngs`; the old key was
    // silently ignored, so `en-US` reached the backend and 404'd.
    supportedLngs: ["en", "es", "fr", "it", "de", "hi", "kr"],
    // Resolve regional locales to their base language: en-US -> en, es-PE -> es.
    nonExplicitSupportedLngs: true,
    // Never request a regional file; only en/es/fr/... exist on disk.
    load: "languageOnly"
  });

export default i18n;
