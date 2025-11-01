import { ILanguageLink } from "../store/ducks/home/types";
import { Paths, Root } from "../routes/RouteConfig";
import { langs, langDefault } from ".";

// Returns the current URL path as array of strings
//    ex: "/en/news" -> ["en", "news"] or "/noticias" -> ["noticias"]
const getPathnameAsArray = (pathname: string = "/"): string[] => {
  if (pathname.indexOf("/") === -1) return [""];
  const path = pathname.toLowerCase().split("/");
  path.shift(); // Removes default empty item from ["", "path", ...]
  return path;
};

// Returns the lang on the URL IF it exists!
//   ex: "/en/news -> en" or "/noticias -> null"
export const readLangPathname = (pathname: string = "/"): string | null => {
  const path = getPathnameAsArray(pathname);
  if (!path) return null;
  return langs.includes(path[0]) ? path[0] : null;
};

// Return the current location for a different language
const getLocationToLang = (lang: string): string => {
  const rootPath = Root(lang);
  const pathArray = getPathnameAsArray(window.location.pathname);

  // remove old language (if it exists) OR set the current lang to default
  let langActive = readLangPathname(window.location.pathname);
  if (langActive) pathArray.shift();
  else langActive = langDefault;

  // Homepage
  if (pathArray.length === 0 || pathArray[0] === "") return rootPath;

  // Static Pages
  const allRoutesPaths = Paths();
  const selectPath = pathArray[0].split("?")[0]; // ex: news?page=1 -> news
  // ex: noticias (no params)

  return `${rootPath}${pathArray.join("/")}`;
};

// Get current location in all languages ex: [{ language: "en", link: "/en/news" },..]
export const getCurrentPathAllLangs = (): ILanguageLink[] => {
  return langs?.map((lang: string) => {
    return { language: lang, link: getLocationToLang(lang) };
  });
};
