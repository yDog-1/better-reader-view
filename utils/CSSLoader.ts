import { CSSModuleContent } from './types';

/**
 * 静的CSSコンテンツの定義
 * WXTのビルドプロセスでインライン化される
 */

// テーマ用CSS
export const THEME_CSS = `
/* テーマ変数定義 */
:root {
  /* Light Theme */
  --color-text-light: #333333;
  --color-background-light: #ffffff;
  --color-accent-light: #0066cc;
  --color-border-light: #e0e0e0;

  /* Dark Theme */
  --color-text-dark: #e0e0e0;
  --color-background-dark: #1a1a1a;
  --color-accent-dark: #4da6ff;
  --color-border-dark: #404040;

  /* Sepia Theme */
  --color-text-sepia: #5c4b37;
  --color-background-sepia: #f4f1ea;
  --color-accent-sepia: #8b4513;
  --color-border-sepia: #d4c4a8;

  /* Font sizes */
  --font-size-small: 14px;
  --font-size-medium: 16px;
  --font-size-large: 18px;
  --font-size-xlarge: 24px;

  /* Font weights */
  --font-weight-normal: 400;
  --font-weight-bold: 600;

  /* Font families */
  --font-family-sans: "Hiragino Sans", "Yu Gothic UI", sans-serif;
  --font-family-serif: "Times New Roman", "Yu Mincho", serif;
  --font-family-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;

  /* Spacing */
  --spacing-small: 8px;
  --spacing-medium: 16px;
  --spacing-large: 24px;

  /* Border radius */
  --border-radius-small: 4px;
  --border-radius-medium: 8px;
}

/* テーマ適用クラス */
.theme-light {
  --color-text: var(--color-text-light);
  --color-background: var(--color-background-light);
  --color-accent: var(--color-accent-light);
  --color-border: var(--color-border-light);
}

.theme-dark {
  --color-text: var(--color-text-dark);
  --color-background: var(--color-background-dark);
  --color-accent: var(--color-accent-dark);
  --color-border: var(--color-border-dark);
}

.theme-sepia {
  --color-text: var(--color-text-sepia);
  --color-background: var(--color-background-sepia);
  --color-accent: var(--color-accent-sepia);
  --color-border: var(--color-border-sepia);
}

/* フォントファミリークラス */
.font-sans {
  --font-family: var(--font-family-sans);
}

.font-serif {
  --font-family: var(--font-family-serif);
}

.font-mono {
  --font-family: var(--font-family-mono);
}
`;

// ReaderView用CSS
export const READER_VIEW_CSS = `
.reader-container {
  all: initial;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--color-background);
  z-index: 2147483647;
  overflow: auto;
  box-sizing: border-box;
}

.content-container {
  font-family: var(--font-family, var(--font-family-sans));
  line-height: 1.7;
  max-width: 70ch;
  margin: var(--spacing-large) auto;
  padding: var(--spacing-large);
  color: var(--color-text);
  font-size: var(--font-size-medium);
  box-sizing: border-box;
}

.reader-title {
  font-size: var(--font-size-xlarge);
  margin-bottom: 1em;
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
  font-family: inherit;
  line-height: 1.2;
}

.content-area {
  font-size: var(--font-size-medium);
  color: var(--color-text);
}

.style-button {
  position: fixed;
  top: var(--spacing-medium);
  right: var(--spacing-medium);
  padding: 8px 12px;
  background-color: var(--color-accent);
  color: var(--color-background);
  border: none;
  border-radius: var(--border-radius-small);
  font-size: var(--font-size-small);
  font-family: var(--font-family, var(--font-family-sans));
  cursor: pointer;
  z-index: 2147483648;
}

.style-button:hover {
  opacity: 0.8;
}

/* Global styles for content elements within the reader view */
.content-area * {
  all: unset;
  display: revert;
  box-sizing: border-box;
}

.content-area p,
.content-area li,
.content-area blockquote {
  font-size: var(--font-size-medium);
  margin-bottom: 1em;
  line-height: 1.7;
  font-family: inherit;
  color: var(--color-text);
}

.content-area a {
  color: var(--color-accent);
  text-decoration: underline;
}

.content-area img,
.content-area video,
.content-area figure {
  max-width: 100%;
  height: auto;
  margin: 1.5em 0;
  display: block;
}

.content-area pre {
  background-color: var(--color-border);
  padding: 1em;
  overflow-x: auto;
  border-radius: var(--border-radius-small);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-small);
}

.content-area code {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-small);
}

.content-area ul,
.content-area ol {
  margin: 1em 0;
  padding-left: 2em;
}

.content-area blockquote {
  margin: 1.5em 0;
  padding-left: 1em;
  border-left: 4px solid var(--color-border);
  font-style: italic;
}

.content-area strong {
  font-weight: var(--font-weight-bold);
}

.content-area em {
  font-style: italic;
}

.content-area h1,
.content-area h2,
.content-area h3,
.content-area h4,
.content-area h5,
.content-area h6 {
  font-weight: var(--font-weight-bold);
  margin-bottom: 0.8em;
  margin-top: 1.2em;
  color: var(--color-text);
}

.content-area h1 {
  font-size: var(--font-size-xlarge);
}

.content-area h2 {
  font-size: var(--font-size-large);
}

.content-area h3,
.content-area h4,
.content-area h5,
.content-area h6 {
  font-size: var(--font-size-medium);
}
`;

// StylePanel用CSS
export const STYLE_PANEL_CSS = `
.style-panel {
  position: fixed;
  top: var(--spacing-medium);
  right: var(--spacing-medium);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-medium);
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2147483648;
  font-family: var(--font-family);
  font-size: var(--font-size-small);
  color: var(--color-text);
}

.panel-title {
  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-small);
  color: var(--color-text);
}

.control-group {
  margin-bottom: var(--spacing-small);
}

.control-label {
  display: block;
  margin-bottom: 4px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-normal);
  color: var(--color-text);
}

.control-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-small);
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: var(--font-size-small);
  font-family: inherit;
}

.control-button {
  padding: 6px 12px;
  border: 1px solid var(--color-accent);
  border-radius: var(--border-radius-small);
  background-color: var(--color-accent);
  color: var(--color-background);
  font-size: var(--font-size-small);
  font-family: inherit;
  cursor: pointer;
  margin-right: var(--spacing-small);
  margin-top: var(--spacing-small);
}

.control-button:hover {
  opacity: 0.8;
}

.close-button {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-small);
  background-color: transparent;
  color: var(--color-text);
  font-size: var(--font-size-small);
  font-family: inherit;
  cursor: pointer;
  margin-right: var(--spacing-small);
  margin-top: var(--spacing-small);
}

.close-button:hover {
  opacity: 0.8;
}
`;

/**
 * 全CSSモジュールの取得
 */
export function getAllCSSModules(): CSSModuleContent[] {
  return [
    { content: THEME_CSS, filename: 'theme.css' },
    { content: READER_VIEW_CSS, filename: 'ReaderView.css' },
    { content: STYLE_PANEL_CSS, filename: 'StylePanel.css' },
  ];
}

/**
 * 結合されたCSSコンテンツの取得
 */
export function getCombinedCSS(): string {
  return getAllCSSModules()
    .map(module => `/* ${module.filename} */\n${module.content}`)
    .join('\n\n');
}