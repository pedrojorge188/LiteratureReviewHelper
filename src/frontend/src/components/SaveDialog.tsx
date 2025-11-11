import { useState } from "react";
import { useTranslation } from "react-i18next";

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string) => void;
  initialLabel?: string;
}

export const SaveDialog = ({
  isOpen,
  onClose,
  onSave,
  initialLabel = "",
}: SaveDialogProps) => {
  const { t } = useTranslation();
  const [label, setLabel] = useState(initialLabel);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!label.trim()) {
      setError(t("saveDialog:error_empty_label") || "Please enter a label");
      return;
    }

    onSave(label.trim());
    setLabel("");
    setError("");
  };

  const handleClose = () => {
    setLabel(initialLabel);
    setError("");
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t("saveDialog:title") || "Save Search"}</h3>
          <button className="modal-close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <label htmlFor="search-label">
            {t("saveDialog:label_prompt") || "Enter a name for this search:"}
          </label>
          <input
            id="search-label"
            type="text"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyPress}
            placeholder={
              t("saveDialog:placeholder") || "e.g., AI usage"
            }
            autoFocus
          />
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>
            {t("saveDialog:cancel") || "Cancel"}
          </button>
          <button className="btn-primary" onClick={handleSave}>
            {t("saveDialog:save") || "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};
