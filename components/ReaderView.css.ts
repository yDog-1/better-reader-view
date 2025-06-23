import { style, globalStyle } from '@vanilla-extract/css';
import { themeVars } from '../utils/theme.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const content = undefined;

export const readerContainer = style({
  all: 'initial',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: themeVars.color.background,
  zIndex: 2147483647,
  overflow: 'auto',
  boxSizing: 'border-box',
});

export const contentContainer = style({
  fontFamily: themeVars.font.family,
  lineHeight: '1.7',
  maxWidth: '70ch',
  margin: `${themeVars.spacing.large} auto`,
  padding: themeVars.spacing.large,
  color: themeVars.color.text,
  fontSize: themeVars.font.size.medium,
  boxSizing: 'border-box',
});

export const title = style({
  fontSize: themeVars.font.size.xlarge,
  marginBottom: '1em',
  color: themeVars.color.text,
  fontWeight: themeVars.font.weight.bold,
  fontFamily: 'inherit',
  lineHeight: '1.2',
});

export const contentArea = style({
  fontSize: themeVars.font.size.medium,
  color: themeVars.color.text,
});

export const styleButton = style({
  position: 'fixed',
  top: themeVars.spacing.medium,
  right: themeVars.spacing.medium,
  padding: '8px 12px',
  backgroundColor: themeVars.color.accent,
  color: themeVars.color.background,
  border: 'none',
  borderRadius: themeVars.borderRadius.small,
  fontSize: themeVars.font.size.small,
  fontFamily: themeVars.font.family,
  cursor: 'pointer',
  zIndex: 2147483648,

  ':hover': {
    opacity: 0.8,
  },
});

// Global styles for content elements within the reader view
globalStyle(`${contentArea} *`, {
  all: 'unset',
  display: 'revert',
  boxSizing: 'border-box',
});

globalStyle(`${contentArea} p, ${contentArea} li, ${contentArea} blockquote`, {
  fontSize: themeVars.font.size.medium,
  marginBottom: '1em',
  lineHeight: '1.7',
  fontFamily: 'inherit',
  color: themeVars.color.text,
});

globalStyle(`${contentArea} a`, {
  color: themeVars.color.accent,
  textDecoration: 'underline',
});

globalStyle(`${contentArea} img, ${contentArea} video, ${contentArea} figure`, {
  maxWidth: '100%',
  height: 'auto',
  margin: '1.5em 0',
  display: 'block',
});

globalStyle(`${contentArea} pre`, {
  backgroundColor: themeVars.color.border,
  padding: '1em',
  overflowX: 'auto',
  borderRadius: themeVars.borderRadius.small,
  fontFamily:
    '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
  fontSize: themeVars.font.size.small,
});

globalStyle(`${contentArea} code`, {
  fontFamily:
    '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
  fontSize: themeVars.font.size.small,
});

globalStyle(`${contentArea} ul, ${contentArea} ol`, {
  margin: '1em 0',
  paddingLeft: '2em',
});

globalStyle(`${contentArea} blockquote`, {
  margin: '1.5em 0',
  paddingLeft: '1em',
  borderLeft: `4px solid ${themeVars.color.border}`,
  fontStyle: 'italic',
});

globalStyle(`${contentArea} strong`, {
  fontWeight: themeVars.font.weight.bold,
});

globalStyle(`${contentArea} em`, {
  fontStyle: 'italic',
});

globalStyle(
  `${contentArea} h1, ${contentArea} h2, ${contentArea} h3, ${contentArea} h4, ${contentArea} h5, ${contentArea} h6`,
  {
    fontWeight: themeVars.font.weight.bold,
    marginBottom: '0.8em',
    marginTop: '1.2em',
    color: themeVars.color.text,
  }
);

globalStyle(`${contentArea} h1`, {
  fontSize: themeVars.font.size.xlarge,
});

globalStyle(`${contentArea} h2`, {
  fontSize: themeVars.font.size.large,
});

globalStyle(
  `${contentArea} h3, ${contentArea} h4, ${contentArea} h5, ${contentArea} h6`,
  {
    fontSize: themeVars.font.size.medium,
  }
);
