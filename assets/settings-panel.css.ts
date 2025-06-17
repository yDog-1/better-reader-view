import { style, createVar } from "@vanilla-extract/css";

// CSS変数定義
const panelBg = createVar();
const panelBorder = createVar();
const textColor = createVar();
const buttonActiveBg = createVar();
const buttonActiveColor = createVar();
const buttonInactiveBg = createVar();
const buttonInactiveColor = createVar();

// メインパネルスタイル
export const settingsPanel = style({
  position: "fixed",
  top: "20px",
  right: "20px",
  width: "300px",
  backgroundColor: panelBg,
  border: `1px solid ${panelBorder}`,
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  zIndex: 1000000,
  fontFamily: "system-ui, -apple-system, sans-serif",

  vars: {
    [panelBg]: "#ffffff",
    [panelBorder]: "#ccc",
    [textColor]: "#333",
    [buttonActiveBg]: "#007acc",
    [buttonActiveColor]: "#ffffff",
    [buttonInactiveBg]: "#f8f9fa",
    [buttonInactiveColor]: "#333",
  },
});

export const settingsPanelHidden = style([
  settingsPanel,
  {
    display: "none",
  },
]);

export const settingsPanelVisible = style([
  settingsPanel,
  {
    display: "block",
  },
]);

// ヘッダースタイル
export const header = style({
  padding: "16px 20px",
  borderBottom: `1px solid #eee`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const title = style({
  margin: 0,
  fontSize: "16px",
  fontWeight: "bold",
  color: textColor,
});

export const closeButton = style({
  background: "none",
  border: "none",
  fontSize: "18px",
  cursor: "pointer",
  color: "#666",
  padding: "4px",

  ":hover": {
    color: "#000",
  },
});

// コンテンツスタイル
export const content = style({
  padding: "20px",
});

export const section = style({
  marginBottom: "20px",
});

export const sectionTitle = style({
  fontSize: "14px",
  fontWeight: "bold",
  color: textColor,
  marginBottom: "8px",
});

export const buttonGroup = style({
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
});

// ボタンスタイル
export const button = style({
  padding: "8px 12px",
  border: `1px solid #ddd`,
  borderRadius: "4px",
  background: buttonInactiveBg,
  color: buttonInactiveColor,
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "normal",
  transition: "all 0.2s ease",

  ":hover": {
    borderColor: "#007acc",
    backgroundColor: "#e6f3ff",
  },
});

export const buttonActive = style([
  button,
  {
    background: buttonActiveBg,
    color: buttonActiveColor,
    fontWeight: "bold",

    ":hover": {
      backgroundColor: "#0066aa",
      borderColor: "#0066aa",
    },
  },
]);

// テーマバリエーション
export const darkTheme = style({
  vars: {
    [panelBg]: "#2d2d2d",
    [panelBorder]: "#555",
    [textColor]: "#ffffff",
    [buttonActiveBg]: "#007acc",
    [buttonActiveColor]: "#ffffff",
    [buttonInactiveBg]: "#404040",
    [buttonInactiveColor]: "#cccccc",
  },
});

export const sepiaTheme = style({
  vars: {
    [panelBg]: "#f7f3e9",
    [panelBorder]: "#d4c5a0",
    [textColor]: "#5c4b37",
    [buttonActiveBg]: "#8b7355",
    [buttonActiveColor]: "#f7f3e9",
    [buttonInactiveBg]: "#ede6d3",
    [buttonInactiveColor]: "#5c4b37",
  },
});

export const lightTheme = style({
  vars: {
    [panelBg]: "#ffffff",
    [panelBorder]: "#ccc",
    [textColor]: "#333",
    [buttonActiveBg]: "#007acc",
    [buttonActiveColor]: "#ffffff",
    [buttonInactiveBg]: "#f8f9fa",
    [buttonInactiveColor]: "#333",
  },
});
