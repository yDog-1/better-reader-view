import { style } from "@vanilla-extract/css";

export const integratedReaderContainerVisible = style({
  display: "block",
});

export const integratedReaderContainerHidden = style({
  display: "none",
});

export const toolbarVisible = style({
  position: "fixed",
  top: "20px",
  left: "20px",
  display: "flex",
  gap: "10px",
  zIndex: 1000001,
  opacity: 1,
  pointerEvents: "auto",
});

export const toolbarHidden = style({
  position: "fixed",
  top: "20px",
  left: "20px",
  display: "flex",
  gap: "10px",
  zIndex: 1000001,
  opacity: 0,
  pointerEvents: "none",
});

export const settingsButton = style({
  padding: "10px 16px",
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
  transition: "background-color 0.2s ease",

  ":hover": {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
});

export const closeToolbarButton = style({
  padding: "10px 16px",
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
  transition: "background-color 0.2s ease",

  ":hover": {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
});
