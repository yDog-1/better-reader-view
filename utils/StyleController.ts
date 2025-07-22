import {
  FontFamilyClassName,
  StyleSheetManager,
  ThemeDefinition,
  ThemeRegistry,
} from './types';
import { ExtensionStyleSheetManager } from './StyleSheetManager';
import { DefaultThemeRegistry } from './ThemeRegistry';
import { builtInThemes } from './builtInThemes';
import {
  ThemeNotFoundError,
  StyleSystemInitializationError,
  CSSVariableApplicationError,
  StorageError,
  ThemeRegistrationError,
  ErrorHandler,
  withErrorHandling,
  withAsyncErrorHandling,
} from './errors';
import { StorageManager, type ReaderViewStyleConfig } from './storage-config';
import { BrowserAPIManager } from './BrowserAPIManager';

export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type FontFamily = 'sans-serif' | 'serif' | 'monospace';

export interface StyleConfig {
  theme: string; // ThemeType から string に変更してプラガブル対応
  fontSize: FontSize;
  fontFamily: FontFamily;
  customFontSize?: number;
}

/**
 * プラガブルテーマシステム対応の型安全なスタイル管理システム
 * Open/Closed Principle に従った設計で、型修正なしで新しいテーマを追加可能
 */
export class StyleController {
  private config: StyleConfig;
  private styleSheetManager: ExtensionStyleSheetManager | StyleSheetManager;
  private themeRegistry: ThemeRegistry;

  private readonly fontFamilyClasses: Record<FontFamily, FontFamilyClassName> =
    {
      'sans-serif': 'font-sans',
      serif: 'font-serif',
      monospace: 'font-mono',
    };

  constructor(
    initialConfig: StyleConfig = {
      theme: 'light',
      fontSize: 'medium',
      fontFamily: 'sans-serif',
    },
    styleSheetManager?: ExtensionStyleSheetManager | StyleSheetManager,
    themeRegistry?: ThemeRegistry
  ) {
    this.config = initialConfig;
    this.styleSheetManager =
      (styleSheetManager as ExtensionStyleSheetManager) ||
      new ExtensionStyleSheetManager();

    // テーマレジストリの初期化
    this.themeRegistry = themeRegistry || new DefaultThemeRegistry();

    // 組み込みテーマを登録
    this.initializeBuiltInThemes();
  }

  /**
   * 組み込みテーマの初期化
   */
  private initializeBuiltInThemes(): void {
    withErrorHandling(
      () => {
        builtInThemes.forEach((theme) => {
          this.themeRegistry.registerTheme(theme);
        });
        return true;
      },
      (cause) =>
        new StyleSystemInitializationError(
          '組み込みテーマの初期化に失敗しました',
          cause
        )
    );
  }

  /**
   * スタイルシステムの初期化
   * 非同期処理を適切に処理
   */
  async initializeStyles(): Promise<void> {
    await withAsyncErrorHandling(
      () => this.styleSheetManager.initialize(),
      (cause) =>
        new StyleSystemInitializationError(
          'スタイルシステムの初期化に失敗しました',
          cause
        )
    );
  }

  /**
   * 型安全なテーマクラス名の取得
   */
  getThemeClass(): string {
    return (
      withErrorHandling(
        () => {
          const theme = this.themeRegistry.getTheme(this.config.theme);
          if (!theme) {
            throw new ThemeNotFoundError(
              this.config.theme,
              this.themeRegistry.getThemeIds()
            );
          }
          return theme.className;
        },
        (_cause) =>
          new ThemeNotFoundError(
            this.config.theme,
            this.themeRegistry.getThemeIds()
          )
      ) ?? 'theme-light'
    );
  }

  /**
   * 型安全なフォントファミリークラス名の取得
   */
  getFontFamilyClass(): FontFamilyClassName {
    return this.fontFamilyClasses[this.config.fontFamily];
  }

  /**
   * カスタムスタイルプロパティの取得
   * CSS変数のオーバーライド用
   */
  getCustomStyles(): Record<string, string> {
    const styles: Record<string, string> = {};

    // フォントサイズマッピング
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '24px',
    };

    // ベースフォントサイズの設定
    const baseFontSize = this.config.customFontSize
      ? `${this.config.customFontSize}px`
      : fontSizeMap[this.config.fontSize];

    styles['--font-size'] = baseFontSize;

    // 要素別フォントサイズの計算
    const baseSizeNum = parseFloat(baseFontSize);
    styles['--title-font-size'] = `${baseSizeNum * 1.5}px`;
    styles['--heading-font-size'] = `${baseSizeNum * 1.125}px`;
    styles['--button-font-size'] = `${Math.max(baseSizeNum * 0.875, 12)}px`;

    return styles;
  }

  /**
   * DOM要素にスタイルクラスを適用
   * 型安全性を確保
   */
  applyStylesToElement(element: HTMLElement): void {
    withErrorHandling(
      () => {
        // 既存のテーマクラスを削除
        this.removeAllThemeClasses(element);

        // 既存のフォントファミリークラスを削除
        Object.values(this.fontFamilyClasses).forEach((className) => {
          element.classList.remove(className);
        });

        // 新しいクラスを適用
        element.classList.add(this.getThemeClass());
        element.classList.add(this.getFontFamilyClass());

        // カスタムスタイルとテーマのCSS変数を適用
        this.applyCustomStyles(element);
        this.applyThemeCSSVariables(element);
        return true;
      },
      (cause) =>
        new CSSVariableApplicationError(
          'element styles',
          'multiple styles',
          cause
        )
    );
  }

  /**
   * 全てのテーマクラスを要素から削除
   */
  private removeAllThemeClasses(element: HTMLElement): void {
    this.themeRegistry.getAvailableThemes().forEach((theme) => {
      element.classList.remove(theme.className);
    });
  }

  /**
   * カスタムスタイルを適用
   */
  private applyCustomStyles(element: HTMLElement): void {
    withErrorHandling(
      () => {
        const customStyles = this.getCustomStyles();
        Object.entries(customStyles).forEach(([property, value]) => {
          element.style.setProperty(property, value);
        });
        return true;
      },
      (cause) =>
        new CSSVariableApplicationError(
          'custom styles',
          'multiple custom properties',
          cause
        )
    );
  }

  /**
   * テーマのCSS変数を適用
   */
  private applyThemeCSSVariables(element: HTMLElement): void {
    withErrorHandling(
      () => {
        const theme = this.themeRegistry.getTheme(this.config.theme);
        if (theme) {
          Object.entries(theme.cssVariables).forEach(([property, value]) => {
            element.style.setProperty(property, value);
          });
        }
        return true;
      },
      (cause) =>
        new CSSVariableApplicationError(
          'theme CSS variables',
          this.config.theme,
          cause
        )
    );
  }

  /**
   * テーマの変更
   */
  setTheme(themeId: string): void {
    withErrorHandling(
      () => {
        if (!this.themeRegistry.hasTheme(themeId)) {
          throw new ThemeNotFoundError(
            themeId,
            this.themeRegistry.getThemeIds()
          );
        }
        this.config.theme = themeId;
        this.styleSheetManager.applyTheme(this.getThemeClass());
        return true;
      },
      (_cause) =>
        new ThemeNotFoundError(themeId, this.themeRegistry.getThemeIds())
    );
  }

  /**
   * フォントサイズの変更
   */
  setFontSize(fontSize: FontSize): void {
    this.config.fontSize = fontSize;
    this.config.customFontSize = undefined;
  }

  /**
   * カスタムフォントサイズの設定
   */
  setCustomFontSize(size: number): void {
    this.config.customFontSize = size;
  }

  /**
   * フォントファミリーの変更
   */
  setFontFamily(fontFamily: FontFamily): void {
    this.config.fontFamily = fontFamily;
  }

  /**
   * 現在の設定の取得
   */
  getConfig(): StyleConfig {
    return { ...this.config };
  }

  /**
   * 設定の部分更新
   */
  updateConfig(newConfig: Partial<StyleConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 設定のブラウザストレージへの保存
   * WXT Storage APIを使用した型安全な保存
   */
  async saveToStorage(): Promise<void> {
    if (!BrowserAPIManager.isStorageSupported()) {
      return;
    }

    await withAsyncErrorHandling(
      async () => {
        const storageConfig: ReaderViewStyleConfig = {
          theme: this.config.theme as ReaderViewStyleConfig['theme'],
          fontSize: this.config.fontSize,
          fontFamily: this.config.fontFamily,
        };

        await StorageManager.updateStyleConfig(storageConfig);
      },
      (cause) => new StorageError('save style config', cause)
    );
  }

  /**
   * ブラウザストレージからの設定読み込み
   * WXT Storage APIを使用した型安全な読み込み
   */
  async loadFromStorage(): Promise<boolean> {
    try {
      if (!BrowserAPIManager.isStorageSupported()) {
        return false;
      }

      const storageConfig = await StorageManager.getStyleConfig();

      this.config = {
        theme: storageConfig.theme,
        fontSize: storageConfig.fontSize,
        fontFamily: storageConfig.fontFamily,
        customFontSize: this.config.customFontSize, // Preserve existing custom font size value
      };

      return true;
    } catch (cause) {
      // Continue with default settings even if an error occurs
      const error = cause instanceof Error ? cause : new Error(String(cause));
      ErrorHandler.handle(new StorageError('load style config', error));
      return false;
    }
  }

  /**
   * 設定のリセット
   * WXT Storage APIを使用したリセット
   */
  async reset(): Promise<void> {
    this.config = {
      theme: 'light',
      fontSize: 'medium',
      fontFamily: 'sans-serif',
    };

    await withAsyncErrorHandling(
      async () => {
        if (BrowserAPIManager.isStorageSupported()) {
          await StorageManager.resetAllSettings();
        }
      },
      (cause) => new StorageError('reset style config', cause)
    );
  }

  /**
   * 新しいテーマを登録
   */
  registerTheme(theme: ThemeDefinition): void {
    withErrorHandling(
      () => {
        this.themeRegistry.registerTheme(theme);
        return true;
      },
      (_cause) => new ThemeRegistrationError(theme.id, 'registration failed')
    );
  }

  /**
   * テーマの登録を解除
   */
  unregisterTheme(themeId: string): boolean {
    return this.themeRegistry.unregisterTheme(themeId);
  }

  /**
   * 利用可能なテーマの取得
   */
  getAvailableThemes(): ThemeDefinition[] {
    return this.themeRegistry.getAvailableThemes();
  }

  /**
   * 現在のテーマ定義を取得
   */
  getCurrentTheme(): ThemeDefinition | null {
    return this.themeRegistry.getTheme(this.config.theme);
  }

  /**
   * テーマが存在するかチェック
   */
  hasTheme(themeId: string): boolean {
    return this.themeRegistry.hasTheme(themeId);
  }

  /**
   * クリーンアップ処理
   */
  cleanup(): void {
    this.styleSheetManager.cleanup();
  }

  /**
   * デバッグ情報の取得
   */
  getDebugInfo(): object {
    return {
      config: this.config,
      themeClass: this.getThemeClass(),
      fontFamilyClass: this.getFontFamilyClass(),
      customStyles: this.getCustomStyles(),
      styleSheetManager: this.styleSheetManager.getDebugInfo(),
      themeRegistry: this.themeRegistry.getDebugInfo(),
      currentTheme: this.getCurrentTheme(),
    };
  }

  /**
   * スタイルシステムが準備完了かチェック
   */
  isReady(): boolean {
    return this.styleSheetManager.isReady();
  }

  /**
   * StyleSheetManagerを設定 (内部専用)
   */
  private setStyleSheetManager(manager: StyleSheetManager): void {
    this.styleSheetManager = manager;
  }

  /**
   * StyleSheetManagerを更新 (外部用)
   */
  updateStyleSheetManager(manager: StyleSheetManager): void {
    if (!manager || !manager.isReady()) {
      throw new Error(
        'Invalid StyleSheetManager: The manager must be properly initialized and ready.'
      );
    }
    this.setStyleSheetManager(manager);
  }

  /**
   * 現在のスタイルを適用
   */
  applyCurrentStyle(): void {
    this.styleSheetManager.applyTheme(this.getThemeClass());

    // CSS変数の適用
    const customStyles = this.getCustomStyles();
    Object.entries(customStyles).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });

    // テーマのCSS変数の適用
    const theme = this.getCurrentTheme();
    if (theme) {
      Object.entries(theme.cssVariables).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
      });
    }
  }
}
