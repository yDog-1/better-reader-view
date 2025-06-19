import { style } from "@vanilla-extract/css";
import { readerThemeVars } from "./css-variables";

// Content script styles for better reader view
export const readerViewContainer = style({
  // Reset all styles to avoid conflicts with page styles
  all: "initial",

  // Apply modern reader view styling
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: readerThemeVars.color.background,
  color: readerThemeVars.color.text,
  fontFamily: readerThemeVars.font.family,
  fontSize: readerThemeVars.font.size,
  lineHeight: readerThemeVars.font.lineHeight,
  zIndex: 999999,
  overflow: "auto",

  // Ensure isolation from page styles
  isolation: "isolate",
  contain: "layout style paint",
});

export const readerContent = style({
  maxWidth: readerThemeVars.layout.maxWidth,
  margin: "0 auto",
  padding: readerThemeVars.layout.padding,
});

export const readerTitle = style({
  fontSize: "2.2em",
  marginBottom: "1em",
  color: readerThemeVars.color.text,
  fontWeight: 600,
  lineHeight: "1.2",
});

export const readerArticleContent = style({
  fontSize: "1.1em",
  lineHeight: readerThemeVars.font.lineHeight,

  selectors: {
    "& p, & li, & blockquote": {
      marginBottom: "1em",
    },
    "& a": {
      color: readerThemeVars.color.link,
      textDecoration: "underline",
    },
    "& a:hover": {
      color: readerThemeVars.color.linkHover,
    },
    "& img, & video, & figure": {
      maxWidth: "100%",
      height: "auto",
      margin: "1.5em 0",
    },
    "& pre": {
      backgroundColor: readerThemeVars.color.codeBg,
      color: readerThemeVars.color.codeText,
      padding: "1em",
      overflowX: "auto",
      borderRadius: readerThemeVars.layout.borderRadius,
      margin: "1em 0",
    },
    "& code": {
      fontFamily:
        '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
      backgroundColor: readerThemeVars.color.codeBg,
      color: readerThemeVars.color.codeText,
      padding: "0.2em 0.4em",
      borderRadius: "3px",
      fontSize: "0.9em",
    },
    "& blockquote": {
      borderLeft: `3px solid ${readerThemeVars.color.blockquoteBorder}`,
      backgroundColor: readerThemeVars.color.blockquoteBg,
      paddingLeft: "1em",
      margin: "1em 0",
      fontStyle: "italic",
    },
    "& h2, & h3, & h4, & h5, & h6": {
      marginTop: "2em",
      marginBottom: "0.5em",
      fontWeight: 600,
      lineHeight: "1.3",
    },
    "& h2": {
      fontSize: "1.8em",
    },
    "& h3": {
      fontSize: "1.5em",
    },
    "& h4": {
      fontSize: "1.3em",
    },
    "& ul, & ol": {
      paddingLeft: "2em",
      marginBottom: "1em",
    },
    "& li": {
      marginBottom: "0.5em",
    },
  },
});

// Shadow DOM specific styles for isolation
export const shadowRoot = style({
  all: "initial",
  display: "block",
});

// Close button styles
export const closeButton = style({
  position: "fixed",
  top: "20px",
  right: "20px",
  background: "rgba(0, 0, 0, 0.7)",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  fontSize: "20px",
  cursor: "pointer",
  zIndex: 1000000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  ":hover": {
    background: "rgba(0, 0, 0, 0.9)",
  },
});

// Byline styles
export const readerByline = style({
  fontSize: "0.9em",
  color: "#666",
  marginBottom: "2em",
  fontStyle: "italic",
});

// Fallback styles for non-shadow DOM environments
export const readerViewInjected = style({
  isolation: "isolate",
  contain: "layout style paint",

  // Ensure this container doesn't interfere with page layout
  position: "relative",
  zIndex: 999999,
});
