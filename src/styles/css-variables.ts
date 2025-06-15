import { createVar, createTheme, createThemeContract } from '@vanilla-extract/css'

// Define the contract for type-safe theme variables
export const readerThemeVars = createThemeContract({
  color: {
    background: null,
    text: null,
    link: null,
    linkHover: null,
    codeBg: null,
    codeText: null,
    blockquoteBorder: null,
    blockquoteBg: null,
  },
  font: {
    size: null,
    family: null,
    lineHeight: null,
  },
  layout: {
    maxWidth: null,
    padding: null,
    borderRadius: null,
    shadow: null,
  },
})

// Create individual CSS variables for direct manipulation
export const readerVars = {
  backgroundColor: createVar(),
  textColor: createVar(),
  fontSize: createVar(),
  fontFamily: createVar(),
  lineHeight: createVar(),
  maxWidth: createVar(),
  padding: createVar(),
  borderRadius: createVar(),
  shadow: createVar(),
  linkColor: createVar(),
  linkHoverColor: createVar(),
  codeBg: createVar(),
  codeColor: createVar(),
  blockquoteBorder: createVar(),
  blockquoteBg: createVar(),
}

// Default theme
export const lightTheme = createTheme(readerThemeVars, {
  color: {
    background: '#ffffff',
    text: '#333333',
    link: '#0066cc',
    linkHover: '#0052a3',
    codeBg: '#f8f9fa',
    codeText: '#e91e63',
    blockquoteBorder: '#e9ecef',
    blockquoteBg: '#f8f9fa',
  },
  font: {
    size: '16px',
    family: 'system-ui, -apple-system, sans-serif',
    lineHeight: '1.6',
  },
  layout: {
    maxWidth: '800px',
    padding: '40px 20px',
    borderRadius: '8px',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
})

// Dark theme
export const darkTheme = createTheme(readerThemeVars, {
  color: {
    background: '#1a1a1a',
    text: '#e0e0e0',
    link: '#4d9fff',
    linkHover: '#66b3ff',
    codeBg: '#2d2d2d',
    codeText: '#ff6b9d',
    blockquoteBorder: '#404040',
    blockquoteBg: '#2d2d2d',
  },
  font: {
    size: '16px',
    family: 'system-ui, -apple-system, sans-serif',
    lineHeight: '1.6',
  },
  layout: {
    maxWidth: '800px',
    padding: '40px 20px',
    borderRadius: '8px',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
})

// Sepia theme
export const sepiaTheme = createTheme(readerThemeVars, {
  color: {
    background: '#f4f1e8',
    text: '#5c4b37',
    link: '#8b4513',
    linkHover: '#a0522d',
    codeBg: '#ede7d3',
    codeText: '#d2691e',
    blockquoteBorder: '#d4c5a0',
    blockquoteBg: '#ede7d3',
  },
  font: {
    size: '16px',
    family: 'system-ui, -apple-system, sans-serif',
    lineHeight: '1.6',
  },
  layout: {
    maxWidth: '800px',
    padding: '40px 20px',
    borderRadius: '8px',
    shadow: '0 4px 12px rgba(92, 75, 55, 0.1)',
  },
})

// Theme mapping
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  sepia: sepiaTheme,
} as const

export type Theme = keyof typeof themes

// Font size variants
export const fontSizes = {
  small: '14px',
  medium: '16px',
  large: '18px',
  xlarge: '20px',
} as const

export type FontSize = keyof typeof fontSizes

// Font family variants
export const fontFamilies = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: '"Fira Code", "SF Mono", Consolas, monospace',
} as const

export type FontFamily = keyof typeof fontFamilies

// Legacy compatibility - map to CSS custom properties for dynamic updates
export const cssVariables = {
  '--reader-bg-color': readerVars.backgroundColor,
  '--reader-text-color': readerVars.textColor,
  '--reader-font-size': readerVars.fontSize,
  '--reader-font-family': readerVars.fontFamily,
  '--reader-line-height': readerVars.lineHeight,
  '--reader-max-width': readerVars.maxWidth,
  '--reader-padding': readerVars.padding,
  '--reader-border-radius': readerVars.borderRadius,
  '--reader-shadow': readerVars.shadow,
  '--reader-link-color': readerVars.linkColor,
  '--reader-link-hover-color': readerVars.linkHoverColor,
  '--reader-code-bg': readerVars.codeBg,
  '--reader-code-color': readerVars.codeColor,
  '--reader-blockquote-border': readerVars.blockquoteBorder,
  '--reader-blockquote-bg': readerVars.blockquoteBg,
} as const

export type CSSVariableKeys = keyof typeof cssVariables

// Legacy theme variables for compatibility
export const themeVariables = {
  light: {
    '--reader-bg-color': '#ffffff',
    '--reader-text-color': '#333333',
    '--reader-code-bg': '#f8f9fa',
    '--reader-blockquote-bg': '#f8f9fa',
    '--reader-blockquote-border': '#e9ecef'
  },
  dark: {
    '--reader-bg-color': '#1a1a1a',
    '--reader-text-color': '#e0e0e0',
    '--reader-code-bg': '#2d2d2d',
    '--reader-blockquote-bg': '#2d2d2d',
    '--reader-blockquote-border': '#404040'
  },
  sepia: {
    '--reader-bg-color': '#f4f1e8',
    '--reader-text-color': '#5c4b37',
    '--reader-code-bg': '#ede7d3',
    '--reader-blockquote-bg': '#ede7d3',
    '--reader-blockquote-border': '#d4c5a0'
  }
} as const

export const fontSizeVariables = {
  'font-small': { '--reader-font-size': '14px' },
  'font-medium': { '--reader-font-size': '16px' },
  'font-large': { '--reader-font-size': '18px' },
  'font-xlarge': { '--reader-font-size': '20px' }
} as const

export type FontSizeClass = keyof typeof fontSizeVariables

export const fontFamilyVariables = {
  'font-serif': { '--reader-font-family': 'Georgia, "Times New Roman", serif' },
  'font-sans': { '--reader-font-family': 'system-ui, -apple-system, "Segoe UI", sans-serif' },
  'font-mono': { '--reader-font-family': '"Fira Code", "SF Mono", Consolas, monospace' }
} as const

export type FontFamilyClass = keyof typeof fontFamilyVariables