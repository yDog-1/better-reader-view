import { style } from "@vanilla-extract/css";

export const popupContainer = style({
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  color: "white",
  padding: "30px 50px",
  borderRadius: "10px",
  zIndex: 9999,
  fontSize: "24px",
  textAlign: "center",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
});

// テーマバリエーション
export const popupLight = style([
  popupContainer,
  {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    color: "#000000",
    border: "1px solid #e0e0e0",
  },
]);

export const popupDark = style([
  popupContainer,
  {
    backgroundColor: "rgba(30, 30, 30, 0.95)",
    color: "#ffffff",
  },
]);

export const popupSepia = style([
  popupContainer,
  {
    backgroundColor: "rgba(115, 96, 68, 0.95)",
    color: "#f7f3e9",
  },
]);
