import { Query } from "../pages/types";

export const buildQueryString = (queries: Query[]) => {
  return queries
    .map((q, i) => (i === 0 ? `(${q.value})` : `${q.operator} (${q.value})`))
    .join(" ")
    .trim();
}