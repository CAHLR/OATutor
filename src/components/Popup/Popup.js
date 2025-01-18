import React from "react";
import Modal from "@material-ui/core/Modal";
import Box from "@material-ui/core/Box";
import IconButton from '@material-ui/core/IconButton';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import { withStyles } from "@material-ui/core/styles";
import { popupStyles } from "./popup-styles.js";

const Popup = ({ classes, isOpen, onClose, children }) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
    > 
      <Box className={classes.popupContent}>
        <IconButton
          onClick={onClose}
          className={classes.button}
        >
            <CloseRoundedIcon 
              className={classes.iconButton} 
            />
        </IconButton>
        {children}                          
      </Box>
    </Modal>
  );
};

export default withStyles(popupStyles)(Popup);