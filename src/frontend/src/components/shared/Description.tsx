import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { ApplicationState } from "../../store";
import { CommonImage } from "./CommonImage";
import { formatDate } from "../../utils";
import { IDescription } from "./types";

export const Description = (props: IDescription) => {
  const { lang } = useSelector((state: ApplicationState) => state.HOME);
  const { sideImage, sideImageTitle, sideDescription, descriptionVariant, lastUpdate, dateFormat } = props;
  const { t } = useTranslation();

  return (
    <section id="description" className="margin-bottom__description">
      <div>
        <div className="clearfix"></div>
        {sideImage && sideImage.length > 0 && (
          <div className="side-image--generic">
            <figure>
              <CommonImage imageClass="img--generic" src={sideImage} title={sideImageTitle || "image"} />
              {sideImageTitle && <figcaption>{sideImageTitle}</figcaption>}
            </figure>
          </div>
        )}
        <div className="description--generic text-indent">
          {sideDescription && (
            <div
              dangerouslySetInnerHTML={{
                __html: sideDescription,
              }}
              className={descriptionVariant ? `description--${descriptionVariant}` : `description--`}
            ></div>
          )}
          {lastUpdate && (
            <span className="last-update">
              <>
                {t("general:lastUpdate")}
                {formatDate(lastUpdate, dateFormat, lang)}
              </>
            </span>
          )}
        </div>
        <div className="clearfix"></div>
      </div>
    </section>
  );
};
