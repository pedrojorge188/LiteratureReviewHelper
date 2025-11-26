import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  getSavedSearches,
  deleteSearch,
  exportSearches,
  importSearches,
  clearAllSearches,
  updateSearch,
} from "../utils/localStorage";
import { SavedSearch } from "./types";
import { SavedSearchCard } from "../components/SavedSearchCard";
import { SavedSearchPageHeader } from "../components/SavedSearchPageHeader";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EditSearchDialog } from "../components/EditSearchDialog";

export const FavoritesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTargetSearch, setEditTargetSearch] = useState<SavedSearch | null>(null);

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
    }
    setIsConfirmDeleteOpen(false);
    setDeleteTargetId(null);
  };

  const cancelDelete = () => {
    setIsConfirmDeleteOpen(false);
    setDeleteTargetId(null);
  };

  const handleEdit = (search: SavedSearch) => {
    setEditTargetSearch(search);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = (
    originalId: string,
    newLabel: string,
    searchParameters: {
      queries: { valor: string; metadado?: string }[];
      anoDe: string;
      anoAte: string;
      excluirVenues: string;
      excluirTitulos: string;
      bibliotecas: string[];
    }
  ) => {
    try {
      updateSearch(originalId, newLabel, searchParameters);
      loadSearches();
      setIsEditDialogOpen(false);
      setEditTargetSearch(null);
    } catch (error) {
      console.error("Error updating search:", error);
    }
  };

  const handleEditClose = () => {
    setIsEditDialogOpen(false);
    setEditTargetSearch(null);
  };

  const handleLoad = (search: SavedSearch) => {
    // Convert storage format to internal format and store in sessionStorage
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

  const handleExport = () => {
    try {
      const jsonString = exportSearches();
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `saved-searches-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
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
      link.download = `${sanitizedName}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
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
        // Silent success - just reload the searches
      } catch (error) {
        console.error("Error importing searches:", error);
        // Silent failure - import errors are logged
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    clearAllSearches();
    loadSearches();
  };

  return (
    <div className="history-page">
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        message={t("favorites:confirm_delete") || "Are you sure you want to delete this search?"}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <EditSearchDialog
        isOpen={isEditDialogOpen}
        search={editTargetSearch}
        onClose={handleEditClose}
        onSave={handleEditSave}
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
          <p>{t("favorites:no_searches") || "No favorite searches yet. Save a search from the main page to see it here!"}</p>
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
