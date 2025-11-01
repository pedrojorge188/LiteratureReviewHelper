import { formatWithOptions } from "date-fns/fp";
import { getLocaleLang } from "./getLocaleLang";
import { langDefault } from "./lang";

export const useFormatDate = (
  thisDate: Date = new Date(),
  formatDate: string = "dd MMMM, yyyy",
  lang: string = langDefault
) => {
  const format = formatWithOptions({ locale: getLocaleLang(lang) });
  return format(formatDate, new Date(thisDate));
};
