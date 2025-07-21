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

export type ThemeClassName = 'theme-light' | 'theme-dark' | 'theme-sepia';

// プラガブルテーマシステムのインターフェース
export interface ThemeDefinition {
  readonly id: string;
  readonly name: string;
  readonly className: string;
  readonly cssVariables: Record<string, string>;
}

export interface ThemeRegistry {
  registerTheme(
    theme: ThemeDefinition,
    onWarning?: (message: string) => void
  ): void;
  unregisterTheme(themeId: string): boolean;
  getTheme(themeId: string): ThemeDefinition | null;
  getAvailableThemes(): ThemeDefinition[];
  hasTheme(themeId: string): boolean;
  getThemeIds(): string[];
  getDebugInfo(): object;
}

// カスタムエラークラスのインターフェース
export interface ReaderViewError extends Error {
  readonly code: string;
  readonly context?: Record<string, unknown>;
}

export type FontFamilyClassName = 'font-sans' | 'font-serif' | 'font-mono';

export interface CSSModuleContent {
  content: string;
  filename: string;
}

export interface StyleSheetManager {
  readonly isSupported: boolean;
  initialize(): Promise<void>;
  cleanup(): void;
  applyTheme(theme: string): void;
  isReady(): boolean;
  getDebugInfo(): DebugInfo;
}

export interface DebugInfo {
  isSupported: boolean;
  isInitialized: boolean;
  styleSheetType: string | null;
  adoptedStyleSheetsCount: number;
}

// Article type for reader view content
export interface Article {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string | null;
  dir: string | null;
  siteName: string | null;
  lang: string | null;
  publishedTime: string | null;
}

// ReaderViewManager リファクタリング用インターフェース
export interface DOMManager {
  createShadowContainer(doc: Document): HTMLElement;
  attachToDocument(container: HTMLElement, doc: Document): void;
  removeFromDocument(containerId: string, doc: Document): void;
  hideOriginalContent(doc: Document): string;
  restoreOriginalContent(doc: Document, originalDisplay: string): void;
}

export interface ReactRenderer {
  render(
    content: { title: string; content: string },
    shadowRoot: ShadowRoot,
    styleController: unknown
  ): unknown;
  unmount(root: unknown): void;
}

export interface LifecycleManager {
  activate(doc: Document): boolean;
  deactivate(doc: Document): void;
  isActive(): boolean;
}
