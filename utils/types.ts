// 型安全なCSS管理のための型定義

export type CSSClassName = 
  // ReaderView関連
  | 'reader-container'
  | 'content-container'
  | 'reader-title'
  | 'content-area'
  | 'style-button'
  // StylePanel関連
  | 'style-panel'
  | 'panel-title'
  | 'control-group'
  | 'control-label'
  | 'control-select'
  | 'control-button'
  | 'close-button';

export type ThemeClassName = 
  | 'theme-light'
  | 'theme-dark'
  | 'theme-sepia';

export type FontFamilyClassName =
  | 'font-sans'
  | 'font-serif'
  | 'font-mono';

export interface CSSModuleContent {
  content: string;
  filename: string;
}

export interface StyleSheetManager {
  readonly isSupported: boolean;
  initialize(): Promise<void>;
  cleanup(): void;
  applyTheme(theme: ThemeClassName): void;
}