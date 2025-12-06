import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { getArticles } from "../store/ducks/home/thunks";
import { useDispatch } from "react-redux";
import {
  SearchRequestPayload,
  SearchResponseDto,
  SavedSearch,
  SearchParameters,
} from "./types";
import { ArticlesList } from "./ArticlesList";
import { LoadingCircle, CommonLink } from "../components/shared";
import { ChipInput } from "../components/shared/ChipInput";
import { Paths } from "../routes/RouteConfig";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";

import { SaveDialog } from "../components";
import { ImportDialog } from "../components";
import { SnackbarToast } from "../components";

import { Query, ApiSettings } from "./types";

import { saveSearch, saveHistoryEntry } from "../utils/localStorage";
import { buildQueryString } from "../utils/queries";
import {
  normalizeQueries,
  addQuery,
  removeQuery,
  moveQueryUp,
  updateQuery,
  loadApiSettings,
  getAvailableLibraries,
} from "../utils";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useSelector } from "react-redux";
import { setMainPageState } from "../store/ducks/mainpage";

type FilterKey =
  | "authors"
  | "excludeAuthors"
  | "venues"
  | "excludeVenues"
  | "excludeTitles";

export const MainPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const mainState = useSelector((state: any) => state.MAIN_PAGE);

  const routes = Paths();
  const [queries, setQueries] = useState<Query[]>([{ value: "" }]);
  const [anoDe, setAnoDe] = useState<string>("");
  const [anoAte, setAnoAte] = useState<string>("");
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
  const [apiSettings, setApiSettings] = useState<ApiSettings>({});
  const [openToast, setOpenToast] = useState(false);
  const [openToastB, setOpenToastB] = useState(false);
  const [openToastC, setOpenToastC] = useState(false);
  const [openToastD, setOpenToastD] = useState(false);
  const [openToastE, setOpenToastE] = useState(false);
  const [showBuiltQuery, setShowBuiltQuery] = useState(false);
  const [openSearchDelayToast, setOpenSearchDelayToast] = useState(false);
  // Filter values
  const [authors, setAuthors] = useState<string[]>([]);
  const [venues, setVenues] = useState<string[]>([]);
  const [excludeAuthors, setExcludeAuthors] = useState<string[]>([]);
  const [excludeVenues, setExcludeVenues] = useState<string[]>([]);
  const [excludeTitles, setExcludeTitles] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<FilterKey[]>([]);

  const toParam = (values: string[]) =>
    values.length ? values.join(";") : undefined;

  useEffect(() => {
    setApiSettings(loadApiSettings());
  }, []);

  const availableLibraries = getAvailableLibraries(apiSettings);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isLoading) {
      interval = setInterval(() => {
        setOpenSearchDelayToast(true);
      }, 10000); // 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const adicionarQuery = () => {
    setQueries(addQuery(queries));
  };

  const removerQuery = (index: number) => {
    setQueries(removeQuery(queries, index));
  };

  const moverQueryCima = (index: number) => {
    setQueries(moveQueryUp(queries, index));
  };

  const atualizarQuery = (index: number, campo: keyof Query, valor: string) => {
    setQueries(updateQuery(queries, index, campo, valor));
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
    setSaveError("");
    setIsSaveDialogOpen(true);
  };

  const handleSaveSearch = (customLabel: string) => {
    try {
      const searchParameters = {
        queries,
        anoDe,
        anoAte,
        authors,
        venues,
        excludeAuthors,
        excludeVenues,
        excludeTitles,
        bibliotecas,
      };

      saveSearch(customLabel, searchParameters);
      setIsSaveDialogOpen(false);
      setSaveError("");
      setOpenToastC(true);
    } catch (error) {
      console.error("Error saving search:", error);
      setOpenToastD(false);
      // Set error message to be displayed in the dialog
      if (error instanceof Error) {
        setSaveError(error.message);
        setOpenToastD(false);
      } else {
        setSaveError(
          t("home:search_save_error") ||
            "Error saving search. Please try again."
        );
        setOpenToastD(false);
      }
    }
  };

  const handleImport = () => {
    setIsImportDialogOpen(true);
  };

  const inferSelectedFilters = (params: SearchParameters): FilterKey[] => {
    const result: FilterKey[] = [];
    if ((params.authors || []).length) result.push("authors");
    if ((params.excludeAuthors || []).length) result.push("excludeAuthors");
    if ((params.venues || []).length) result.push("venues");
    if ((params.excludeVenues || []).length) result.push("excludeVenues");
    if ((params.excludeTitles || []).length) result.push("excludeTitles");
    return result;
  };

  const handleLoadSearch = (search: SavedSearch) => {
    const params = search.searchParameters;

    const convertedQueries = params.queries.map((q, i) =>
      i === 0 ? { value: q.value } : { value: q.value, operator: q.operator }
    );
    setQueries(convertedQueries);
    setAnoDe(params.yearFrom || "");
    setAnoAte(params.yearTo || "");
    setAuthors(params.authors || []);
    setVenues(params.venues || []);
    setExcludeAuthors(params.excludeAuthors || []);
    setExcludeTitles(params.excludeTitles || []);
    setExcludeVenues(params.excludeVenues || []);
    setBibliotecas(params.libraries || []);
    setSelectedFilters(inferSelectedFilters(params));
    setIsImportDialogOpen(false);
    setOpenToastE(true);
  };

  const isFilterActive = (key: FilterKey) => selectedFilters.includes(key);

  // MULTI-SELECT: update selected filters and clear values for deselected ones
  const handleFilterMultiChange = (event: SelectChangeEvent<FilterKey[]>) => {
    const value = event.target.value as FilterKey[]; // new selection
    const removed = selectedFilters.filter((f) => !value.includes(f));

    // Clear values for filters that were removed
    removed.forEach((key) => {
      switch (key) {
        case "authors":
          setAuthors([]);
          break;
        case "excludeAuthors":
          setExcludeAuthors([]);
          break;
        case "venues":
          setVenues([]);
          break;
        case "excludeVenues":
          setExcludeVenues([]);
          break;
        case "excludeTitles":
          setExcludeTitles([]);
          break;
      }
    });

    setSelectedFilters(value);
  };

  const pesquisar = async () => {
    if (queries.length === 1 && (!queries[0].value || queries[0].value.trim() === "")) {
      setOpenToastB(true);
      return;
    }

    if (bibliotecas.length === 0) {
      setApiError(true);
      setOpenToast(true);
      return;
    }

    setApiError(false);
    setIsLoading(true);

    const queryString = buildQueryString(queries);

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
      .join(",");

    try {
      const payload: SearchRequestPayload = {
        query: queryString || undefined,
        apiList: apiListParam,
        source: sourceParam,
        author: isFilterActive("authors") ? toParam(authors) : undefined,
        venue: isFilterActive("venues") ? toParam(venues) : undefined,
        exclude_author: isFilterActive("excludeAuthors")
          ? toParam(excludeAuthors)
          : undefined,
        exclude_title: isFilterActive("excludeTitles")
          ? toParam(excludeTitles)
          : undefined,
        exclude_venue: isFilterActive("excludeVenues")
          ? toParam(excludeVenues)
          : undefined,
        year_start: anoDe || undefined,
        year_end: anoAte || undefined,
      };

      const resultAction = await dispatch(getArticles(payload));

      if (getArticles.fulfilled.match(resultAction)) {
        setResponse(resultAction.payload as SearchResponseDto);
        setShowList(true);
        
        try {
          const internalParams = {
            queries: normalizeQueries(queries),
            anoDe,
            anoAte,
            authors,
            venues,
            excludeAuthors,
            excludeTitles,
            excludeVenues,
            bibliotecas,
          };
          saveHistoryEntry(internalParams);
        } catch (err) {
          console.error("Error saving search history:", err);
        }
      } else {
        setOpenToastB(true);
        console.error("Erro na pesquisa:", resultAction.error);
      }
    } catch (error) {
      console.error("Erro geral na pesquisa:", error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const loadedSearch = sessionStorage.getItem("loadedSearch");

    if (loadedSearch) {
      try {
        const params = JSON.parse(loadedSearch);
        setQueries(params.queries || [{ value: "" }]);
        setAnoDe(params.anoDe || "");
        setAnoAte(params.anoAte || "");
        setAuthors(params.authors || []);
        setVenues(params.venues || []);
        setExcludeAuthors(params.excludeAuthors || []);
        setExcludeTitles(params.excludeTitles || []);
        setExcludeVenues(params.excludeVenues || []);
        setBibliotecas(params.bibliotecas || []);
        setSelectedFilters(inferSelectedFilters(params));
        sessionStorage.removeItem("loadedSearch");
        setOpenToastE(true);
      } catch (error) {
        console.error("Error loading search from history:", error);
      }
    } else {
      if (mainState) {
        setQueries(mainState.queries);
        setAnoDe(mainState.anoDe);
        setAnoAte(mainState.anoAte);
        setAuthors(mainState.authors);
        setVenues(mainState.venues);
        setExcludeAuthors(mainState.excludeAuthors);
        setExcludeVenues(mainState.excludeVenues);
        setExcludeTitles(mainState.excludeTitles);
        setBibliotecas(mainState.bibliotecas);
        setSelectedFilters(mainState.selectedFilters);
        setResponse(mainState.response);
      }
    }
  }, []);

  useEffect(() => {
    dispatch(
      setMainPageState({
        queries,
        anoDe,
        anoAte,
        authors,
        venues,
        excludeAuthors,
        excludeVenues,
        excludeTitles,
        bibliotecas,
        selectedFilters,
        response,
      })
    );
  }, [
    queries,
    anoDe,
    anoAte,
    authors,
    venues,
    excludeAuthors,
    excludeVenues,
    excludeTitles,
    bibliotecas,
    selectedFilters,
    response,
  ]);
  //fim usar estado redux

  const renderFilterRow = (key: FilterKey) => {
    switch (key) {
      case "authors":
        return (
          <ChipInput
            label={t("home:label_authors")}
            placeholder={t("home:placeholder_authors")}
            values={authors}
            setValues={setAuthors}
          />
        );
      case "excludeAuthors":
        return (
          <ChipInput
            label={t("home:label_exclude_authors")}
            placeholder={t("home:placeholder_exclude_authors")}
            values={excludeAuthors}
            setValues={setExcludeAuthors}
          />
        );
      case "venues":
        return (
          <ChipInput
            label={t("home:label_venues")}
            placeholder={t("home:placeholder_venues")}
            values={venues}
            setValues={setVenues}
          />
        );
      case "excludeVenues":
        return (
          <ChipInput
            label={t("home:label_exclude_venues")}
            placeholder={t("home:placeholder_exclude_venues")}
            values={excludeVenues}
            setValues={setExcludeVenues}
          />
        );
      case "excludeTitles":
        return (
          <ChipInput
            label={t("home:label_exclude_titles")}
            placeholder={t("home:placeholder_exclude_titles")}
            values={excludeTitles}
            setValues={setExcludeTitles}
          />
        );
      default:
        return null;
    }
  };

  const filterOptions: { key: FilterKey; label: string }[] = [
    { key: "authors", label: t("home:label_authors") },
    { key: "excludeAuthors", label: t("home:label_exclude_authors") },
    { key: "venues", label: t("home:label_venues") },
    { key: "excludeVenues", label: t("home:label_exclude_venues") },
    { key: "excludeTitles", label: t("home:label_exclude_titles") },
  ];

  const filterLabelsMap = filterOptions.reduce<Record<FilterKey, string>>(
    (acc, item) => {
      acc[item.key] = item.label;
      return acc;
    },
    {} as Record<FilterKey, string>
  );

  return (
    <>
      {isLoading && <LoadingCircle />}

      <SnackbarToast
        open={openToastE}
        setOpen={setOpenToastE}
        messageStr={t("warnings:success")}
        type="success"
      />

      <SnackbarToast
        open={openToastD}
        setOpen={setOpenToastD}
        messageStr={t("warnings:error")}
        type="error"
      />
      <SnackbarToast
        open={openToastC}
        setOpen={setOpenToastC}
        messageStr={t("warnings:save")}
        type="success"
      />

      <SnackbarToast
        open={openToast}
        setOpen={setOpenToast}
        messageStr={t("warnings:noLibs")}
        type="error"
      />
      <SnackbarToast
        open={openToastB}
        setOpen={setOpenToastB}
        messageStr={t("warnings:noQuery")}
        type="warning"
      />
      <SnackbarToast
        messageStr={t("home:search_still_loading")}
        open={openSearchDelayToast}
        setOpen={setOpenSearchDelayToast}
        type="info"
      />
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
            <label>
              {t("home:label_query")}
              <Tooltip title={t("warnings:advancedquery")}>
                <span className="rows-container__label__icon">
                  <HelpOutlineIcon />
                </span>
              </Tooltip>
            </label>
            {queries.map((q, index) => (
              <div key={index} className="query-row">
                {index > 0 && (
                  <select
                    value={q.operator}
                    onChange={(e) =>
                      atualizarQuery(index, "operator", e.target.value)
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
                  value={q.value}
                  placeholder={t("home:placeholder_query") ?? ""}
                  onChange={(e) =>
                    atualizarQuery(index, "value", e.target.value)
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={showBuiltQuery}
                  onChange={(e) => setShowBuiltQuery(e.target.checked)}
                />
              }
              label={t("home:label_show_built_query")}
            />
            {showBuiltQuery && (
              <textarea value={buildQueryString(queries)} readOnly />
            )}
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

          {/* Filters */}
          <div className="section">
            <Typography variant="body1" sx={{ mb: 1 }}>
              <Trans
                i18nKey="home:hint_press_enter"
                components={{ bold: <b /> }}
              />
            </Typography>

            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="filter-selector-label">
                  {t("home:select_filters") || "Select filters"}
                </InputLabel>
                <Select
                  labelId="filter-selector-label"
                  id="filter-selector"
                  multiple
                  value={selectedFilters}
                  onChange={handleFilterMultiChange}
                  label={t("home:select_filters") || "Select filters"}
                  renderValue={(selected) =>
                    (selected as FilterKey[])
                      .map((key) => filterLabelsMap[key])
                      .join(", ")
                  }
                >
                  {filterOptions.map((option) => (
                    <MenuItem key={option.key} value={option.key}>
                      <Checkbox
                        checked={selectedFilters.indexOf(option.key) > -1}
                      />
                      <ListItemText primary={option.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 2,
                backgroundColor: "#fff !important",
              }}
            >
              {selectedFilters.map((key) => (
                <Stack
                  key={key}
                  direction="row"
                  alignItems="flex-start"
                  spacing={1}
                  sx={{ width: "100%", bgcolor: "#fff" }}
                >
                  <Box sx={{ flex: 1, bgcolor: "#fff" }}>
                    {renderFilterRow(key)}
                  </Box>
                </Stack>
              ))}
            </Box>
          </div>

          {/* Bibliotecas */}
          <div className="section">
            <label>{t("home:label_bibliotecas")}</label>

            <div className="biblioteca-row">
              <select
                disabled={
                  availableLibraries.filter((lib) => !bibliotecas.includes(lib))
                    .length === 0
                }
                value={bibliotecaSelecionada}
                onChange={(e) => {
                  const lib = e.target.value;
                  if (!lib) return;

                  setBibliotecaSelecionada(lib);
                  setBibliotecas((prev) => [...prev, lib]);
                }}
              >
                <option value="">{t("home:selecionar_biblioteca")}</option>

                {availableLibraries
                  .filter((libName) => !bibliotecas.includes(libName))
                  .map((libName) => (
                    <option key={libName} value={libName}>
                      {libName}
                    </option>
                  ))}
              </select>
            </div>

            {/* Mensagens abaixo do dropdown */}
            {availableLibraries.length === 0 && (
              <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                {t("home:no_libraries_configured")}
                <br />
                <CommonLink
                  linkClass="small-config-link"
                  link={{ external: false, url: routes.libListPage.path }}
                  title={t("sideMenu:configuration")}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#0098e3ff",
                      marginTop: "4px",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    {t("home:configure_here")}
                  </p>
                </CommonLink>
              </p>
            )}

            {availableLibraries.length > 0 &&
              availableLibraries.filter((lib) => !bibliotecas.includes(lib))
                .length === 0 && (
                <p
                  style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}
                >
                  {t("home:all_libraries_added")}
                </p>
              )}

            {bibliotecas.length > 0 && (
              <div>
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
                        onClick={() => {
                          removerBiblioteca(b);
                          setBibliotecas((prev) => prev.filter((x) => x !== b));
                        }}
                      >
                        {t("home:botao_remover")}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <hr hidden={bibliotecas.length > 0} />

          {/* Actions */}
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
