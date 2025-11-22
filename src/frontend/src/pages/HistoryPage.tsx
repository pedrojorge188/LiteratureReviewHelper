import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getSearchHistory, clearAllSearchHistory, deleteHistoryEntry } from "../utils/localStorage";
import { SavedSearch } from "./types";
import { SavedSearchCard } from "../components/SavedSearchCard";
import { SavedSearchPageHeader } from "../components/SavedSearchPageHeader";
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

  return (
    <div className="history-page">
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        message={t("history:confirm_delete") || "Are you sure you want to delete this search?"}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <SavedSearchPageHeader
        title={t("history:title") || "Search History"}
        savedSearches={historySearches}
        onClear={handleClearAll}
      />

      {historySearches.length === 0 ? (
        <div className="empty-state">
          <p>{t("history:no_searches") || "No history available."}</p>
        </div>
      ) : (
        <div className="searches-list">
          {historySearches.map((search) => (
            <SavedSearchCard
              search={search}
              onLoad={handleLoad}
              onDelete={handleDelete}
              />
          ))}
        </div>
      )}
    </div>
  );
};
