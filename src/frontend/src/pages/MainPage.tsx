import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getArticles } from "../store/ducks/home/thunks";
import { useDispatch } from "react-redux";
import { SearchResponseDto } from "./types";
import { ArticlesList } from "./ArticlesList";
import { LoadingCircle } from "../components/shared";
import { SaveDialog } from "../components/SaveDialog";
import { ImportDialog } from "../components/ImportDialog";
import { saveSearch } from "../utils/localStorage";
import { SavedSearch } from "./types";

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

export const MainPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const [queries, setQueries] = useState<Query[]>([{ valor: "" }]);
  const [anoDe, setAnoDe] = useState<string>("");
  const [anoAte, setAnoAte] = useState<string>("");
  const [excluirVenues, setExcluirVenues] = useState<string>("");
  const [excluirTitulos, setExcluirTitulos] = useState<string>("");
  const [bibliotecaSelecionada, setBibliotecaSelecionada] =
    useState<string>("");
  const [bibliotecas, setBibliotecas] = useState<string[]>([]);
  const [showList, setShowList] = useState(false);
  const [response, setResponse] = useState<SearchResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState<string>("");
  const [apiError, setApiError] = useState(false);
  const SETTINGS_KEY = "librarySettings";
  const [apiSettings, setApiSettings] = useState<ApiSettings>({});

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

      saveSearch(customLabel, searchParameters);
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

  const handleImport = () => {
    setIsImportDialogOpen(true);
  };

  const handleLoadSearch = (search: SavedSearch) => {
    const params = search.searchParameters;
    // Convert from English storage format to Portuguese UI format
    const convertedQueries = params.queries.map((q, i) => {
      if (i === 0) {
        return { valor: q.value };
      }
      return { valor: q.value, metadado: q.operator };
    });

    setQueries(convertedQueries);
    setAnoDe(params.yearFrom || "");
    setAnoAte(params.yearTo || "");
    setExcluirVenues(params.excludeVenues || "");
    setExcluirTitulos(params.excludeTitles || "");
    setBibliotecas(params.libraries || []);
    setIsImportDialogOpen(false);
  };

  const pesquisar = async () => {
    // Validate that at least one API is selected
    if (bibliotecas.length === 0) {
      setApiError(true);
      return;
    }

    setApiError(false);
    setIsLoading(true);
    const queryString = queries
      .map((q, i) => (i === 0 ? q.valor : `${q.metadado} ${q.valor}`))
      .join(" ");

    // Build the source parameter from selected bibliotecas
    const sourceParam = bibliotecas.join(",");

    // Constrói dinamicamente o parâmetro apiList
    const apiListParam = bibliotecas
      .filter((libName) => {
        // 1. Encontra a configuração da biblioteca selecionada
        const settings = apiSettings[libName];
        // 2. Filtra: Mantém apenas se a configuração existir E tiver um token
        return settings && settings.token && settings.token.length > 0;
      })
      .map((libNameWithToken) => {
        // 3. Formata como "CHAVE=VALOR" (ex: "SPRINGER=0c2c2...")
        return `${libNameWithToken}=${apiSettings[libNameWithToken].token}`;
      })
      .join(","); // 4. Junta tudo com vírgulas

    try {
      const resultAction = await dispatch(
        getArticles({
          query: queryString,
          apiList: apiListParam,
          source: sourceParam,
        })
      );

      if (getArticles.fulfilled.match(resultAction)) {
        setResponse(resultAction.payload as SearchResponseDto);
        setShowList(true);
      } else {
        console.error("Erro na pesquisa:", resultAction.error);
      }
    } catch (error) {
      console.error("Erro geral na pesquisa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load search parameters from sessionStorage if coming from HistoryPage
  useEffect(() => {
    const loadedSearch = sessionStorage.getItem("loadedSearch");
    if (loadedSearch) {
      try {
        const params = JSON.parse(loadedSearch);
        setQueries(params.queries || [{ valor: "" }]);
        setAnoDe(params.anoDe || "");
        setAnoAte(params.anoAte || "");
        setExcluirVenues(params.excluirVenues || "");
        setExcluirTitulos(params.excluirTitulos || "");
        setBibliotecas(params.bibliotecas || []);
        sessionStorage.removeItem("loadedSearch");
      } catch (error) {
        console.error("Error loading search from history:", error);
      }
    }
  }, []);

  return (
    <>
      {isLoading && <LoadingCircle />}

      <SaveDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveSearch}
        externalError={saveError}
      />

      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onLoad={handleLoadSearch}
      />

      <div
        className={`container-article ${
          showList && response ? "show" : "hide"
        }`}
      >
        {response && <ArticlesList response={response} setShow={setShowList} />}
      </div>

      <div
        className={`pesquisa-container ${
          (showList && response) || isLoading ? "hide-pesquisa" : ""
        }`}
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

            {/* Import Button below queries */}
            {/* <div className="import-button-container">
              <button type="button" onClick={handleImport}>
                {t("home:importar") || "Import"}
              </button>
            </div> */}
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
              <button type="button" onClick={handleImport}>
                {t("home:importar") || "Import"}
              </button>
              <button type="button" onClick={guardar}>
                {t("home:botao_guardar")}
              </button>
            </div>
            <button type="button" onClick={pesquisar}>
              {t("home:botao_pesquisar")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
