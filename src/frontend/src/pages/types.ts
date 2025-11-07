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
  articlesDuplicatedRemoved: number;
  articles: Artigo[];
}

