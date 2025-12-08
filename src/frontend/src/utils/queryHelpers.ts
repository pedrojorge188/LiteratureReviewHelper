import { Query } from "../pages/types";

/**
 * Normalize queries by ensuring the first query has no operator
 * and all subsequent queries have an operator (defaults to "AND")
 */
export const normalizeQueries = (queries: Query[]): Query[] => {
  return queries.map((q, i) => {
    if (i === 0) {
      const { value } = q;
      return { value };
    }
    return { value: q.value, operator: q.operator || "AND" };
  });
};

/**
 * Add a new query to the list
 */
export const addQuery = (queries: Query[]): Query[] => {
  const newQueries = [...queries, { value: "", operator: "AND" }];
  return normalizeQueries(newQueries);
};

/**
 * Remove a query from the list at the specified index
 */
export const removeQuery = (queries: Query[], index: number): Query[] => {
  const newQueries = queries.filter((_, i) => i !== index);
  return normalizeQueries(newQueries);
};

/**
 * Move a query up in the list (swap with previous query)
 */
export const moveQueryUp = (queries: Query[], index: number): Query[] => {
  if (index === 0) return queries;
  const newQueries = [...queries];
  [newQueries[index - 1], newQueries[index]] = [
    newQueries[index],
    newQueries[index - 1],
  ];
  return normalizeQueries(newQueries);
};

/**
 * Update a specific field of a query at the specified index
 */
export const updateQuery = (
  queries: Query[],
  index: number,
  field: keyof Query,
  value: string
): Query[] => {
  const newQueries = queries.map((q) => ({ ...q })); // <- clonar os objetos de forma profunda sem ficar apenas por referencias que dão problema
  newQueries[index][field] = value;
  return normalizeQueries(newQueries);
};
