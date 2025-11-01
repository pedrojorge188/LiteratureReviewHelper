export const checkLang = (newLng: string, actualLng: string) => {
  const allLangs = import.meta.env.VITE_APP_LANGUAGES?.split(";").filter(
    (lng: string) => lng !== actualLng
  );

  return allLangs && newLng !== actualLng && allLangs.includes(newLng);
};
