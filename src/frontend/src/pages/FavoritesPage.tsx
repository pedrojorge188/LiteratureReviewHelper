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
import { SavedSearch, Query } from "./types";
import { SavedSearchCard } from "../components/SavedSearchCard";
import { SavedSearchPageHeader } from "../components/SavedSearchPageHeader";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EditSearchDialog } from "../components/EditSearchDialog";
import { SnackbarToast } from "../components";

export const FavoritesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [openToastE, setOpenToastE] = useState(false);
  const [openToastD, setOpenToastD] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [editError, setEditError] = useState("");

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
    setEditingSearch(search);
    setEditError("");
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (
    id: string,
    newLabel: string,
    searchParameters: {
      queries: Query[];
      anoDe: string;
      anoAte: string;
      excluirVenues: string;
      excluirTitulos: string;
      bibliotecas: string[];
    }
  ) => {
    try {
      const internalParams = {
        queries: searchParameters.queries,
        anoDe: searchParameters.anoDe,
        anoAte: searchParameters.anoAte,
        authors: editingSearch?.searchParameters.authors || [],
        venues: editingSearch?.searchParameters.venues || [],
        excludeAuthors: editingSearch?.searchParameters.excludeAuthors || [],
        excludeVenues: searchParameters.excluirVenues
          ? searchParameters.excluirVenues.split(",").map((s) => s.trim())
          : [],
        excludeTitles: searchParameters.excluirTitulos
          ? searchParameters.excluirTitulos.split(",").map((s) => s.trim())
          : [],
        bibliotecas: searchParameters.bibliotecas,
        titlesToVerify: editingSearch?.searchParameters.titlesToVerify || [],
      };

      updateSearch(id, newLabel, internalParams);
      setIsEditDialogOpen(false);
      setEditingSearch(null);
      setEditError("");
      loadSearches();
      setOpenToastE(true);
    } catch (error) {
      console.error("Error updating search:", error);
      if (error instanceof Error && error.message.includes("already exists")) {
        setEditError(
          t("saveDialog:error_duplicate_name") ||
          "A search with this name already exists. Please choose a different name."
        );
      } else {
        setOpenToastD(true);
      }
    }
  };

  const handleLoad = (search: SavedSearch) => {
    // Convert storage format to internal format and store in sessionStorage
    const internalParams = {
      queries: search.searchParameters.queries,
      anoDe: search.searchParameters.yearFrom,
      anoAte: search.searchParameters.yearTo,
      authors: search.searchParameters.authors,
      venues: search.searchParameters.venues,
      excludeAuthors: search.searchParameters.excludeAuthors,
      excludeTitles: search.searchParameters.excludeTitles,
      excludeVenues: search.searchParameters.excludeVenues,
      bibliotecas: search.searchParameters.libraries,
      titlesToVerify: search.searchParameters.titlesToVerify
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
      link.download = `saved-searches-${new Date().toISOString().split("T")[0]
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
      link.download = `${sanitizedName}-${new Date().toISOString().split("T")[0]
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
      <EditSearchDialog
        isOpen={isEditDialogOpen}
        search={editingSearch}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingSearch(null);
          setEditError("");
        }}
        onSave={handleSaveEdit}
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
          {savedSearches.map((search, key) => (
            <SavedSearchCard
              search={search}
              onLoad={handleLoad}
              onEdit={handleEdit}
              onExport={handleExportSingle}
              onDelete={handleDelete}
              key={key}
            />
          ))}
        </div>
      )}
    </div>
  );
};
