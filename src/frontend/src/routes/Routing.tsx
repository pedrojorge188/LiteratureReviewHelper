import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { ApplicationState } from "../store";
import { langDefault, readLangPathname } from "../utils";
import { Paths } from "./RouteConfig";
import { setLang } from "../store/ducks/home";
import App from "../App";
import { NotFound } from "../pages/NotFound";
import { MainPage } from "../pages";

export const Routing = () => {
  const { lang, langLoaded } = useSelector(
    (state: ApplicationState) => state.HOME
  );
  const dispatch = useDispatch<any>();
  const location = useLocation();

  useEffect(() => {
    console.log('[Routing] Current pathname:', location.pathname);
    const langSelected = readLangPathname(location.pathname);
    console.log('[Routing] Language selected:', langSelected);
    console.log('[Routing] Current lang:', lang);
    if (langSelected && langSelected !== lang) dispatch(setLang(langSelected));
    if (!langSelected && !lang) dispatch(setLang(langDefault));
  }, [lang, langLoaded, location.pathname]);

  const allRelativePaths = Paths();

  return langLoaded ? (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<MainPage />} />
        {Object.entries(allRelativePaths).map(
          ([key, { path, element }], index) => (
            <Route path={path} element={element} key={index} />
          )
        )}
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  ) : (
    <></>
  );
};
