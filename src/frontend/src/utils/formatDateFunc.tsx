import { formatWithOptions } from "date-fns/fp";
import { getLocaleLang } from "./getLocaleLang";
import { langDefault } from "./lang";

export const formatDateFunc = (
  thisDate: Date = new Date(),
  formatDate: string = "dd MMMM, yyyy",
  lang: string = langDefault
) => {
  // cria uma função format específica para o locale
  const format = formatWithOptions({ locale: getLocaleLang(lang) });
  // aplica o formato e a data
  return format(formatDate, new Date(thisDate));
};
