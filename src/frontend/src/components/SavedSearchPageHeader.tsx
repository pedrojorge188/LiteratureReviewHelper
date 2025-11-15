import { useTranslation } from "react-i18next";
import { SavedSearch } from "../pages/types";

interface SavedSearchPageHeaderProps {
    title: string;
    savedSearches: SavedSearch[];
    onExport?: () => void;
    onImport?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClear?: () => void;
}

export const SavedSearchPageHeader = ({ title, savedSearches, onExport, onImport, onClear }: SavedSearchPageHeaderProps) => {
    const { t } = useTranslation();

    return (
        <div className="history-header">
            <h2>{title}</h2>
            <div className="history-actions">
                {onExport && (
                    <button className="btn-secondary" onClick={onExport} disabled={savedSearches.length === 0}>
                    {t("savedsearchpageheader:export") || "Export All"}
                    </button>
                )}
                {onImport && (
                    <label className="btn-secondary import-btn">
                    {t("savedsearchpageheader:import") || "Import"}
                    <input type="file" accept=".json" onChange={onImport} style={{ display: "none" }} />
                    </label>
                )}
                {onClear && (
                    <button className="btn-danger" onClick={onClear} disabled={savedSearches.length === 0}>
                    {t("savedsearchpageheader:clear") || "Clear All"}
                    </button>
                )}
            </div>
        </div>
    );
};
