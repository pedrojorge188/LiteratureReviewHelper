import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  getSavedSearches,
  deleteSearch,
  updateSearchLabel,
  exportSearches,
  importSearches,
  clearAllSearches,
} from "../utils/localStorage";
import { SavedSearch } from "./types";
import { SaveDialog } from "../components/SaveDialog";
import { SavedSearchCard } from "../components/SavedSearchCard";
import { SavedSearchPageHeader } from "../components/SavedSearchPageHeader";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SnackbarToast } from "../components";

export const FavoritesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("");
  const [editError, setEditError] = useState<string>("");
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [openToastE, setOpenToastE] = useState(false);
  const [openToastD, setOpenToastD] = useState(false);

  // Load saved searches on component mount
  useEffect(() => {
    loadSearches();
  }, []);

  const loadSearches = () => {
    const searches = getSavedSearches();
    setSavedSearches(searches);
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteSearch(deleteTargetId);
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

  const handleEdit = (search: SavedSearch) => {
    setEditingId(search.id);
    setCurrentLabel(search.id);
    setEditError("");
    setIsEditDialogOpen(true);
  };

  const handleUpdateLabel = (newLabel: string) => {
    if (editingId) {
      try {
        updateSearchLabel(editingId, newLabel);
        setIsEditDialogOpen(false);
        setEditingId(null);
        setCurrentLabel("");
        setEditError("");
        loadSearches();
        setOpenToastE(true);
      } catch (error) {
        setOpenToastD(true);
        console.error("Error updating label:", error);
        if (error instanceof Error) {
          setEditError(error.message);
        } else {
          setEditError(
            t("favorites:update_error") ||
              "Error updating search name. Please try again."
          );
        }
      }
    }
  };

  const handleLoad = (search: SavedSearch) => {
    // Convert storage format to internal format and store in sessionStorage
    const internalParams = {
      queries: search.searchParameters.queries.map((q) => ({
        valor: q.value,
        metadado: q.operator,
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

  const handleExport = () => {
    try {
      const jsonString = exportSearches();
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `saved-searches-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setOpenToastE(true);
    } catch (error) {
      setOpenToastD(true);
      console.error("Error exporting searches:", error);
      // Silent failure - export is not critical
    }
  };

  const handleExportSingle = (search: SavedSearch) => {
    try {
      const jsonString = JSON.stringify([search], null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Use the search name as the filename, sanitized for file systems
      const sanitizedName = search.id.replace(/[<>:"/\\|?*]/g, "-");
      link.download = `${sanitizedName}-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setOpenToastE(true);
    } catch (error) {
      setOpenToastD(true);
      console.error("Error exporting search:", error);
      // Silent failure - export is not critical
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importSearches(content);
        loadSearches();
        setOpenToastE(true);
        // Silent success - just reload the searches
      } catch (error) {
        setOpenToastD(true);
        console.error("Error importing searches:", error);
        // Silent failure - import errors are logged
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    setIsConfirmDeleteAllOpen(true);
  };

  useEffect(() => {
    if (confirmDeleteAll) {
      clearAllSearches();
      loadSearches();
      setConfirmDeleteAll(false);
      setIsConfirmDeleteAllOpen(false);
      setOpenToastE(true);
    }
  }, [confirmDeleteAll]);

  return (
    <div className="history-page">
      <SaveDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingId(null);
          setCurrentLabel("");
          setEditError("");
        }}
        onSave={handleUpdateLabel}
        initialLabel={currentLabel}
        externalError={editError}
      />

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
        isOpen={isConfirmDeleteOpen}
        message={
          t("favorites:confirm_delete") ||
          "Are you sure you want to delete this search?"
        }
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
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

      <SavedSearchPageHeader
        title={t("favorites:title") || "Favorite Searches"}
        savedSearches={savedSearches}
        onExport={handleExport}
        onImport={handleImport}
        onClear={handleClearAll}
      />

      {savedSearches.length === 0 ? (
        <div className="empty-state">
          <p>
            {t("favorites:no_searches") ||
              "No favorite searches yet. Save a search from the main page to see it here!"}
          </p>
        </div>
      ) : (
        <div className="searches-list">
          {savedSearches.map((search) => (
            <SavedSearchCard
              search={search}
              onLoad={handleLoad}
              onEdit={handleEdit}
              onExport={handleExportSingle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
