import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";

const PersonalizedMessageModal = ({
  open,
  loading,
  message,
  error,
  onClose,
}) => (
  <Dialog
    open={open}
    disableBackdropClick
    disableEscapeKeyDown
    aria-labelledby="personalized-message-title"
  >
    <DialogTitle id="personalized-message-title">
      Welcome to your lesson
    </DialogTitle>
    <DialogContent dividers>
      {loading ? (
        <Box display="flex" alignItems="center">
          <CircularProgress size={24} />
          <Typography
            variant="body2"
            style={{ marginLeft: 12 }}
            color="textSecondary"
          >
            Crafting a personalized orientation for you...
          </Typography>
        </Box>
      ) : error ? (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      ) : (
        <Typography variant="body1">{message}</Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button
        color="primary"
        variant="contained"
        onClick={onClose}
        disabled={loading}
      >
        Start Lesson
      </Button>
    </DialogActions>
  </Dialog>
);

export default PersonalizedMessageModal;

