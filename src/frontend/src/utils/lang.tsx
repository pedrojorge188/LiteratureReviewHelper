export const langs = import.meta.env.VITE_APP_LANGUAGES?.split(";") || [];
export const langDefault = import.meta.env.VITE_APP_DEFAULT_LANGUAGE;
export const langDefaultRedirect = import.meta.env.VITE_APP_DEFAULT_LANGUAGE_FORCED_REDIRECT === "true";

