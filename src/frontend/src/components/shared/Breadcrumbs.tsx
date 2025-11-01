import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Root } from "../../routes/RouteConfig";
import { ApplicationState } from "../../store";

import { CommonLink } from "./CommonLink";
import { BreadcrumbsProps } from "./types";

export const Breadcrumbs = (props: BreadcrumbsProps) => {
  const { t } = useTranslation();
  const { breadcrumbs } = props;

  const { lang } = useSelector((state: ApplicationState) => state.HOME);

  return (
    <nav className="breadcrumbs" aria-label="breadcrumbs">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <CommonLink link={{ external: false, url: Root(lang) }} title={t("general:homepage")}>
            <>{t("general:homepage")}</>
          </CommonLink>
          <span className="fa-light fa-chevron-right"></span>
        </li>
        {breadcrumbs.map((breadcrumb: any, i: number, arr: any) => {
          const { link, title } = breadcrumb;

          if (i !== arr.length - 1)
            return (
              <li className="breadcrumb-item" key={i}>
                <CommonLink link={{ external: false, url: link ? link.url : "" }} title={title}>
                  {title}
                </CommonLink>
                <span className="fa-light fa-chevron-right"></span>
              </li>
            );
          else
            return (
              <li className="breadcrumb-item active" aria-current="page" key={i}>
                <span>{title}</span>
              </li>
            );
        })}
      </ol>
    </nav>
  );
};
