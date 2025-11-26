import { useTranslation } from "react-i18next";
import { SavedSearch } from "../pages/types";

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
            <span>{formatQueryString(search.searchParameters.queries)}</span>
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

          {search.searchParameters.excludeVenues && (
            <div className="search-detail">
              <strong>
                {t("savedsearchcard:excluded_venues") || "Excluded Venues"}:
              </strong>
              <span className="truncate">
                {search.searchParameters.excludeVenues}
              </span>
            </div>
          )}

          {search.searchParameters.excludeTitles && (
            <div className="search-detail">
              <strong>
                {t("savedsearchcard:excluded_titles") || "Excluded Titles"}:
              </strong>
              <span className="truncate">
                {search.searchParameters.excludeTitles}
              </span>
            </div>
          )}
        </div>

        <div className="search-card-actions">
          {onLoad && (
            <button className="btn-primary" onClick={() => onLoad(search)}>
              {t("savedsearchcard:load") || "Load"}
            </button>
          )}
          {/** TODO: Implement US: https://github.com/pedrojorge188/LiteratureReviewHelper/issues/21
            {onEdit && (
                <button className="btn-secondary" onClick={() => onEdit(search)}>
                    {t("savedsearchcard:edit") || "Edit"}
                </button>
            )} */}
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
