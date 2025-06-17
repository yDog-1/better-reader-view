import { style } from "@vanilla-extract/css";
import { readerThemeVars, readerVars } from "./css-variables";

export const readerContainer = style({
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

  // Fallback to CSS variables for dynamic updates
  vars: {
    [readerVars.backgroundColor]: readerThemeVars.color.background,
    [readerVars.textColor]: readerThemeVars.color.text,
    [readerVars.fontSize]: readerThemeVars.font.size,
    [readerVars.fontFamily]: readerThemeVars.font.family,
    [readerVars.lineHeight]: readerThemeVars.font.lineHeight,
    [readerVars.maxWidth]: readerThemeVars.layout.maxWidth,
    [readerVars.padding]: readerThemeVars.layout.padding,
    [readerVars.borderRadius]: readerThemeVars.layout.borderRadius,
    [readerVars.shadow]: readerThemeVars.layout.shadow,
    [readerVars.linkColor]: readerThemeVars.color.link,
    [readerVars.linkHoverColor]: readerThemeVars.color.linkHover,
    [readerVars.codeBg]: readerThemeVars.color.codeBg,
    [readerVars.codeColor]: readerThemeVars.color.codeText,
    [readerVars.blockquoteBorder]: readerThemeVars.color.blockquoteBorder,
    [readerVars.blockquoteBg]: readerThemeVars.color.blockquoteBg,
  },
});

export const readerContent = style({
  maxWidth: readerThemeVars.layout.maxWidth,
  margin: "0 auto",
  padding: readerThemeVars.layout.padding,
});

export const readerTitle = style({
  fontSize: "2.5em",
  fontWeight: "bold",
  marginBottom: "0.5em",
  color: readerThemeVars.color.text,
});

export const readerByline = style({
  fontSize: "0.9em",
  color: `color-mix(in srgb, ${readerThemeVars.color.text} 70%, transparent)`,
  marginBottom: "2em",
});

export const readerBody = style({
  selectors: {
    "& p": {
      marginBottom: "1.2em",
      lineHeight: readerThemeVars.font.lineHeight,
    },
    "& h1, & h2, & h3, & h4, & h5, & h6": {
      marginTop: "2em",
      marginBottom: "1em",
      lineHeight: "1.3",
      color: readerThemeVars.color.text,
    },
    "& h1": { fontSize: "2em" },
    "& h2": { fontSize: "1.5em" },
    "& h3": { fontSize: "1.25em" },
    "& a": {
      color: readerThemeVars.color.link,
      textDecoration: "underline",
    },
    "& a:hover": {
      color: readerThemeVars.color.linkHover,
    },
    "& code": {
      backgroundColor: readerThemeVars.color.codeBg,
      color: readerThemeVars.color.codeText,
      padding: "0.2em 0.4em",
      borderRadius: "3px",
      fontSize: "0.9em",
    },
    "& pre": {
      backgroundColor: readerThemeVars.color.codeBg,
      padding: "1em",
      borderRadius: readerThemeVars.layout.borderRadius,
      overflow: "auto",
      marginBottom: "1.2em",
    },
    "& pre code": {
      backgroundColor: "transparent",
      padding: 0,
    },
    "& blockquote": {
      borderLeft: `4px solid ${readerThemeVars.color.blockquoteBorder}`,
      backgroundColor: readerThemeVars.color.blockquoteBg,
      padding: "1em",
      margin: "1.5em 0",
      borderRadius: readerThemeVars.layout.borderRadius,
    },
    "& img": {
      maxWidth: "100%",
      height: "auto",
      borderRadius: readerThemeVars.layout.borderRadius,
      boxShadow: readerThemeVars.layout.shadow,
      marginBottom: "1.2em",
    },
    "& ul, & ol": {
      paddingLeft: "2em",
      marginBottom: "1.2em",
    },
    "& li": {
      marginBottom: "0.5em",
    },
  },
});

export const closeButton = style({
  position: "fixed",
  top: "20px",
  right: "20px",
  backgroundColor: `color-mix(in srgb, ${readerThemeVars.color.text} 10%, transparent)`,
  color: readerThemeVars.color.text,
  border: "none",
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  zIndex: 1000000,

  ":hover": {
    backgroundColor: `color-mix(in srgb, ${readerThemeVars.color.text} 20%, transparent)`,
  },
});
