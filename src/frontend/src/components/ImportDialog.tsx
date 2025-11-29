import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  getSavedSearches,
  deleteSearch,
  importSearches,
} from "../utils/localStorage";
import { SavedSearch } from "../pages/types";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (search: SavedSearch) => void;
}

export const ImportDialog = ({
  isOpen,
  onClose,
  onLoad,
}: ImportDialogProps) => {
  const { t } = useTranslation();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadSearches();
    }
  }, [isOpen]);

  const loadSearches = () => {
    const searches = getSavedSearches();
    setSavedSearches(searches);
  };

  const handleLoad = (search: SavedSearch) => {
    onLoad(search);
    onClose();
  };

  const handleDelete = (id: string) => {
    deleteSearch(id);
    loadSearches();
  };

  const handleImportFromFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importSearches(content);
        loadSearches();
        // Silent success - searches will appear in the list
      } catch (error) {
        console.error("Error importing file:", error);
        // Silent failure - error is logged to console
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatQueryString = (
    queries: Array<{ value: string; operator?: string }>
  ) => {
    return queries
      .map((q, i) => (i === 0 ? q.value : `${q.operator} ${q.value}`))
      .join(" ");
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="import-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{t("import:title") || "Import"}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="import-modal-body">
          {/* Import from file button */}
          <div className="import-from-file-section">
            <button className="btn-import-file" onClick={handleImportFromFile}>
              {t("import:import_from_file") || "Import from File"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          <div className="divider">
            <span>
              {t("import:or_load_from_saved") || "Or load from saved searches"}
            </span>
          </div>

          {savedSearches.length === 0 ? (
            <p className="no-searches">
              {t("import:no_searches") || "No saved searches found."}
            </p>
          ) : (
            <div className="searches-list">
              {savedSearches.map((search) => (
                <div key={search.id} className="search-item">
                  <div className="search-item-header">
                    <h4>{search.id}</h4>
                    <span className="search-date">
                      {formatDate(search.timestamp)}
                    </span>
                  </div>
                  <p className="search-query">
                    {formatQueryString(search.searchParameters.queries)}
                  </p>
                  <div className="search-item-actions">
                    <button
                      className="btn-load"
                      onClick={() => handleLoad(search)}
                    >
                      {t("import:load") || "Load"}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(search.id)}
                    >
                      {t("import:delete") || "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
