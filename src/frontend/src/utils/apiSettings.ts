import { ApiSettings } from "../pages/types";

export const SETTINGS_KEY = "librarySettings";

/**
 * Load API settings from localStorage
 */
export const loadApiSettings = (): ApiSettings => {
  const savedSettings = localStorage.getItem(SETTINGS_KEY);
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings) as ApiSettings;
    } catch (error) {
      console.error("Error loading API settings:", error);
      return {};
    }
  }
  return {};
};

/**
 * Get list of available libraries (those with tokens or marked as no token needed)
 */
export const getAvailableLibraries = (apiSettings: ApiSettings): string[] => {
  return Object.keys(apiSettings).filter((key) => {
    const settings = apiSettings[key];
    if (!settings) return false;
    return settings.noToken === true || (settings.token && settings.token.length > 0);
  });
};
