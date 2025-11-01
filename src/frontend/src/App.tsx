import "./styles/App.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation, Outlet, useMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import "./styles/App.scss";
import { TopMenu } from "./components/TopMenu";
import { SideMenu } from "./components";
import { ApplicationState } from "./store";

function App() {
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const { lang, homeDataLoaded, navbarDataLoaded } = useSelector(
    (state: ApplicationState) => state.HOME
  );

  useEffect(() => {
    i18n.changeLanguage(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Let the document know when the mouse is being used
  document.body.addEventListener("mousedown", function () {
    document.body.classList.add("using-mouse");
  });

  // Re-enable focus styling when Tab is pressed
  document.body.addEventListener("keydown", function () {
    document.body.classList.remove("using-mouse");
  });

  return (
    <div className="main">
      <div className="main__top">
        <TopMenu />
      </div>
      <main id="mainContent" className="main__bottom">
        <div className="main__bottom__menu-left">
          <SideMenu />
        </div>
        <div className="main__bottom__menu-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default App;
