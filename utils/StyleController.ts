import {
  ThemeClassName,
  FontFamilyClassName,
  StyleSheetManager,
  ThemeDefinition,
  ThemeRegistry,
} from './types';
import { ExtensionStyleSheetManager } from './StyleSheetManager';
import { DefaultThemeRegistry } from './ThemeRegistry';
import { builtInThemes } from './builtInThemes';
import { ThemeNotFoundError, StyleSystemInitializationError } from './errors';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
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
    try {
      builtInThemes.forEach((theme) => {
        this.themeRegistry.registerTheme(theme);
      });
    } catch (error) {
      throw new StyleSystemInitializationError(
        '組み込みテーマの初期化に失敗しました',
        error as Error
      );
    }
  }

  /**
   * スタイルシステムの初期化
   * 非同期処理を適切に処理
   */
  async initializeStyles(): Promise<void> {
    try {
      await this.styleSheetManager.initialize();
    } catch (error) {
      console.warn('スタイルシステムの初期化に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 型安全なテーマクラス名の取得
   */
  getThemeClass(): string {
    const theme = this.themeRegistry.getTheme(this.config.theme);
    if (!theme) {
      throw new ThemeNotFoundError(
        this.config.theme,
        this.themeRegistry.getThemeIds()
      );
    }
    return theme.className;
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
      xlarge: '24px',
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
    const customStyles = this.getCustomStyles();
    Object.entries(customStyles).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  }

  /**
   * テーマのCSS変数を適用
   */
  private applyThemeCSSVariables(element: HTMLElement): void {
    const theme = this.themeRegistry.getTheme(this.config.theme);
    if (theme) {
      Object.entries(theme.cssVariables).forEach(([property, value]) => {
        element.style.setProperty(property, value);
      });
    }
  }

  /**
   * テーマの変更
   */
  setTheme(themeId: string): void {
    if (!this.themeRegistry.hasTheme(themeId)) {
      throw new ThemeNotFoundError(themeId, this.themeRegistry.getThemeIds());
    }
    this.config.theme = themeId;
    this.styleSheetManager.applyTheme(this.getThemeClass() as ThemeClassName);
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
   */
  async saveToStorage(): Promise<void> {
    try {
      await browser.storage.local.set({
        globalReaderViewStyleConfig: this.config,
      });
    } catch (error) {
      console.warn('スタイル設定の保存に失敗しました:', error);
    }
  }

  /**
   * ブラウザストレージからの設定読み込み
   */
  async loadFromStorage(): Promise<boolean> {
    try {
      const result = await browser.storage.local.get(
        'globalReaderViewStyleConfig'
      );
      if (result.globalReaderViewStyleConfig) {
        const parsedConfig =
          result.globalReaderViewStyleConfig as Partial<StyleConfig>;
        this.config = {
          theme: parsedConfig.theme || 'light',
          fontSize: parsedConfig.fontSize || 'medium',
          fontFamily: parsedConfig.fontFamily || 'sans-serif',
          customFontSize: parsedConfig.customFontSize,
        };
        return true;
      }
    } catch (error) {
      console.warn('スタイル設定の読み込みに失敗しました:', error);
    }
    return false;
  }

  /**
   * 設定のリセット
   */
  async reset(): Promise<void> {
    this.config = {
      theme: 'light',
      fontSize: 'medium',
      fontFamily: 'sans-serif',
    };
    try {
      await browser.storage.local.remove('globalReaderViewStyleConfig');
    } catch (error) {
      console.warn('設定のリセットに失敗しました:', error);
    }
  }

  /**
   * 新しいテーマを登録
   */
  registerTheme(theme: ThemeDefinition): void {
    this.themeRegistry.registerTheme(theme);
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
}
