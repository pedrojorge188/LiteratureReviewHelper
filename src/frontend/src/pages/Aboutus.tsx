import { useTranslation } from "react-i18next";

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <div className="about-us-container">
      <header className="about-us-header">
        <h1 className="header-title">{t("aboutUs:aboutUs.headerTitle")}</h1>
        <p className="header-subtitle">{t("aboutUs:aboutUs.headerSubtitle")}</p>
      </header>

      <section className="about-us-section mission-section">
        <h2 className="section-title">{t("aboutUs:aboutUs.missionTitle")}</h2>

        <div className="value-cards-container">
          <div className="value-card">
            <h3 className="card-title">{t("aboutUs:aboutUs.value1Title")}</h3>
            <p className="card-description">
              {t("aboutUs:aboutUs.value1Description")}
            </p>
            <p className="card-benefit">{t("aboutUs:aboutUs.value1Benefit")}</p>
          </div>

          <div className="value-card">
            <h3 className="card-title">{t("aboutUs:aboutUs.value2Title")}</h3>
            <p className="card-description">
              {t("aboutUs:aboutUs.value2Description")}
            </p>
            <p className="card-benefit">{t("aboutUs:aboutUs.value2Benefit")}</p>
          </div>

          <div className="value-card">
            <h3 className="card-title">{t("aboutUs:aboutUs.value3Title")}</h3>
            <p className="card-description">
              {t("aboutUs:aboutUs.value3Description")}
            </p>
            <p className="card-benefit">{t("aboutUs:aboutUs.value3Benefit")}</p>
          </div>
        </div>
      </section>

      <section className="about-us-section academic-section">
        <h2 className="section-title">{t("aboutUs:aboutUs.academicTitle")}</h2>
        <p className="academic-text">{t("aboutUs:aboutUs.academicContext")}</p>

        <blockquote className="academic-quote">
          {t("aboutUs:aboutUs.academicQuote")}
        </blockquote>
      </section>

      <section className="about-us-section cta-section">
        <h2 className="section-title">{t("aboutUs:aboutUs.ctaTitle")}</h2>
        <p className="cta-text">{t("aboutUs:aboutUs.ctaText")}</p>
      </section>
    </div>
  );
};

export default AboutUs;
