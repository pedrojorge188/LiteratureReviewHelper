import { formatWithOptions } from "date-fns/fp";
import { getLocaleLang } from "./getLocaleLang";
import { langDefault } from "./lang";

export const formatDate = (
  thisDate: Date = new Date(),
  formatPattern: string = "dd MMMM, yyyy",
  lang: string = langDefault
) => {
  const format = formatWithOptions({ locale: getLocaleLang(lang) });
  return format(formatPattern, thisDate);
};
