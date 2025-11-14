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

