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
  readonly userMessage: string;
  readonly context?: Record<string, unknown>;
  readonly cause?: Error;
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

// Storage-related types
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type FontFamily = 'sans-serif' | 'serif' | 'monospace';
export type Theme = 'light' | 'dark' | 'sepia';

/**
 * Reader Viewのスタイル設定インターフェース
 */
export interface ReaderViewStyleConfig {
  theme: Theme;
  fontSize: FontSize;
  fontFamily: FontFamily;
}

/**
 * Reader Viewの状態インターフェース
 */
export interface ReaderViewState {
  isActive: boolean;
  url?: string;
  title?: string;
}

/**
 * Storage operation types
 */
export type StorageArea = 'local' | 'session' | 'sync';

/**
 * Generic storage configuration interface
 */
export interface StorageConfig<T = unknown> {
  key: string;
  area: StorageArea;
  defaultValue: T;
}

/**
 * Pluggable storage manager interface
 */
export interface StorageManager<T = unknown> {
  get(config: StorageConfig<T>): Promise<T>;
  set(config: StorageConfig<T>, value: Partial<T>): Promise<void>;
  update(config: StorageConfig<T>, updates: Partial<T>): Promise<void>;
  reset(config: StorageConfig<T>): Promise<void>;
  clear(area?: StorageArea): Promise<void>;
}

/**
 * Storage event types for reactive updates
 */
export interface StorageChangeEvent<T = unknown> {
  key: string;
  area: StorageArea;
  oldValue?: T;
  newValue?: T;
}

export type StorageChangeListener<T = unknown> = (
  event: StorageChangeEvent<T>
) => void;
