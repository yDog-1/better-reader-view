import '@testing-library/jest-dom';

// vanilla-extractのCSSファイルをモック
import { vi } from 'vitest';

// グローバルなCSSモック
vi.mock('../utils/theme.css.ts', () => ({
  themeVars: {
    color: {
      text: '--text-color',
      background: '--bg-color',
      accent: '--accent-color',
      border: '--border-color',
    },
    font: {
      family: '--font-family',
      size: {
        small: '--font-size-small',
        medium: '--font-size-medium',
        large: '--font-size-large',
        xlarge: '--font-size-xlarge',
      },
      weight: {
        normal: '--font-weight-normal',
        bold: '--font-weight-bold',
      },
    },
    spacing: {
      small: '--spacing-small',
      medium: '--spacing-medium',
      large: '--spacing-large',
    },
    borderRadius: {
      small: '--border-radius-small',
      medium: '--border-radius-medium',
    },
  },
  lightTheme: 'light-theme-class',
  darkTheme: 'dark-theme-class',
  sepiaTheme: 'sepia-theme-class',
}));

// assignInlineVarsのモック
vi.mock('@vanilla-extract/dynamic', () => ({
  assignInlineVars: vi.fn((vars: Record<string, string>) => vars),
}));