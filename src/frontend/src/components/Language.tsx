import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ApplicationState } from "../store";
import { ILanguageLink } from "../store/ducks/home/types";
import { getCurrentPathAllLangs } from "../utils";
import { setLang } from "../store/ducks/home";
import { CommonLink } from "./shared";

export const Language = () => {
  const dispatch = useDispatch();
  const { lang } = useSelector((state: ApplicationState) => state.HOME);
  const [links, setLinks] = useState([] as ILanguageLink[]);

  useEffect(() => {
    const langLinks = getCurrentPathAllLangs();
    if (langLinks.length > 0 && langLinks !== links) setLinks(langLinks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, window.location.pathname]);

  const changeLanguage = (langSelected: string) => {
    dispatch(setLang(langSelected)); // atualiza o estado global
  };

  return (
    <div className="languages">
      {links?.map((linkItem: ILanguageLink, index: number) => {
        const { language, link } = linkItem;
        return (
          <CommonLink
            title={language === "pt" ? "Portugues" : "Ingles"}
            link={{ external: false, url: link }}
            linkClass={`lang-item ${language === lang ? "selected" : ""}`}
            onClick={() => changeLanguage(language)}
            key={index}
          >
            <span>{language}</span>
          </CommonLink>
        );
      })}
    </div>
  );
};
