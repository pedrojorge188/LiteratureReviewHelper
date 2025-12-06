import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, IconButton, Typography, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

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
      sx={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <Box
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        sx={{
          backgroundColor: "#f9f9f9",
          borderRadius: 2,
          p: 3,
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ color: "#333" }}>{"Add Titles"}</Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: "#666" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
          {"Add multiple titles. Remove any title by clicking ×."}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {titles.map((title, index) => (
            <Box key={index} sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={title}
                onChange={(e) => handleTitleChange(index, e.target.value)}
                placeholder={"Enter title"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: "#fff",
                    color: "#333",
                  },
                }}
              />
              <IconButton onClick={() => removeInput(index)} sx={{ color: "#999" }} aria-label="Delete title">
                <CloseIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Box sx={{ textAlign: "center", mt: 1 }}>
          <IconButton
            aria-label="Add title"
            onClick={addInput}
            sx={{ borderColor: "#ccc", color: "#333", textTransform: "none" }}
          >
            <AddIcon />
          </IconButton>
        </Box>

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{ borderColor: "#ccc", color: "#333", textTransform: "none" }}
          >
            {t("saveDialog:cancel") || "Cancel"}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ backgroundColor: "#666", color: "#fff", textTransform: "none", '&:hover': { backgroundColor: "#555" } }}
          >
            {t("saveDialog:save") || "Save"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
