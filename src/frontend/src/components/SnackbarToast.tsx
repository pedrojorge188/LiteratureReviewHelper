import Alert from "@mui/material/Alert";
import Snackbar, {
  SnackbarCloseReason,
  SnackbarOrigin,
} from "@mui/material/Snackbar";
import * as React from "react";

interface Snack {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  messageStr: string;
  type: "error" | "success" | "info" | "warning";
}

export const SnackbarToast = (props: Snack) => {
  const { open, setOpen, messageStr, type } = props;
  const [snackbarOrigin] = React.useState<SnackbarOrigin>({
    vertical: "bottom", // Canto inferior
    horizontal: "right", // Canto direito
  });
  const { vertical, horizontal } = snackbarOrigin;

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical, horizontal }}
      >
        <Alert
          onClose={handleClose}
          severity={type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {messageStr}
        </Alert>
      </Snackbar>
    </>
  );
};
