import { useTranslation } from "react-i18next";
import { useState } from "react";
import { InfoDialog, SnackbarToast } from "../components";
import { Engines } from "./types";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Tooltip from "@mui/material/Tooltip";
import { SearchResultTitlesVerification } from "../components/configuration/SearchResultTitlesVerification";

// Chave para guardar as definições das bibliotecas no localStorage
const SETTINGS_KEY = "librarySettings";

export const ConfigurationPage = () => {
  const { t } = useTranslation();
  const bibliotecas = Object.values(Engines);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const mostrarAviso = () => {
    setIsInfoOpen(true);
  };

  // --- Estado para Rows e Max Results ---
  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem("rowsPerPage") || ""
  );
  const [maxResults, setMaxResults] = useState(
    localStorage.getItem("maxResults") || ""
  );

  const handleSaveRows = () => {
    localStorage.setItem("rowsPerPage", rowsPerPage);
  };

  const handleSaveMaxResults = () => {
    localStorage.setItem("maxResults", maxResults);
  };

  const [isWarningOpen, setIsWarningOpen] = useState(false);

  const handleSaveTop = () => {
    handleSaveMaxResults();
    handleSaveRows();
    setIsInfoOpen(true);
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
    setIsInfoOpen(true);
  };

  return (
    <>
      <SnackbarToast
        messageStr={t("configurations:message")}
        open={isInfoOpen}
        setOpen={setIsInfoOpen}
        type="success"
      />
      <div className="pagina-bibliotecas">
        <h3>{t("configurations:title")}</h3>

        {/* Secção para Rows e Max Results */}
        <section className="section__top">
          <div className="rows-container">
            <div className="rows-container__label">
              <span className="rows-container__label__text">
                {t("configurations:labels.rowsPerPage")}
              </span>
              <Tooltip title={t("warnings:rowsperpage")}>
                <span className="rows-container__label__icon">
                  <HelpOutlineIcon />
                </span>
              </Tooltip>
            </div>
            <div className="rows-container__input">
              <input
                type="number"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>
          <div className="deep-container">
            <div className="deep-container__label">
              <span className="deep-container__label__text">
                {t("configurations:labels.maxResults")}
              </span>
              <Tooltip title={t("warnings:deepSearch")}>
                <span className="deep-container__label__icon">
                  <HelpOutlineIcon />
                </span>
              </Tooltip>
            </div>
            <div className="deep-container__input">
              <input
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(e.target.value)}
                placeholder="300"
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
          <div
            className="bibliotecas-titulo-wrapper"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <h3 className="bibliotecas-lista-titulo">
              {t("home:lista_bibliotecas")}
            </h3>

            {/* Ícone Help com Tooltip */}
            <Tooltip title={t("warnings:librariesTokensInfo")}>
              <span
                className="rows-container__label__icon"
                style={{ cursor: "pointer" }}
              >
                <HelpOutlineIcon />
              </span>
            </Tooltip>
          </div>

          <ul className="bibliotecas-lista">
            {bibliotecas.map((b, i) => (
              <li key={i}>
                <span>{b}</span>

                {/* Checkbox noToken */}
                <label style={{ marginLeft: "10px" }}>
                  <input
                    type="checkbox"
                    checked={settings[b]?.noToken || false}
                    onChange={(e) => handleCheckboxChange(b, e.target.checked)}
                  />{" "}
                  {t("configurations:labels.noTokenNeeded")}
                </label>

                {/* Input Token */}
                <input
                  type="text"
                  placeholder={t("configurations:placeholders.insertToken")}
                  style={{ marginLeft: "10px" }}
                  value={settings[b]?.token || ""}
                  onChange={(e) => handleTokenChange(b, e.target.value)}
                  disabled={settings[b]?.noToken}
                />

                {/* Botão Save */}
                <div className="details">
                  <button
                    type="button"
                    className="details-btn"
                    onClick={() => {
                      const requiresToken = !settings[b]?.noToken;
                      const missingToken =
                        !settings[b]?.token || settings[b]?.token.trim() === "";

                      if (requiresToken && missingToken) {
                        setIsWarningOpen(true);
                        return;
                      }

                      handleSaveSettings(b);
                    }}
                  >
                    <span className="details-btn__text">
                      {t("configurations:buttons.select")}
                    </span>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* TOAST: Warning de token em falta */}
          <SnackbarToast
            messageStr={t("configurations:alerts:token_required_warning")}
            open={isWarningOpen}
            setOpen={setIsWarningOpen}
            type="warning"
          />

          {/* Botão Reset Configurações*/}
          <div
            className="details"
            style={{ marginTop: "20px", display: "flex", alignItems: "center" }}
          >
            <button
              type="button"
              className="reset-btn"
              onClick={() => {
                const resetSettings: any = {};
                bibliotecas.forEach((lib) => {
                  resetSettings[lib] = {
                    token: "",
                    noToken: false,
                  };
                });
                setSettings(resetSettings);

                localStorage.setItem(SETTINGS_KEY, JSON.stringify(resetSettings));

                setRowsPerPage("");
                setMaxResults("");
                localStorage.removeItem("rowsPerPage");
                localStorage.removeItem("maxResults");

                setIsInfoOpen(true);
              }}
            >
              <span className="details-btn__text">
                {t("configurations:buttons.resetSettings")}
              </span>
            </button>
          </div>
        </section>
        {/* Secção para titulos */}
        <section className="section">
          <SearchResultTitlesVerification />
        </section>
      </div>
    </>
  );
};
