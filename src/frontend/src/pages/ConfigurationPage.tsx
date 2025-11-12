import { t } from "i18next";
import { useState } from "react"; // Precisamos disto para guardar o estado

// Chave para guardar as definições das bibliotecas no localStorage
const SETTINGS_KEY = "librarySettings";

export const ConfigurationPage = () => {
  const bibliotecas = ["HAL", "ACM", "SPRINGER"];

  // --- Estado para Rows e Max Results (da lógica anterior) ---
  const [rowsPerPage, setRowsPerPage] = useState(localStorage.getItem("rowsPerPage") || "");
  const [maxResults, setMaxResults] = useState(localStorage.getItem("maxResults") || "");

  const handleSaveRows = () => {
    localStorage.setItem("rowsPerPage", rowsPerPage);
    alert("Nº de elementos guardado!");
  };

  const handleSaveMaxResults = () => {
    localStorage.setItem("maxResults", maxResults);
    alert("Máximo de pesquisas guardado!");
  };

  // --- Nova Lógica para Definições das Bibliotecas ---

  // Função para carregar as definições do localStorage ou criar um estado inicial
  const getInitialSettings = () => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    let parsedSettings: any = {};

    if (savedSettings) {
      try {
        parsedSettings = JSON.parse(savedSettings);
      } catch (e) {
        console.error("Erro ao ler definições das bibliotecas:", e);
      }
    }

    // Garante que todas as bibliotecas têm uma entrada
    const initialState: any = {};
    bibliotecas.forEach((lib) => {
      initialState[lib] = parsedSettings[lib] || {
        token: "",
        noToken: false,
      };
    });
    return initialState;
  };

  // Estado para guardar as definições (ex: { HAL: { token: 'abc', noToken: false } })
  const [settings, setSettings] = useState(getInitialSettings);

  // Atualiza o token para uma biblioteca específica no estado
  const handleTokenChange = (libName: any, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [libName]: { ...prev[libName], token: value },
    }));
  };

  // Atualiza a checkbox para uma biblioteca específica no estado
  const handleCheckboxChange = (libName: any, checked: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [libName]: {
        ...prev[libName],
        noToken: checked,
        token: checked ? "" : prev[libName].token, // Limpa o token se "não precisa"
      },
    }));
  };

  // Guarda as definições de UMA biblioteca no localStorage
  const handleSaveSettings = (libName: any) => {
    // 1. Lê o objeto completo que está em storage
    const allSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");

    // 2. Atualiza apenas a entrada para esta biblioteca com os dados do estado
    const updatedSettings = {
      ...allSettings,
      [libName]: settings[libName],
    };

    // 3. Guarda o objeto completo de volta no storage
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    alert(`Definições para ${libName} guardadas!`);
  };

  return (
    <>
      <div className="pagina-bibliotecas">
        <h3>{t("home:label_bibliotecas")}</h3>

        {/* Secção para Rows e Max Results */}
        <section className="section">
          {/* ... (código do deep e rows) ... */}
          <div className="rows-container">
            <div className="rows-container__label">Nº Elementos por pagina</div>
            <div className="rows-container__input">
              <input type="number" value={rowsPerPage} onChange={(e) => setRowsPerPage(e.target.value)} />
            </div>
            <button onClick={handleSaveRows}>Guardar</button>
          </div>
          <div className="deep-container">
            <div className="deep-container__label">Max de Pesquisas por Biblioteca</div>
            <div className="deep-container__input">
              <input type="number" value={maxResults} onChange={(e) => setMaxResults(e.target.value)} />
            </div>
            <button onClick={handleSaveMaxResults}>Guardar</button>
          </div>
        </section>

        {/* Secção para a Lista de Bibliotecas (Modificada) */}
        <section className="section">
          <h3 className="bibliotecas-lista-titulo">{t("home:lista_bibliotecas")}</h3>
          <ul className="bibliotecas-lista">
            {bibliotecas.map((b, i) => (
              <li key={i}>
                <span>{b}</span>

                {/* Checkbox controlada pelo estado */}
                <label style={{ marginLeft: "10px" }}>
                  <input type="checkbox" checked={settings[b]?.noToken || false} onChange={(e) => handleCheckboxChange(b, e.target.checked)} /> Não precisa de
                  token
                </label>

                {/* Input de texto controlado pelo estado */}
                <input
                  type="text"
                  placeholder="Inserir token"
                  style={{ marginLeft: "10px" }}
                  value={settings[b]?.token || ""}
                  onChange={(e) => handleTokenChange(b, e.target.value)}
                  // Desativa o input se a checkbox "não precisa" estiver marcada
                  disabled={settings[b]?.noToken}
                />

                {/* Botão para guardar as definições desta biblioteca */}
                <button type="button" className="remove-btn" onClick={() => handleSaveSettings(b)}>
                  Guardar
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
};
