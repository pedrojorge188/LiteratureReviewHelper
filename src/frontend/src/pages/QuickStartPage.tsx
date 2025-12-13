import { useTranslation } from "react-i18next";
import { QuickStartSlider } from "../components/QuickStartSlider";

export const QuickStartPage = () => {
  const { t } = useTranslation();
  return (
    <div className={'container-quickstart'}>
      <h3>{t("quickstart:title")}</h3>
      <QuickStartSlider />
    </div>
  );
};
