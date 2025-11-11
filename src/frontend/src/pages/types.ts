export interface Artigo {
  title: string;
  authors: string;
  publicationYear: number;
  venue: string;
  link: string;
  source: string;
}

export enum Engines {
  ACM = 'ACM',
  HAL = 'HAL',
  SPRINGER = 'SPRINGER'
}

export interface SearchResponseDto {
  query: string;
  totalArticles: number;
  articlesByEngine: Record<Engines, number>;
  articles: Artigo[];
}

// Saved Search Types for localStorage
export interface Query {
  value: string;
  operator?: string;
}

export interface SearchParameters {
  queries: Query[];
  yearFrom: string;
  yearTo: string;
  excludeVenues: string;
  excludeTitles: string;
  libraries: string[];
}

export interface SavedSearch {
  id: string;
  customLabel: string;
  timestamp: string;
  searchParameters: SearchParameters;
}

export interface SavedSearchesStorage {
  searches: SavedSearch[];
}

