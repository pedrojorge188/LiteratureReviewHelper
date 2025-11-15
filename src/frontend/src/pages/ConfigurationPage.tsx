import { t } from "i18next";
import { useState } from "react";

// Chave para guardar as definições das bibliotecas no localStorage
const SETTINGS_KEY = "librarySettings";

export const ConfigurationPage = () => {
  const bibliotecas = ["HAL", "ACM", "SPRINGER"];

  // --- Estado para Rows e Max Results ---
  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem("rowsPerPage") || ""
  );
  const [maxResults, setMaxResults] = useState(
    localStorage.getItem("maxResults") || ""
  );

  const handleSaveRows = () => {
    localStorage.setItem("rowsPerPage", rowsPerPage);
    // alert(t("configurations:alerts.rowsSaved"));
  };

  const handleSaveMaxResults = () => {
    localStorage.setItem("maxResults", maxResults);
    // alert(t("configurations:alerts.maxResultsSaved"));
  };

  const handleSaveTop = () => {
    handleSaveMaxResults();
    handleSaveRows();
    // alert(t("configurations:alerts.maxResultsSaved"));
    <InfoDialog isOpen={} title={} message={} onClose={} duration={3000} />;
  };

  // --- Nova Lógica para Definições das Bibliotecas ---

  const getInitialSettings = () => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    let parsedSettings: any = {};

    if (savedSettings) {
      try {
        parsedSettings = JSON.parse(savedSettings);
      } catch (e) {
        console.error(t("configurations:errors.loadSettings"), e);
      }
    }

    const initialState: any = {};
    bibliotecas.forEach((lib) => {
      initialState[lib] = parsedSettings[lib] || {
        token: "",
        noToken: false,
      };
    });
    return initialState;
  };

  const [settings, setSettings] = useState(getInitialSettings);

  const handleTokenChange = (libName: any, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [libName]: { ...prev[libName], token: value },
    }));
  };

  const handleCheckboxChange = (libName: any, checked: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [libName]: {
        ...prev[libName],
        noToken: checked,
        token: checked ? "" : prev[libName].token,
      },
    }));
  };

  const handleSaveSettings = (libName: any) => {
    const allSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    const updatedSettings = {
      ...allSettings,
      [libName]: settings[libName],
    };

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    // Usa interpolação para passar a variável para o i18n
    alert(
      t("configurations:alerts.librarySettingsSaved", { libName: libName })
    );
  };

  return (
    <>
      <div className="pagina-bibliotecas">
        <h3>{t("configurations:title")}</h3>

        {/* Secção para Rows e Max Results */}
        <section className="section__top">
          <div className="rows-container">
            <div className="rows-container__label">
              {t("configurations:labels.rowsPerPage")}
            </div>
            <div className="rows-container__input">
              <input
                type="number"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(e.target.value)}
              />
            </div>
          </div>
          <div className="deep-container">
            <div className="deep-container__label">
              {t("configurations:labels.maxResults")}
            </div>
            <div className="deep-container__input">
              <input
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(e.target.value)}
              />
            </div>
          </div>
          <div className="save-container">
            <button
              onClick={() => {
                handleSaveTop();
              }}
            >
              {t("configurations:buttons.save")}
            </button>
          </div>
        </section>
        <hr />
        {/* Secção para a Lista de Bibliotecas */}
        <section className="section">
          <h3 className="bibliotecas-lista-titulo">
            {t("home:lista_bibliotecas")}
          </h3>
          <ul className="bibliotecas-lista">
            {bibliotecas.map((b, i) => (
              <li key={i}>
                <span>{b}</span> {/* Nomes (HAL, ACM) mantidos como IDs */}
                <label style={{ marginLeft: "10px" }}>
                  <input
                    type="checkbox"
                    checked={settings[b]?.noToken || false}
                    onChange={(e) => handleCheckboxChange(b, e.target.checked)}
                  />{" "}
                  {t("configurations:labels.noTokenNeeded")}
                </label>
                <input
                  type="text"
                  placeholder={t("configurations:placeholders.insertToken")}
                  style={{ marginLeft: "10px" }}
                  value={settings[b]?.token || ""}
                  onChange={(e) => handleTokenChange(b, e.target.value)}
                  disabled={settings[b]?.noToken}
                />
                <div className="details">
                  <button
                    type="button"
                    className="details-btn"
                    onClick={() => handleSaveSettings(b)}
                  >
                    <span className="details-btn__text">
                      {t("configurations:buttons.save")}
                    </span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
};
