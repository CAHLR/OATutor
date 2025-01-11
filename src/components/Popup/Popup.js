import React, { useEffect } from "react";
import "./Popup.css";

const Popup = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      console.log("Popup open")    
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);
  
  if (!isOpen) return null;

  return (
    <div className="popup">
      <div className="popup-content">
        <button className="close-popup" onClick={onClose}>
            <img src={`${process.env.PUBLIC_URL}/static/images/icons/close_icon.png`} 
            alt="closeIcon" 
            className="close-icon" />
        </button>
        {children}                          
      </div>
    </div>
  );
};

export default Popup;