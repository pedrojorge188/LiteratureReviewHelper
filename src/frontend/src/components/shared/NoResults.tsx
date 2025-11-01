
import { useTranslation } from "react-i18next";

export const NoResults = () => {
  const { t } = useTranslation();

  return (
    <div className="no-results">
      
      <span className="no-results__title">{t("general:noResults")}</span>
      <span className="no-results__subTitle">{t("general:noResultsLabel")}</span>
    </div>
  );
};
