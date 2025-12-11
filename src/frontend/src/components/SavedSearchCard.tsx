import { useTranslation } from "react-i18next";
import { SavedSearch } from "../pages/types";
import { buildQueryString } from "../utils/queries";
import { Stack, Typography } from "@mui/material";

interface SavedSearchCardProps {
  search: SavedSearch;
  onLoad?: (search: SavedSearch) => void;
  onEdit?: (search: SavedSearch) => void;
  onExport?: (search: SavedSearch) => void;
  onDelete?: (id: string) => void;
}

export const SavedSearchCard = ({
  search,
  onLoad,
  onEdit,
  onExport,
  onDelete,
}: SavedSearchCardProps) => {
  const { t } = useTranslation();

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

  const filterConfigs: {
    key:
    | "authors"
    | "venues"
    | "excludeAuthors"
    | "excludeVenues"
    | "excludeTitles";
    label: string;
  }[] = [
      {
        key: "authors",
        label: t("savedsearchcard:authors"),
      },
      {
        key: "venues",
        label: t("savedsearchcard:venues"),
      },
      {
        key: "excludeAuthors",
        label: t("savedsearchcard:excluded_authors"),
      },
      {
        key: "excludeVenues",
        label: t("savedsearchcard:excluded_venues"),
      },
      {
        key: "excludeTitles",
        label: t("savedsearchcard:excluded_titles"),
      },
    ];

  return (
    <div key={search.id} className="search-card">
      <div className="search-card-header">
        <h3>{search.id}</h3>
        <span className="search-date">{formatDate(search.timestamp)}</span>
      </div>
      <div className="search-content-container">
        <div className="search-card-body">
          <div className="search-detail">
            <strong>{t("savedsearchcard:query") || "Query"}:</strong>
            <span>{buildQueryString(search.searchParameters.queries)}</span>
          </div>

          {(search.searchParameters.yearFrom ||
            search.searchParameters.yearTo) && (
              <div className="search-detail">
                <strong>{t("savedsearchcard:years") || "Years"}:</strong>
                <span>
                  {search.searchParameters.yearFrom || "..."} -{" "}
                  {search.searchParameters.yearTo || "..."}
                </span>
              </div>
            )}

          {search.searchParameters.libraries.length > 0 && (
            <div className="search-detail">
              <strong>{t("savedsearchcard:libraries") || "Libraries"}:</strong>
              <span>{search.searchParameters.libraries.join(", ")}</span>
            </div>
          )}

          {filterConfigs.map(({ key, label }) => {
            const values = search.searchParameters[key] as string[] | undefined;

            //if (!values || values.length === 0) return null;
            if (!Array.isArray(values) || values.length === 0) return null;

            return (
              <div key={key} className="search-detail">
                <strong>{label}:</strong>
                <span className="truncate">{values.join(", ")}</span>
              </div>
            );
          })}


          {search.searchParameters.selectedTitlesForVerification?.length > 0 && (
            <div className="search-detail">
              <strong>Query validation titles:</strong>
              <span className="truncate">{search.searchParameters.selectedTitlesForVerification.join(", ")}</span>
            </div>
          )}
        </div>

        <div className="search-card-actions">
          {onLoad && (
            <button className="btn-primary" onClick={() => onLoad(search)}>
              {t("savedsearchcard:load") || "Load"}
            </button>
          )}
          {onEdit && (
            <button className="btn-secondary" onClick={() => onEdit(search)}>
              {t("savedsearchcard:edit") || "Edit"}
            </button>
          )}
          {onExport && (
            <button className="btn-secondary" onClick={() => onExport(search)}>
              {t("savedsearchcard:export") || "Export"}
            </button>
          )}
          {onDelete && (
            <button className="btn-danger" onClick={() => onDelete(search.id)}>
              {t("savedsearchcard:delete") || "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
