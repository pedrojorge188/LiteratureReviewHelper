import {
  ArticlesList,
  ConfigurationPage,
  FavoritesPage,
  HistoryPage,
  MainPage,
  QuickStartPage,
} from "../pages";
import AboutUs from "../pages/Aboutus";
import { langDefault, langDefaultRedirect, langs } from "../utils";
import { IRoute, IRoutePathLang } from "./types";

export const notFoundPath = "404";

export const mainPaths = [...langs, "/"];

export const Paths = (): IRoute => ({
  searchPage: { path: "", element: <MainPage /> },
  historyPage: {
    path: "historico",
    element: <HistoryPage />,
  },
  savePage: { path: "favoritos", element: <FavoritesPage /> },
  libListPage: { path: "configuracoes", element: <ConfigurationPage /> },
  quickStartPage: { path: "quickstart", element: <QuickStartPage /> },
  aboutuspage: { path: "sobre", element: <AboutUs /> },
});

// Return the root path (ex: / or /en)
export const Root = (lang: string = langDefault) => {
  return "/";
};
