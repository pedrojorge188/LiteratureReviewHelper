import {
  ArticlesList,
  FavoritesPage,
  HistoryPage,
  LibrariesPage,
  MainPage,
} from "../pages";
import { CredentialsLibPage } from "../pages/CredentialsLibPage";
import { SearchStatisticsPage } from "../pages/SearchStatisticsPage";
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
  libListPage: { path: "listabibliotecas", element: <LibrariesPage /> },
  credPage: { path: "credenciaisBiblioteca", element: <CredentialsLibPage /> },
  statsPage: { path: "statsPage", element: <SearchStatisticsPage /> }, //Development purposes
  // articlePage: { path: "listaartigos", element: <ArticlesList /> },
});

// Return the root path (ex: / or /en)
export const Root = (lang: string = langDefault) => {
  return "/";
};
