import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  getSearchHistory,
  clearAllSearchHistory,
  deleteHistoryEntry,
} from "../utils/localStorage";
import { SavedSearch } from "./types";
import { SavedSearchCard } from "../components/SavedSearchCard";
import { SavedSearchPageHeader } from "../components/SavedSearchPageHeader";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SnackbarToast } from "../components";

export const HistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [historySearches, setHistorySearches] = useState<SavedSearch[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [openToastE, setOpenToastE] = useState(false);
  const [openToastD, setOpenToastD] = useState(false);

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
      setOpenToastE(true);
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
      queries: search.searchParameters.queries,
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
    setIsConfirmDeleteAllOpen(true);
  };

  useEffect(() => {
    if (confirmDeleteAll) {
      clearAllSearchHistory();
      loadSearches();
      setConfirmDeleteAll(false);
      setIsConfirmDeleteAllOpen(false);
      setOpenToastE(true);
    }
  }, [confirmDeleteAll]);

  return (
    <div className="history-page">
      <SnackbarToast
        open={openToastD}
        setOpen={setOpenToastD}
        messageStr={t("warnings:error")}
        type="error"
      />

      <SnackbarToast
        open={openToastE}
        setOpen={setOpenToastE}
        messageStr={t("warnings:success")}
        type="success"
      />
      <ConfirmDialog
        isOpen={isConfirmDeleteAllOpen}
        message={
          t("favorites:confirm_clear_all") ||
          "Are you sure you want to delete this search?"
        }
        onConfirm={() => {
          setConfirmDeleteAll(true);
        }}
        onCancel={() => {
          setIsConfirmDeleteAllOpen(false);
        }}
      />

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        message={
          t("history:confirm_delete") ||
          "Are you sure you want to delete this search?"
        }
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
