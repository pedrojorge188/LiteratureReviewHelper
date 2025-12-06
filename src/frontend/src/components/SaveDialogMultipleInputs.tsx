import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, IconButton, Typography, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import "../styles/components/saveDialogMultipleInputs.scss"

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (titles: string[]) => void;
  initialTitles?: string[];
  externalError?: string;
}

export const SaveDialogMultipleInputs = ({
  isOpen,
  onClose,
  onSave,
  initialTitles = [""],
  externalError = "",
}: SaveDialogProps) => {
  const { t } = useTranslation();
  const [titles, setTitles] = useState<string[]>(initialTitles);
  const [error, setError] = useState("");

  useEffect(() => {
    if (externalError) setError(externalError);
  }, [externalError]);

  const handleTitleChange = (index: number, value: string) => {
    const updated = [...titles];
    updated[index] = value;
    setTitles(updated);
    setError("");
  };

  const addInput = () => setTitles([...titles, ""]);

  const removeInput = (index: number) => {
    const updated = titles.filter((_, i) => i !== index);
    setTitles(updated.length ? updated : [""]);
  };

  const handleSave = () => {
    const validTitles = titles.map(t => t.trim()).filter(t => t !== "");
    if (!validTitles.length) {
      setError(t("saveDialog:error_empty_label") || "Please enter at least one title");
      return;
    }
    onSave(validTitles);
    setTitles([""]);
    setError("");
  };

  const handleClose = () => {
    setTitles(initialTitles.length ? initialTitles : [""]);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Box
      className="modal-overlay"
      onClick={handleClose}
    >
      <Box
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <Box className="modal-header">
          <Typography variant="h4" className="modal-title">
            {"Add Titles"}
          </Typography>

          <IconButton onClick={handleClose} size="small" className="btn-close">
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography className="modal-description">
          {"Add multiple titles. Remove any title by clicking ×."}
        </Typography>

        <Box className="inputs-wrapper">
          {titles.map((title, index) => (
            <Box key={index} className="input-row">
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                className="input-field"
                value={title}
                onChange={(e) => handleTitleChange(index, e.target.value)}
                placeholder="Enter title"
              />
              <IconButton className="btn-delete" onClick={() => removeInput(index)}>
                <CloseIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Box className="add-button-wrapper">
          <IconButton className="btn-add" onClick={addInput}>
            <AddIcon />
          </IconButton>
        </Box>

        {error && (
          <Typography className="error-message">
            {error}
          </Typography>
        )}

        <Box className="modal-footer">
          <Button className="btn-secondary" onClick={handleClose}>
            Cancel
          </Button>

          <Button className="btn-primary" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
