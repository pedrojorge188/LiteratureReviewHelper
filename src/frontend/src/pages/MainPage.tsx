import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { getArticles } from "../store/ducks/home/thunks";
import { useDispatch } from "react-redux";
import { SearchRequestPayload, SearchResponseDto } from "./types";
import { ArticlesList } from "./ArticlesList";
import { LoadingCircle } from "../components/shared";
import { ChipInput } from "../components/shared/ChipInput";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { SaveDialog } from "../components/SaveDialog";
import { ImportDialog } from "../components/ImportDialog";
import { saveSearch } from "../utils/localStorage";
import { SavedSearch } from "./types";

interface Query {
  valor: string;
  metadado?: string;
}

export const MainPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const [queries, setQueries] = useState<Query[]>([{ valor: "" }]);
  const [anoDe, setAnoDe] = useState<string>("");
  const [anoAte, setAnoAte] = useState<string>("");
  const [authors, setAuthors] = useState<string[]>([]);
  const [venues, setVenues] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  const [excludeAuthors, setExcludeAuthors] = useState<string[]>([]);
  const [excludeVenues, setExcludeVenues] = useState<string[]>([]);
  const [excludeTitles, setExcludeTitles] = useState<string[]>([]);
  const [bibliotecaSelecionada, setBibliotecaSelecionada] =
    useState<string>("");
  const [bibliotecas, setBibliotecas] = useState<string[]>([]);
  const [showList, setShowList] = useState(false);
  const [response, setResponse] = useState<SearchResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState<string>("");

  const toParam = (values: string[]) =>
    values.length ? values.join(";") : undefined;

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
    }
  };

  const removerBiblioteca = (nome: string) => {
    setBibliotecas(bibliotecas.filter((b) => b !== nome));
  };

  const guardar = () => {
    // Open the save dialog instead of just logging
    setSaveError("");
    setIsSaveDialogOpen(true);
  }

  const handleSaveSearch = (customLabel: string) => {
    try {
      const searchParameters = {
        queries,
        anoDe,
        anoAte,
        authors,
        venues,
        titles,
        excludeAuthors,
        excludeVenues,
        excludeTitles,
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
        setSaveError(t("home:search_save_error") || "Error saving search. Please try again.");
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
    setAuthors(params.authors || []);
    setVenues(params.venues || []);
    setTitles(params.titles || []);
    setExcludeAuthors(params.excludeAuthors || []);
    setExcludeVenues(params.excludeVenues || []);
    setExcludeTitles(params.excludeTitles || []);
    setBibliotecas(params.libraries || []);
    setIsImportDialogOpen(false);
  };

  const pesquisar = async () => {
    setIsLoading(true);

    const baseQuery = queries
      .map((q, i) => (i === 0 ? q.valor : `${q.metadado} ${q.valor}`))
      .join(" ")
      .trim();

    const payload: SearchRequestPayload = {
      query: baseQuery || undefined,
      apiList: "SPRINGER=0c2c20ce9ca00510e69e0bd7ffba864e",
      author: toParam(authors),
      venue: toParam(venues),
      title: toParam(titles),

      exclude_author: toParam(excludeAuthors),
      exclude_venue: toParam(excludeVenues),
      exclude_title: toParam(excludeTitles),

      year_start: anoDe || undefined,
      year_end: anoAte || undefined,
    };

    try {
      const resultAction = await dispatch(getArticles(payload));

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
        setAuthors(params.authors || "");
        setVenues(params.venues || "");
        setTitles(params.titles || "");
        setExcludeAuthors(params.authors || "");
        setExcludeVenues(params.excluirVenues || "");
        setExcludeTitles(params.excluirTitulos || "");
        setBibliotecas(params.bibliotecas || []);
        sessionStorage.removeItem("loadedSearch");
      } catch (error) {
        console.error("Error loading search from history:", error);
      }
    }
  }, []);

  useEffect(() => { }, [showList]);

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
        className={`container-article ${showList && response ? "show" : "hide"
          }`}
      >
        {response && <ArticlesList response={response} setShow={setShowList} />}
      </div>

      <div
        className={`pesquisa-container ${(showList && response) || isLoading ? "hide-pesquisa" : ""
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
            <div className="container-bts">
              <button type="button" onClick={() => { }}>
                Importar Query
              </button>
              <button type="button" onClick={() => { }}>
                Importar Ficheiro
              </button>
            </div>

            {/* Import Button below queries */}
            <div className="import-button-container">
              <button type="button" onClick={handleImport}>
                {t("home:importar") || "Import"}
              </button>
            </div>
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

          {/* Filtros por ano, venue e autor */}
          <div className="section">
            <Typography variant="body1" sx={{ mb: 1 }}>
              <Trans
                i18nKey="home:hint_press_enter"
                components={{ bold: <b /> }}
              />
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              {/* Row 1: Authors */}
              <ChipInput
                label={t("home:label_authors")}
                placeholder={t("home:placeholder_authors")}
                values={authors}
                setValues={setAuthors}
              />
              <ChipInput
                label={t("home:label_exclude_authors")}
                placeholder={t("home:placeholder_exclude_authors")}
                values={excludeAuthors}
                setValues={setExcludeAuthors}
              />

              {/* Row 2: Venues */}
              <ChipInput
                label={t("home:label_venues")}
                placeholder={t("home:placeholder_venues")}
                values={venues}
                setValues={setVenues}
              />
              <ChipInput
                label={t("home:label_exclude_venues")}
                placeholder={t("home:placeholder_exclude_venues")}
                values={excludeVenues}
                setValues={setExcludeVenues}
              />

              {/* Row 3: Titles */}
              <ChipInput
                label={t("home:label_titles")}
                placeholder={t("home:placeholder_titles")}
                values={titles}
                setValues={setTitles}
              />
              <ChipInput
                label={t("home:label_exclude_titles")}
                placeholder={t("home:placeholder_exclude_titles")}
                values={excludeTitles}
                setValues={setExcludeTitles}
              />
            </Box>
          </div>

          {/* Bibliotecas */}
          <div className="section">
            <label>{t("home:label_libraries")}</label>
            <div className="biblioteca-row">
              <select
                value={bibliotecaSelecionada}
                onChange={(e) => setBibliotecaSelecionada(e.target.value)}
              >
                <option value="">{t("home:select_library")}</option>
                <option value="Scopus">Scopus</option>
                <option value="ACM">ACM</option>
                <option value="DBLP">DBLP</option>
              </select>
              <button type="button" onClick={adicionarBiblioteca}>
                {t("home:botao_adicionar")}
              </button>
            </div>

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
          </div>

          {/* Botões principais */}
          <div className="actions">
            <button type="button" onClick={guardar}>
              {t("home:botao_guardar")}
            </button>
            <button type="button" onClick={pesquisar}>
              {t("home:botao_pesquisar")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
