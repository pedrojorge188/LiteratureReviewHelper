import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getSearchHistory, clearAllSearchHistory, deleteHistoryEntry } from "../utils/localStorage";
import { SavedSearch } from "./types";
import { ConfirmDialog } from "../components/ConfirmDialog";

export const HistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [historySearches, setHistorySearches] = useState<SavedSearch[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    loadSearches();
  }, []);

  const loadSearches = () => {
    const searches = getSearchHistory();
    setHistorySearches(searches);
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteHistoryEntry(deleteTargetId);
      loadSearches();
    }
    setIsConfirmDeleteOpen(false);
    setDeleteTargetId(null);
  };

  const cancelDelete = () => {
    setIsConfirmDeleteOpen(false);
    setDeleteTargetId(null);
  };

  const handleLoad = (search: SavedSearch) => {
    const internalParams = {
      queries: search.searchParameters.queries.map(q => ({
        valor: q.value,
        metadado: q.operator
      })),
      anoDe: search.searchParameters.yearFrom,
      anoAte: search.searchParameters.yearTo,
      excluirVenues: search.searchParameters.excludeVenues,
      excluirTitulos: search.searchParameters.excludeTitles,
      bibliotecas: search.searchParameters.libraries,
    };
    sessionStorage.setItem("loadedSearch", JSON.stringify(internalParams));
    navigate("/");
  };

    const handleClearAll = () => {
      clearAllSearchHistory();
      loadSearches();
    };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatQueryString = (queries: Array<{ value: string; operator?: string }>) => {
    return queries.map((q, i) => (i === 0 ? q.value : `${q.operator} ${q.value}`)).join(" ");
  };

  return (
    <div className="history-page">
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        message={t("history:confirm_delete") || "Are you sure you want to delete this search?"}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <div className="history-header">
        <h2>{t("history:title") || "Search History"}</h2>
          <div className="history-actions">
          <button className="btn-danger" onClick={handleClearAll} disabled={historySearches.length === 0}>
            {t("history:clear_all") || "Clear All"}
          </button>
        </div>
      </div>

      {historySearches.length === 0 ? (
        <div className="empty-state">
          <p>{t("history:no_searches") || "No history available."}</p>
        </div>
      ) : (
        <div className="searches-list">
          {historySearches.map((search) => (
            <div key={search.id} className="search-card">
              <div className="search-card-header">
                <h3>{search.id}</h3>
                <span className="search-date">{formatDate(search.timestamp)}</span>
              </div>

              <div className="search-card-body">
                <div className="search-detail">
                  <strong>{t("history:query") || "Query"}:</strong>
                  <span>{formatQueryString(search.searchParameters.queries)}</span>
                </div>

                {(search.searchParameters.yearFrom || search.searchParameters.yearTo) && (
                  <div className="search-detail">
                    <strong>{t("history:years") || "Years"}:</strong>
                    <span>
                      {search.searchParameters.yearFrom || "..."} - {search.searchParameters.yearTo || "..."}
                    </span>
                  </div>
                )}

                {search.searchParameters.libraries.length > 0 && (
                  <div className="search-detail">
                    <strong>{t("history:libraries") || "Libraries"}:</strong>
                    <span>{search.searchParameters.libraries.join(", ")}</span>
                  </div>
                )}

                {search.searchParameters.excludeVenues && (
                  <div className="search-detail">
                    <strong>{t("history:excluded_venues") || "Excluded Venues"}:</strong>
                    <span className="truncate">{search.searchParameters.excludeVenues}</span>
                  </div>
                )}

                {search.searchParameters.excludeTitles && (
                  <div className="search-detail">
                    <strong>{t("history:excluded_titles") || "Excluded Titles"}:</strong>
                    <span className="truncate">{search.searchParameters.excludeTitles}</span>
                  </div>
                )}
              </div>

              <div className="search-card-actions">
                <button className="btn-primary" onClick={() => handleLoad(search)}>
                  {t("history:load") || "Load"}
                </button>
                <button className="btn-danger" onClick={() => handleDelete(search.id)}>
                  {t("history:delete") || "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

