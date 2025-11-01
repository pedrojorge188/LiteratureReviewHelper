import { Link } from "react-router-dom";
import "../../assets/i18n";
import { useTranslation } from "react-i18next";
import { CommonLinkProps } from "./types";

export const CommonLink = (props: CommonLinkProps) => {
  const { t } = useTranslation();
  const {
    link,
    title,
    children,
    linkClass,
    onClick,
    onMouseOver,
    onMouseLeave,
  } = props;

  const getLink = (url: string) => {
    return url.indexOf("?") !== -1 ? url : { pathname: url };
  };

  return (
    <>
      {link.external ? (
        <a
          href={link.url}
          className={linkClass}
          title={t("general:goTo") + ` ${title}`}
          target="_blank"
          onClick={onClick}
          onMouseOver={onMouseOver}
          onMouseLeave={onMouseLeave}
          rel="noreferrer"
        >
          {children}
        </a>
      ) : (
        <Link
          to={getLink(link?.url || "")}
          className={linkClass}
          title={t("general:goTo") + ` ${title}`}
          target="_self"
          onClick={onClick}
          onMouseOver={onMouseOver}
          onMouseLeave={onMouseLeave}
        >
          {children}
        </Link>
      )}
    </>
  );
};
