import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CommonLink } from "../components/shared";

export const NotFound = () => {
  const [collection, setCollection] = useState(document.getElementsByTagName("nav"));

  useEffect(() => {
    for (let i = 0; i < collection.length; i++) {
      collection[i].style.display = "none";
    }
    setTimeout(() => {
      for (let i = 0; i < collection.length; i++) {
        collection[i].style.display = "none";
      }
    }, 800);
  }, [collection]);

  useEffect(() => {
    const nav = document.querySelector("nav");

    if (nav != null) {
      nav.style.display = "none";
    }
    const footer = document.querySelector("footer");
    if (footer != null) {
      footer.style.display = "none";
    }
    if (document.querySelector<HTMLElement>(".App")) {
      document.querySelector<HTMLElement>(".App")!.style.minHeight = "100%";
    }

    return () => {
      if (nav != null) {
        nav.style.display = "inherit";
      }
      if (footer != null) {
        footer!.style.display = "block";
      }
      document.querySelector<HTMLElement>(".App")!.style.minHeight = "100vh";
    };
  });

  const { t } = useTranslation();

  return (
    <section className="not-found">
      <div className="not-found__container">
        <div className="not-found--title">
          <h1>{t("general:not_found")}</h1>
        </div>
        <div className="not-found--text">
          <p>{t("general:not_found_text")}</p>
        </div>
        <div className="not-found--way-back-home">
          <CommonLink link={{ external: false, url: "/" }} title={t("general:homepage")}>
            {t("general:not_found_button")}
          </CommonLink>
        </div>
      </div>
    </section>
  );
};
