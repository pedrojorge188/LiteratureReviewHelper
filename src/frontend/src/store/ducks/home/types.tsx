

export interface IHomeState {
  homeData: IHomeData;
  homeDataLoaded: boolean;
  lang: string;
  langLoaded: boolean;
  navbarData?: INavbarData;
  navbarDataLoaded: boolean;
}

export interface IHomeData {
  banner: IBanner;
  alerts?: IAlerts[];
  news?: INews[];
  usefulLinks: IUtilLinks[];
  metaTags?: string;
}

export const InitialHomeData: IHomeData = {
  banner: {},
  usefulLinks: [],
};

export interface INavbarData {
  items?: INavbarItem[];
}

export interface INavbarItem {
  title?: string;
  id: number;
  link: any;
  depth?: number;
  children?: INavbarItem[];
}

export interface ILanguageLink {
  language: string;
  link: string;
}

export interface IBanner {
  title?: string;
  subtitle?: string;
}

export interface IAlerts {
  title?: string;
  link: any;
  date: string;
}

export interface INews {
  title?: string;
  image?: any[];
  date: string;
  description?: string;
  link: any;
}

export interface IUtilLinks {
  title?: string;
  seemore?: any;
  items?: IUtilLinkItem[];
}

export interface IUtilLinkItem {
  title?: string;
  link: any;
}

export interface IMeteo {
  title?: string;
  seemore: any;
  items: any; //TODO
}

export interface IServices {
  title?: string;
  seemore: any;
  items?: any; //TODO
}

export interface IInfraNumbers {
  title?: string;
  value?: string;
}

export interface IHighlights {
  title?: string;
  subtitle?: string;
  image: any;
  link: any;
}

export interface IInfraApp {
  highlightsImage?: any;
  image?: any;
  title?: string;
  description?: string;
}
