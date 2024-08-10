import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { isPublicProduction, isPublicStaging } from "./constant/const";

//handle path to support language on public profile
const backendPath = isPublicStaging
  ? "https://staging-app.opensignlabs.com/static/locales/{{lng}}/{{ns}}.json"
  : isPublicProduction
    ? "https://app.opensignlabs.com/static/locales/{{lng}}/{{ns}}.json"
    : "/locales/{{lng}}/{{ns}}.json";

//"http://localhost:3000/static/locales/{{lng}}/{{ns}}.json"

i18n
  .use(Backend)
  .use(LanguageDetector) // Use LanguageDetector directly without creating an instance
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: backendPath
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
    whitelist: ["en", "fr"] // List of allowed languages
  });

export default i18n;
