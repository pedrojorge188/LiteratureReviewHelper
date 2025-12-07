import { TitleOption } from "../components/types";
import { Query, SavedSearch, SavedSearchesStorage, SearchParameters } from "../pages/types";

const STORAGE_FAVORITES_KEY = "literatureReviewHelper_savedSearches";
const STORAGE_HISTORY_KEY = "literatureReviewHelper_searchHistory";

// Type for internal app usage (Portuguese field names)
interface InternalSearchParameters {
  queries: Query[];
  anoDe: string;
  anoAte: string;
  authors: string[],
  venues: string[],
  excludeAuthors: string[],
  excludeVenues: string[],
  excludeTitles: string[],
  bibliotecas: string[];
  titlesToVerify: TitleOption[];
}

/**
 * Convert internal parameters (Portuguese) to storage format (English)
 */
const toStorageFormat = (params: InternalSearchParameters): SearchParameters => {
  return {
    queries: params.queries,
    yearFrom: params.anoDe,
    yearTo: params.anoAte,
    authors: params.authors,
    venues: params.venues,
    excludeAuthors: params.excludeAuthors,
    excludeVenues: params.excludeVenues,
    excludeTitles: params.excludeTitles,
    libraries: params.bibliotecas,
    titlesToVerify: params.titlesToVerify
  };
};

/**
 * Convert storage format (English) to internal format (Portuguese)
 */
const fromStorageFormat = (params: SearchParameters): InternalSearchParameters => {
  return {
    queries: params.queries,
    anoDe: params.yearFrom,
    anoAte: params.yearTo,
    authors: params.authors,
    venues: params.venues,
    excludeAuthors: params.excludeAuthors,
    excludeVenues: params.excludeVenues,
    excludeTitles: params.excludeTitles,
    bibliotecas: params.libraries,
    titlesToVerify: params.titlesToVerify
  };
};

/**
 * Get all saved searches from localStorage
 */
export const getSavedSearches = (): SavedSearch[] => {
  try {
    const data = localStorage.getItem(STORAGE_FAVORITES_KEY);
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

    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(storage));
    return newSearch;
  } catch (error) {
    console.error("Error saving search:", error);
    throw error;
  }
};

export const updateSearch = (id: string, customLabel: string, searchParameters: InternalSearchParameters): void => {
  try {
    const searches = getSavedSearches();
    
    // Check if new label already exists (and it's not the same search)
    const existingSearch = searches.find(s => s.id === customLabel && s.id !== id);
    if (existingSearch) {
      throw new Error("A search with this name already exists. Please choose a different name.");
    }
    
    const searchIndex = searches.findIndex((s) => s.id === id);

    if (searchIndex === -1) {
      throw new Error("Search not found");
    }

    const updatedSearch: SavedSearch = {
      id: customLabel,
      timestamp: new Date().toISOString(),
      searchParameters: toStorageFormat(searchParameters),
    };

    searches[searchIndex] = updatedSearch;

    const storage: SavedSearchesStorage = {
      searches,
    };

    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error("Error updating search label:", error);
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

    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(storage));
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

    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(storage));
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
    localStorage.removeItem(STORAGE_FAVORITES_KEY);
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

    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error("Error importing searches:", error);
    throw error;
  }
};

/**
 * Get search history from localStorage
 */
export const getSearchHistory = (): SavedSearch[] => {
  try {
    const data = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (!data) {
      return [];
    }
    const storage: SavedSearchesStorage = JSON.parse(data);
    return storage.searches || [];
  } catch (error) {
    console.error("Error loading search history:", error);
    return [];
  }
};

/**
 * Save a new search to history.
 */
export const saveHistoryEntry = (
  searchParameters: InternalSearchParameters
): SavedSearch => {
  try {
    const searches = getSearchHistory();

    const id = new Date().toISOString();

    const newSearch: SavedSearch = {
      id,
      timestamp: new Date().toISOString(),
      searchParameters: toStorageFormat(searchParameters),
    };

    searches.unshift(newSearch);

    const storage: SavedSearchesStorage = {
      searches,
    };

    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(storage));
    return newSearch;
  } catch (error) {
    console.error("Error saving history entry:", error);
    throw error;
  }
};

/**
 * Delete a search from history.
 */
export const deleteHistoryEntry = (id: string): void => {
  try {
    const searches = getSearchHistory();
    const filteredSearches = searches.filter((s) => s.id !== id);

    const storage: SavedSearchesStorage = {
      searches: filteredSearches,
    };

    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error("Error deleting search from history:", error);
    throw error;
  }
};

/**
 * Clear all search history
 */
export const clearAllSearchHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_HISTORY_KEY);
  } catch (error) {
    console.error("Error clearing search history:", error);
    throw error;
  }
};
