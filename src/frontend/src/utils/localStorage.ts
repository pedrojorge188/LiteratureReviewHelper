import { SavedSearch, SavedSearchesStorage, SearchParameters } from "../pages/types";

const STORAGE_KEY = "literatureReviewHelper_savedSearches";

// Type for internal app usage (Portuguese field names)
interface InternalSearchParameters {
  queries: Array<{ valor: string; metadado?: string }>;
  anoDe: string;
  anoAte: string;
  authors: string[];
  titles: string[];
  venues: string[];
  excludeAuthors: string[];
  excludeVenues: string[];
  excludeTitles: string[];
  bibliotecas: string[];
}

/**
 * Convert internal parameters (Portuguese) to storage format (English)
 */
const toStorageFormat = (params: InternalSearchParameters): SearchParameters => {
  return {
    queries: params.queries.map(q => ({
      value: q.valor,
      operator: q.metadado
    })),
    yearFrom: params.anoDe,
    yearTo: params.anoAte,
    authors: params.authors,
    titles: params.titles,
    venues: params.venues,
    excludeAuthors: params.excludeAuthors,
    excludeTitles: params.excludeTitles,
    excludeVenues: params.excludeVenues,
    libraries: params.bibliotecas,
  };
};

/**
 * Convert storage format (English) to internal format (Portuguese)
 */
const fromStorageFormat = (params: SearchParameters): InternalSearchParameters => {
  return {
    queries: params.queries.map(q => ({
      valor: q.value,
      metadado: q.operator
    })),
    anoDe: params.yearFrom,
    anoAte: params.yearTo,
    authors: params.authors,
    titles: params.titles,
    venues: params.venues,
    excludeAuthors: params.excludeAuthors,
    excludeTitles: params.excludeTitles,
    excludeVenues: params.excludeVenues,
    bibliotecas: params.libraries,
  };
};

/**
 * Get all saved searches from localStorage
 */
export const getSavedSearches = (): SavedSearch[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const storage: SavedSearchesStorage = JSON.parse(data);
    return storage.searches || [];
  } catch (error) {
    console.error("Error loading saved searches:", error);
    return [];
  }
};

/**
 * Save a new search with a custom label
 */
export const saveSearch = (
  customLabel: string,
  searchParameters: InternalSearchParameters
): SavedSearch => {
  try {
    const searches = getSavedSearches();

    // Check if a search with this ID (customLabel) already exists
    const existingSearch = searches.find(s => s.id === customLabel);
    if (existingSearch) {
      throw new Error("A search with this name already exists. Please choose a different name.");
    }

    const newSearch: SavedSearch = {
      id: customLabel,
      timestamp: new Date().toISOString(),
      searchParameters: toStorageFormat(searchParameters),
    };

    searches.unshift(newSearch); // Add to beginning of array

    const storage: SavedSearchesStorage = {
      searches,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    return newSearch;
  } catch (error) {
    console.error("Error saving search:", error);
    throw error;
  }
};

/**
 * Update the custom label of an existing search
 */
export const updateSearchLabel = (id: string, newLabel: string): void => {
  try {
    const searches = getSavedSearches();

    // Check if new label already exists (and it's not the same search)
    const existingSearch = searches.find(s => s.id === newLabel && s.id !== id);
    if (existingSearch) {
      throw new Error("A search with this name already exists. Please choose a different name.");
    }

    const searchIndex = searches.findIndex((s) => s.id === id);

    if (searchIndex === -1) {
      throw new Error("Search not found");
    }

    searches[searchIndex].id = newLabel;

    const storage: SavedSearchesStorage = {
      searches,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error("Error updating search label:", error);
    throw error;
  }
};

/**
 * Delete a saved search by ID
 */
export const deleteSearch = (id: string): void => {
  try {
    const searches = getSavedSearches();
    const filteredSearches = searches.filter((s) => s.id !== id);

    const storage: SavedSearchesStorage = {
      searches: filteredSearches,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error("Error deleting search:", error);
    throw error;
  }
};

/**
 * Get a single saved search by ID
 */
export const getSearchById = (id: string): SavedSearch | null => {
  try {
    const searches = getSavedSearches();
    return searches.find((s) => s.id === id) || null;
  } catch (error) {
    console.error("Error getting search:", error);
    return null;
  }
};

/**
 * Get search parameters in internal format (for loading into UI)
 */
export const getSearchParametersForUI = (id: string): InternalSearchParameters | null => {
  try {
    const search = getSearchById(id);
    if (!search) return null;
    return fromStorageFormat(search.searchParameters);
  } catch (error) {
    console.error("Error getting search parameters:", error);
    return null;
  }
};

/**
 * Clear all saved searches
 */
export const clearAllSearches = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing searches:", error);
    throw error;
  }
};

/**
 * Export all saved searches as JSON string
 */
export const exportSearches = (): string => {
  const searches = getSavedSearches();
  return JSON.stringify(searches, null, 2);
};

/**
 * Import searches from JSON string
 */
export const importSearches = (jsonString: string): void => {
  try {
    const importedSearches: SavedSearch[] = JSON.parse(jsonString);
    const existingSearches = getSavedSearches();

    // Merge and remove duplicates based on ID
    const mergedSearches = [...importedSearches, ...existingSearches];
    const uniqueSearches = mergedSearches.filter(
      (search, index, self) => index === self.findIndex((s) => s.id === search.id)
    );

    const storage: SavedSearchesStorage = {
      searches: uniqueSearches,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error("Error importing searches:", error);
    throw error;
  }
};
