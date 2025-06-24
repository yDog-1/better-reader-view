import { style } from '@vanilla-extract/css';
import { themeVars } from '../utils/theme.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const content = undefined;

export const panel = style({
  position: 'fixed',
  top: themeVars.spacing.medium,
  right: themeVars.spacing.medium,
  backgroundColor: themeVars.color.background,
  border: `1px solid ${themeVars.color.border}`,
  borderRadius: themeVars.borderRadius.medium,
  padding: themeVars.spacing.medium,
  minWidth: '200px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  zIndex: 2147483648, // ReaderViewより上に表示
  fontFamily: themeVars.font.family,
  fontSize: themeVars.font.size.small,
  color: themeVars.color.text,
});

export const panelTitle = style({
  fontSize: themeVars.font.size.medium,
  fontWeight: themeVars.font.weight.bold,
  marginBottom: themeVars.spacing.small,
  color: themeVars.color.text,
});

export const controlGroup = style({
  marginBottom: themeVars.spacing.small,
});

export const label = style({
  display: 'block',
  marginBottom: '4px',
  fontSize: themeVars.font.size.small,
  fontWeight: themeVars.font.weight.normal,
  color: themeVars.color.text,
});

export const select = style({
  width: '100%',
  padding: '6px 8px',
  border: `1px solid ${themeVars.color.border}`,
  borderRadius: themeVars.borderRadius.small,
  backgroundColor: themeVars.color.background,
  color: themeVars.color.text,
  fontSize: themeVars.font.size.small,
  fontFamily: 'inherit',
});

export const button = style({
  padding: '6px 12px',
  border: `1px solid ${themeVars.color.accent}`,
  borderRadius: themeVars.borderRadius.small,
  backgroundColor: themeVars.color.accent,
  color: themeVars.color.background,
  fontSize: themeVars.font.size.small,
  fontFamily: 'inherit',
  cursor: 'pointer',
  marginRight: themeVars.spacing.small,
  marginTop: themeVars.spacing.small,

  ':hover': {
    opacity: 0.8,
  },
});

export const closeButton = style([
  button,
  {
    backgroundColor: 'transparent',
    color: themeVars.color.text,
    border: `1px solid ${themeVars.color.border}`,
  },
]);
