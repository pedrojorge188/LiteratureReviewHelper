import { useTranslation } from "react-i18next";
import "../styles/components/confirmDialog.scss";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel} onKeyDown={handleKeyDown}>
      <div className="confirm-dialog-content" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="confirm-dialog-header">
            <h3>{title}</h3>
          </div>
        )}

        <div className="confirm-dialog-body">
          <p>{message}</p>
        </div>

        <div className="confirm-dialog-footer">
          <button className="btn-secondary" onClick={handleCancel} autoFocus>
            {t("general:cancel") || "Cancel"}
          </button>
          <button className="btn-danger" onClick={handleConfirm}>
            {t("general:confirm") || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};
