import { useTranslation } from "react-i18next";
import { useEffect } from "react"; // Precisamos disto para o temporizador
import "../styles/components/confirmDialog.scss"; // Reutiliza os mesmos estilos

interface InfoDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void; // Apenas uma função 'onClose' é necessária
  duration?: number; // Duração em milissegundos (opcional)
}

// Define uma duração padrão de 3 segundos
const DEFAULT_DURATION = 3000;

export const InfoDialog = ({
  isOpen,
  title,
  message,
  onClose,
  duration = DEFAULT_DURATION,
}: InfoDialogProps) => {
  const { t } = useTranslation();

  // Este useEffect gere o fecho automático e as teclas
  useEffect(() => {
    // Só faz algo se o modal estiver aberto
    if (!isOpen) return;

    // 1. Temporizador para fechar sozinho
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // 2. Listener para teclas (Enter/Escape)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // 3. Função de limpeza (cleanup)
    // Esta função é executada quando o componente "desmonta" ou 'isOpen' muda
    return () => {
      clearTimeout(timer); // Limpa o temporizador se fechar manualmente
      document.removeEventListener("keydown", handleKeyDown); // Remove o listener
    };
  }, [isOpen, onClose, duration]); // Dependências do Effect

  // Handler para o clique no botão "OK" ou no fundo (overlay)
  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    // O 'onKeyDown' é gerido pelo useEffect, mas o 'onClick' no overlay é mantido
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="confirm-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="confirm-dialog-header">
            <h3>{title}</h3>
          </div>
        )}

        <div className="confirm-dialog-body">
          <p>{message}</p>
        </div>

        <div className="confirm-dialog-footer">
          {/* Apenas um botão de "OK" */}
          <button className="btn-secondary" onClick={handleClose} autoFocus>
            {t("general:ok") || "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};
