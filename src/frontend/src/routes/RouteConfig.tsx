import { ArticlesList, ConfigurationPage, FavoritesPage, HistoryPage, MainPage, EditSearchPage } from "../pages";
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
  // articlePage: { path: "listaartigos", element: <ArticlesList /> },
  editSearchPage: { path: "editar", element: <EditSearchPage /> },
});

// Return the root path (ex: / or /en)
export const Root = (lang: string = langDefault) => {
  return "/";
};
