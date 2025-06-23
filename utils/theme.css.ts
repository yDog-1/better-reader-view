import { createThemeContract, createTheme } from '@vanilla-extract/css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const content = undefined;

export const themeVars = createThemeContract({
  color: {
    text: null,
    background: null,
    accent: null,
    border: null,
  },
  font: {
    family: null,
    size: {
      small: null,
      medium: null,
      large: null,
      xlarge: null,
    },
    weight: {
      normal: null,
      bold: null,
    },
  },
  spacing: {
    small: null,
    medium: null,
    large: null,
  },
  borderRadius: {
    small: null,
    medium: null,
  },
});

export const lightTheme = createTheme(themeVars, {
  color: {
    text: '#333333',
    background: '#ffffff',
    accent: '#0066cc',
    border: '#e0e0e0',
  },
  font: {
    family: '"Hiragino Sans", "Yu Gothic UI", sans-serif',
    size: {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '24px',
    },
    weight: {
      normal: '400',
      bold: '600',
    },
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
  },
});

export const darkTheme = createTheme(themeVars, {
  color: {
    text: '#e0e0e0',
    background: '#1a1a1a',
    accent: '#4da6ff',
    border: '#404040',
  },
  font: {
    family: '"Hiragino Sans", "Yu Gothic UI", sans-serif',
    size: {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '24px',
    },
    weight: {
      normal: '400',
      bold: '600',
    },
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
  },
});

export const sepiaTheme = createTheme(themeVars, {
  color: {
    text: '#5c4b37',
    background: '#f4f1ea',
    accent: '#8b4513',
    border: '#d4c4a8',
  },
  font: {
    family: '"Hiragino Sans", "Yu Gothic UI", sans-serif',
    size: {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '24px',
    },
    weight: {
      normal: '400',
      bold: '600',
    },
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
  },
});
