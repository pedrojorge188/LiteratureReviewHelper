import { useTranslation } from "react-i18next";
import { CommonLink } from "./shared";
import { Paths } from "../routes/RouteConfig";
import { useSelector } from "react-redux";
import { ApplicationState } from "../store";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const SideMenu = () => {
  const { t, i18n } = useTranslation();
  const routes = Paths();
  const { lang } = useSelector((state: ApplicationState) => state.HOME);
  const location = useLocation();

  return (
    <>
      <div className="side-menu">
        <div className="side-menu__container">
          <div className="side-menu__container__title-container">
            <div className="side-menu__container__title-container__title-text">
              {t("sideMenu:title")}
            </div>
          </div>
          <div className="side-menu__container__content-menu">
            <div className="side-menu__container__content-menu__link-container">
              <CommonLink
                linkClass={`side-menu__container__content-menu__link-container__link ${
                  location.pathname === `/${routes.searchPage.path}`
                    ? "selected"
                    : ""
                }`}
                link={{ external: false, url: routes.searchPage.path }}
                title={t("sideMenu:search")}
              >
                {t("sideMenu:search")}
              </CommonLink>
            </div>
            <div className="side-menu__container__content-menu__link-container">
              <CommonLink
                linkClass={`side-menu__container__content-menu__link-container__link ${
                  location.pathname === `/${routes.savePage.path}`
                    ? "selected"
                    : ""
                }`}
                link={{ external: false, url: routes.savePage.path }}
                title={t("sideMenu:favorites")}
              >
                {t("sideMenu:favorites")}
              </CommonLink>
            </div>
            <div className="side-menu__container__content-menu__link-container">
              <CommonLink
                linkClass={`side-menu__container__content-menu__link-container__link ${
                  location.pathname === `/${routes.historyPage.path}`
                    ? "selected"
                    : ""
                }`}
                link={{ external: false, url: routes.historyPage.path }}
                title={t("sideMenu:history")}
              >
                {t("sideMenu:history")}
              </CommonLink>
            </div>

            <div className="side-menu__container__content-menu__link-container">
              <CommonLink
                linkClass={`side-menu__container__content-menu__link-container__link ${
                  location.pathname === `/${routes.libListPage.path}`
                    ? "selected"
                    : ""
                }`}
                link={{ external: false, url: routes.libListPage.path }}
                title={t("sideMenu:librayList")}
              >
                {t("sideMenu:librayList")}
              </CommonLink>
            </div>

            <div className="side-menu__container__content-menu__link-container">
              <CommonLink
                linkClass={`side-menu__container__content-menu__link-container__link ${
                  location.pathname === `/${routes.statsPage.path}`
                    ? "selected"
                    : ""
                }`}
                link={{ external: false, url: routes.statsPage.path }}
                title="stats"
              >
                Stats
              </CommonLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const selected = (url: string) => {};
