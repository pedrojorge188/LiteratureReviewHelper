import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SavedSearch, Query, ApiSettings } from "../pages/types";
import {
  normalizeQueries,
  addQuery,
  removeQuery,
  moveQueryUp,
  updateQuery,
  loadApiSettings,
  getAvailableLibraries,
} from "../utils";

interface EditSearchDialogProps {
  isOpen: boolean;
  search: SavedSearch | null;
  onClose: () => void;
  onSave: (id: string, newLabel: string, searchParameters: {
    queries: Query[];
    anoDe: string;
    anoAte: string;
    excluirVenues: string;
    excluirTitulos: string;
    bibliotecas: string[];
  }) => void;
  externalError?: string;
}

export const EditSearchDialog = ({
  isOpen,
  search,
  onClose,
  onSave,
  externalError = "",
}: EditSearchDialogProps) => {
  const { t } = useTranslation();

  const [label, setLabel] = useState("");
  const [queries, setQueries] = useState<Query[]>([{ value: "" }]);
  const [anoDe, setAnoDe] = useState<string>("");
  const [anoAte, setAnoAte] = useState<string>("");
  const [excluirVenues, setExcluirVenues] = useState<string>("");
  const [excluirTitulos, setExcluirTitulos] = useState<string>("");
  const [bibliotecaSelecionada, setBibliotecaSelecionada] = useState<string>("");
  const [bibliotecas, setBibliotecas] = useState<string[]>([]);
  const [apiSettings, setApiSettings] = useState<ApiSettings>({});
  const [error, setError] = useState("");

  // Update error when external error changes
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  // Load API settings
  useEffect(() => {
    setApiSettings(loadApiSettings());
  }, []);

  // Load search data when dialog opens
  useEffect(() => {
    if (isOpen && search) {
      setLabel(search.id);
      setQueries(search.searchParameters.queries);
      setAnoDe(search.searchParameters.yearFrom);
      setAnoAte(search.searchParameters.yearTo);

      
      setExcluirVenues(
        Array.isArray(search.searchParameters.excludeVenues)
          ? search.searchParameters.excludeVenues.join(", ")
          : search.searchParameters.excludeVenues || ""
      );
      setExcluirTitulos(
        Array.isArray(search.searchParameters.excludeTitles)
          ? search.searchParameters.excludeTitles.join(", ")
          : search.searchParameters.excludeTitles || ""
      );
      setBibliotecas(search.searchParameters.libraries);
      setError("");
    }
  }, [isOpen, search]);

  const availableLibraries = getAvailableLibraries(apiSettings);

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
    }
  };

  const removerBiblioteca = (nome: string) => {
    setBibliotecas(bibliotecas.filter((b) => b !== nome));
  };

  const handleSave = () => {
    if (!label.trim()) {
      setError(t("saveDialog:error_empty_label") || "Please enter a label");
      return;
    }

    if (!search) return;

    onSave(search.id, label.trim(), {
      queries,
      anoDe,
      anoAte,
      excluirVenues,
      excluirTitulos,
      bibliotecas,
    });
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!isOpen || !search) return null;

  return (
    <div className="modal-overlay p-3" onClick={handleClose}>
      <div
        className="modal-content edit-search-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{t("editSearchDialog:title") || "Edit Search"}</h3>
          <button className="modal-close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="modal-body edit-search-body">
          {/* Search Name */}
          <div className="section">
            <label>{t("editSearchDialog:label_name") || "Search Name"}</label>
            <input
              type="text"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                setError("");
              }}
              placeholder={t("saveDialog:placeholder") || "e.g., AI usage"}
            />
            {error && <p className="error-message">{error}</p>}
          </div>

          {/* Query Section */}
          <div className="section">
            <label>{t("home:label_query")}</label>
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
          </div>

          {/* Publication Year */}
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

              <select value={anoAte} onChange={(e) => setAnoAte(e.target.value)}>
                <option value="">{t("home:ano_ate")}</option>
                {Array.from({ length: 30 }, (_, i) => 2025 - i).map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exclude Venues */}
          <div className="section">
            <label>{t("home:label_exclude_venues")}</label>
            <textarea
              value={excluirVenues}
              onChange={(e) => setExcluirVenues(e.target.value)}
              placeholder={t("home:placeholder_exclude_venues") ?? ""}
            ></textarea>
          </div>

          {/* Exclude Titles */}
          <div className="section">
            <label>{t("home:label_exclude_titles")}</label>
            <textarea
              value={excluirTitulos}
              onChange={(e) => setExcluirTitulos(e.target.value)}
              placeholder={t("home:placeholder_exclude_titles") ?? ""}
            ></textarea>
          </div>

          {/* Libraries */}
          <div className="section">
            <label>{t("home:label_bibliotecas")}</label>
            <div className="biblioteca-row">
              <select
                value={bibliotecaSelecionada}
                onChange={(e) => setBibliotecaSelecionada(e.target.value)}
              >
                <option value="">{t("home:selecionar_biblioteca")}</option>
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
            {bibliotecas.length > 0 && (
              <>
                <h4 className="bibliotecas-lista-titulo">
                  {t("home:lista_bibliotecas")}
                </h4>
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
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>
            {t("editSearchDialog:cancel") || "Cancel"}
          </button>
          <button className="btn-primary" onClick={handleSave}>
            {t("editSearchDialog:save") || "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};
