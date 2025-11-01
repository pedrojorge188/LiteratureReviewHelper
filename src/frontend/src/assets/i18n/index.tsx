import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./languages";

i18n.use(initReactI18next).init({
  resources,
  lng: import.meta.env.VITE_APP_DEFAULT_LANGUAGE,
  fallbackLng: "pt",
  debug: false,
  interpolation: {
    escapeValue: false, // importante para React
  },
  ns: ["general", "home", "sideMenu"],
  defaultNS: "general",
});

export default i18n;
