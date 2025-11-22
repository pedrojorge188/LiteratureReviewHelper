import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SaveDialog } from "../components/SaveDialog";
import { updateSearch } from "../utils/localStorage";

interface Query {
  valor: string;
  metadado?: string;
}

interface ApiSetting {
  token: string;
  noToken: boolean;
}

interface ApiSettings {
  [key: string]: ApiSetting;
}

export const EditSearchPage = () => {
  const { t } = useTranslation();
  const [queries, setQueries] = useState<Query[]>([{ valor: "" }]);
  const [anoDe, setAnoDe] = useState<string>("");
  const [anoAte, setAnoAte] = useState<string>("");
  const [excluirVenues, setExcluirVenues] = useState<string>("");
  const [excluirTitulos, setExcluirTitulos] = useState<string>("");
  const [bibliotecaSelecionada, setBibliotecaSelecionada] =
    useState<string>("");
  const [bibliotecas, setBibliotecas] = useState<string[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState<string>("");
  const [apiError, setApiError] = useState(false);
  const SETTINGS_KEY = "librarySettings";
  const [apiSettings, setApiSettings] = useState<ApiSettings>({});
  const [currentLabel, setCurrentLabel] = useState("");

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings) as ApiSettings;
        setApiSettings(parsedSettings);
      } catch (error) {
        console.error("Erro ao carregar configurações das APIs:", error);
      }
    }
  }, []);

  const availableLibraries = Object.keys(apiSettings).filter((key) => {
    const settings = apiSettings[key];
    if (!settings) return false;
    // Filtra para incluir apenas se noToken=true OU se tiver um token
    return (
      settings.noToken === true || (settings.token && settings.token.length > 0)
    );
  });

  const normalizarQueries = (lista: Query[]): Query[] => {
    return lista.map((q, i) => {
      if (i === 0) {
        const { valor } = q;
        return { valor };
      }
      return { valor: q.valor, metadado: q.metadado || "AND" };
    });
  };

  const adicionarQuery = () => {
    const nova = [...queries, { valor: "", metadado: "AND" }];
    setQueries(normalizarQueries(nova));
  };

  const removerQuery = (index: number) => {
    const nova = queries.filter((_, i) => i !== index);
    setQueries(normalizarQueries(nova));
  };

  const moverQueryCima = (index: number) => {
    if (index === 0) return;
    const novaLista = [...queries];
    [novaLista[index - 1], novaLista[index]] = [
      novaLista[index],
      novaLista[index - 1],
    ];
    setQueries(normalizarQueries(novaLista));
  };

  const atualizarQuery = (index: number, campo: keyof Query, valor: string) => {
    const novaLista = [...queries];
    novaLista[index][campo] = valor;
    setQueries(normalizarQueries(novaLista));
  };

  const adicionarBiblioteca = () => {
    if (bibliotecaSelecionada && !bibliotecas.includes(bibliotecaSelecionada)) {
      setBibliotecas([...bibliotecas, bibliotecaSelecionada]);
      setBibliotecaSelecionada("");
      setApiError(false);
    }
  };

  const removerBiblioteca = (nome: string) => {
    setBibliotecas(bibliotecas.filter((b) => b !== nome));
  };

  const guardar = () => {
    // Open the save dialog instead of just logging
    setSaveError("");
    setIsSaveDialogOpen(true);
  };

  const handleSaveSearch = (customLabel: string) => {
    try {
      const searchParameters = {
        queries,
        anoDe,
        anoAte,
        excluirVenues,
        excluirTitulos,
        bibliotecas,
      };

      updateSearch(currentLabel, customLabel, searchParameters);
      setIsSaveDialogOpen(false);
      setSaveError("");
    } catch (error) {
      console.error("Error saving search:", error);
      // Set error message to be displayed in the dialog
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError(
          t("home:search_save_error") ||
            "Error saving search. Please try again."
        );
      }
    }
  };

  // Load search parameters from sessionStorage if coming from HistoryPage
  useEffect(() => {
    const loadedSearchLabel = sessionStorage.getItem("editableSearchLabel");
    if (loadedSearchLabel) {
      setCurrentLabel(loadedSearchLabel);
      sessionStorage.removeItem("editableSearchLabel");
    }
    const loadedSearch = sessionStorage.getItem("editableSearch");
    if (loadedSearch) {
      try {
        const params = JSON.parse(loadedSearch);
        setQueries(params.queries || [{ valor: "" }]);
        setAnoDe(params.anoDe || "");
        setAnoAte(params.anoAte || "");
        setExcluirVenues(params.excluirVenues || "");
        setExcluirTitulos(params.excluirTitulos || "");
        setBibliotecas(params.bibliotecas || []);
        sessionStorage.removeItem("editableSearch");
      } catch (error) {
        console.error("Error loading search from history:", error);
      }
    }
  }, []);

  return (
    <>
      <SaveDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveSearch}
        initialLabel={sessionStorage.getItem("editableSearchLabel") || ""}
        externalError={saveError}
      />

      <div
        className={`pesquisa-container`}
      >
        <h2>{t("home:titulo_pesquisa")}</h2>

        <div className="pesquisa-container__content">
          {/* Query Section */}
          <div className="section">
            <label>{t("home:label_query")}</label>
            {queries.map((q, index) => (
              <div key={index} className="query-row">
                {index > 0 && (
                  <select
                    value={q.metadado}
                    onChange={(e) =>
                      atualizarQuery(index, "metadado", e.target.value)
                    }
                  >
                    <option value="AND">{t("home:operador_and")}</option>
                    <option value="OR">{t("home:operador_or")}</option>
                    <option value="NOT">{t("home:operador_not")}</option>
                  </select>
                )}

                <input
                  className="query-row__input-text"
                  type="text"
                  value={q.valor}
                  placeholder={t("home:placeholder_query") ?? ""}
                  onChange={(e) =>
                    atualizarQuery(index, "valor", e.target.value)
                  }
                />

                <div className="query-buttons">
                  {index === queries.length - 1 && (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={adicionarQuery}
                      title={t("home:adicionar_query") ?? ""}
                    >
                      &#65291;
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => moverQueryCima(index)}
                      title={t("home:mover_para_cima") ?? ""}
                    >
                      &#8593;
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => removerQuery(index)}
                      title={t("home:remover_query") ?? ""}
                    >
                      &#10005;
                    </button>
                  )}
                </div>
              </div>
            ))}

          </div>

          {/* Ano de publicação */}
          <div className="section">
            <label>{t("home:label_ano_publicacao")}</label>
            <div className="ano-row">
              <select value={anoDe} onChange={(e) => setAnoDe(e.target.value)}>
                <option value="">{t("home:ano_de")}</option>
                {Array.from({ length: 30 }, (_, i) => 2025 - i).map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>

              <select
                value={anoAte}
                onChange={(e) => setAnoAte(e.target.value)}
              >
                <option value="">{t("home:ano_ate")}</option>
                {Array.from({ length: 30 }, (_, i) => 2025 - i).map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Excluir venues */}
          <div className="section">
            <label>{t("home:label_excluir_venues")}</label>
            <textarea
              value={excluirVenues}
              onChange={(e) => setExcluirVenues(e.target.value)}
              placeholder={t("home:placeholder_excluir_venues") ?? ""}
            ></textarea>
          </div>

          {/* Excluir títulos */}
          <div className="section">
            <label>{t("home:label_excluir_titulos")}</label>
            <textarea
              value={excluirTitulos}
              onChange={(e) => setExcluirTitulos(e.target.value)}
              placeholder={t("home:placeholder_excluir_titulos") ?? ""}
            ></textarea>
          </div>

          {/* Bibliotecas */}
          <div className="section">
            <label>{t("home:label_bibliotecas")}</label>
            <div className="biblioteca-row">
              <select
                value={bibliotecaSelecionada}
                onChange={(e) => setBibliotecaSelecionada(e.target.value)}
              >
                <option value="">{t("home:selecionar_biblioteca")}</option>

                {/* Opções geradas dinamicamente */}
                {availableLibraries.map((libName) => (
                  <option key={libName} value={libName}>
                    {libName}
                  </option>
                ))}
              </select>
              <button type="button" onClick={adicionarBiblioteca}>
                {t("home:botao_adicionar")}
              </button>
            </div>
            <div hidden={bibliotecas.length === 0}>
              <h3 className="bibliotecas-lista-titulo">
                {t("home:lista_bibliotecas")}
              </h3>
              <ul className="bibliotecas-lista">
                {bibliotecas.map((b, i) => (
                  <li key={i}>
                    <span>{b}</span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removerBiblioteca(b)}
                    >
                      {t("home:botao_remover")}
                    </button>
                  </li>
                ))}
              </ul>
              {apiError && bibliotecas.length === 0 && (
                <p
                  style={{ color: "red", marginTop: "10px", fontSize: "14px" }}
                >
                  {t("home:erro_selecionar_api")}
                </p>
              )}
            </div>
          </div>

          <hr hidden={bibliotecas.length > 0} />

          {/* Botões principais */}
          <div className="actions">
            <div>
              <button type="button" onClick={guardar}>
                {t("home:botao_guardar")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
