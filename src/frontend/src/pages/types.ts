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
  duplicatedResultsRemoved: number;
  articles: Artigo[];
}

export interface SearchRequestPayload {
  query: string | undefined;
  apiList: string;

  author?: string;
  venue?: string;
  title?: string;

  exclude_author?: string;
  exclude_venue?: string;
  exclude_title?: string;

  year_start?: string;
  year_end?: string;

  start?: number;
  rows?: number;
  wt?: string;
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
  authors: string[];
  titles: string[];
  venues: string[];
  excludeAuthors: string[];
  excludeVenues: string[];
  excludeTitles: string[];
  libraries: string[];
}

export interface SavedSearch {
  id: string;
  timestamp: string;
  searchParameters: SearchParameters;
}

export interface SavedSearchesStorage {
  searches: SavedSearch[];
}

