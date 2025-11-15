export interface Artigo {
  title: string;
  authors: string[];
  publicationYear: number;
  venue: string;
  venueType: string
  link: string;
  source: string;
}

export enum Engines {
  ACM = 'ACM',
  HAL = 'HAL',
  SPRINGER = 'SPRINGER'
}

export enum Statistic {
  INPUT = 'INPUT',
  OUTPUT = "OUTPUT",
  DROPPED = "DROPPED"
}

export interface SearchResponseDto {
  query: string;
  totalArticles: number;
  articlesByEngine: Record<Engines, number>;
  duplicatedResultsRemoved: number;
  filterImpactByEngine: Record<Engines, Record<string, Record<Statistic, number>>>
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
  timestamp: string;
  searchParameters: SearchParameters;
}

export interface SavedSearchesStorage {
  searches: SavedSearch[];
}

