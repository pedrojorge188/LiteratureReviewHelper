import { enGB, pt, fr, es, de, nl } from "date-fns/locale";

export const getLocaleLang = (lang: string) => {
  switch (lang) {
    case "pt":
      return pt;
    case "en":
      return enGB;
    case "fr":
      return fr;
    case "es":
      return es;
    case "de":
      return de;
    case "nl":
      return nl;
    default:
      return pt;
  }
};
