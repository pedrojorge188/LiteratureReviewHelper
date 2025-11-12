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

export const FavoritesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("");

  // Load saved searches on component mount
  useEffect(() => {
    loadSearches();
  }, []);

  const loadSearches = () => {
    const searches = getSavedSearches();
    setSavedSearches(searches);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t("favorites:confirm_delete") || "Are you sure you want to delete this search?")) {
      deleteSearch(id);
      loadSearches();
    }
  };

  const handleEdit = (search: SavedSearch) => {
    setEditingId(search.id);
    setCurrentLabel(search.id);
    setIsEditDialogOpen(true);
  };

  const handleUpdateLabel = (newLabel: string) => {
    if (editingId) {
      try {
        updateSearchLabel(editingId, newLabel);
        setIsEditDialogOpen(false);
        setEditingId(null);
        setCurrentLabel("");
        loadSearches();
      } catch (error) {
        console.error("Error updating label:", error);
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert(t("favorites:update_error") || "Error updating search name. Please try again.");
        }
      }
    }
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
      alert(t("favorites:export_error") || "Error exporting searches");
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
      alert(t("favorites:export_error") || "Error exporting search");
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
        alert(t("favorites:import_success") || "Searches imported successfully!");
      } catch (error) {
        console.error("Error importing searches:", error);
        alert(t("favorites:import_error") || "Error importing searches. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        t("favorites:confirm_clear_all") || "Are you sure you want to delete all saved searches? This cannot be undone."
      )
    ) {
      clearAllSearches();
      loadSearches();
    }
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
    return queries
      .map((q, i) => (i === 0 ? q.value : `${q.operator} ${q.value}`))
      .join(" ");
  };

  return (
    <div className="history-page">
      <SaveDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingId(null);
          setCurrentLabel("");
        }}
        onSave={handleUpdateLabel}
        initialLabel={currentLabel}
      />

      <div className="history-header">
        <h2>{t("favorites:title") || "Favorite Searches"}</h2>
        <div className="history-actions">
          <button className="btn-secondary" onClick={handleExport} disabled={savedSearches.length === 0}>
            {t("favorites:export") || "Export All"}
          </button>
          <label className="btn-secondary import-btn">
            {t("favorites:import") || "Import"}
            <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
          </label>
          <button className="btn-danger" onClick={handleClearAll} disabled={savedSearches.length === 0}>
            {t("favorites:clear_all") || "Clear All"}
          </button>
        </div>
      </div>

      {savedSearches.length === 0 ? (
        <div className="empty-state">
          <p>{t("favorites:no_searches") || "No favorite searches yet. Save a search from the main page to see it here!"}</p>
        </div>
      ) : (
        <div className="searches-list">
          {savedSearches.map((search) => (
            <div key={search.id} className="search-card">
              <div className="search-card-header">
                <h3>{search.id}</h3>
                <span className="search-date">{formatDate(search.timestamp)}</span>
              </div>

              <div className="search-card-body">
                <div className="search-detail">
                  <strong>{t("favorites:query") || "Query"}:</strong>
                  <span>{formatQueryString(search.searchParameters.queries)}</span>
                </div>

                {(search.searchParameters.yearFrom || search.searchParameters.yearTo) && (
                  <div className="search-detail">
                    <strong>{t("favorites:years") || "Years"}:</strong>
                    <span>
                      {search.searchParameters.yearFrom || "..."} - {search.searchParameters.yearTo || "..."}
                    </span>
                  </div>
                )}

                {search.searchParameters.libraries.length > 0 && (
                  <div className="search-detail">
                    <strong>{t("favorites:libraries") || "Libraries"}:</strong>
                    <span>{search.searchParameters.libraries.join(", ")}</span>
                  </div>
                )}

                {search.searchParameters.excludeVenues && (
                  <div className="search-detail">
                    <strong>{t("favorites:excluded_venues") || "Excluded Venues"}:</strong>
                    <span className="truncate">{search.searchParameters.excludeVenues}</span>
                  </div>
                )}

                {search.searchParameters.excludeTitles && (
                  <div className="search-detail">
                    <strong>{t("favorites:excluded_titles") || "Excluded Titles"}:</strong>
                    <span className="truncate">{search.searchParameters.excludeTitles}</span>
                  </div>
                )}
              </div>

              <div className="search-card-actions">
                <button className="btn-primary" onClick={() => handleLoad(search)}>
                  {t("favorites:load") || "Load"}
                </button>
                <button className="btn-secondary" onClick={() => handleEdit(search)}>
                  {t("favorites:edit") || "Edit"}
                </button>
                <button className="btn-secondary" onClick={() => handleExportSingle(search)}>
                  {t("favorites:export_single") || "Export"}
                </button>
                <button className="btn-danger" onClick={() => handleDelete(search.id)}>
                  {t("favorites:delete") || "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
