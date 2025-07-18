import {
  ThemeClassName,
  FontFamilyClassName,
  StyleSheetManager,
} from './types';
import { ExtensionStyleSheetManager } from './StyleSheetManager';

export type ThemeType = 'light' | 'dark' | 'sepia';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type FontFamily = 'sans-serif' | 'serif' | 'monospace';

export interface StyleConfig {
  theme: ThemeType;
  fontSize: FontSize;
  fontFamily: FontFamily;
  customFontSize?: number;
}

/**
 * 型安全なスタイル管理システム
 * 責務を明確に分離し、テスタブルな設計に変更
 */
export class StyleController {
  private config: StyleConfig;
  private styleSheetManager: ExtensionStyleSheetManager | StyleSheetManager;

  private readonly themeClasses: Record<ThemeType, ThemeClassName> = {
    light: 'theme-light',
    dark: 'theme-dark',
    sepia: 'theme-sepia',
  };

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
    styleSheetManager?: ExtensionStyleSheetManager | StyleSheetManager
  ) {
    this.config = initialConfig;
    this.styleSheetManager =
      (styleSheetManager as ExtensionStyleSheetManager) ||
      new ExtensionStyleSheetManager();
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
  getThemeClass(): ThemeClassName {
    return this.themeClasses[this.config.theme];
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
    Object.values(this.themeClasses).forEach((className) => {
      element.classList.remove(className);
    });

    // 既存のフォントファミリークラスを削除
    Object.values(this.fontFamilyClasses).forEach((className) => {
      element.classList.remove(className);
    });

    // 新しいクラスを適用
    element.classList.add(this.getThemeClass());
    element.classList.add(this.getFontFamilyClass());

    // カスタムスタイルを適用
    const customStyles = this.getCustomStyles();
    Object.entries(customStyles).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  }

  /**
   * テーマの変更
   */
  setTheme(theme: ThemeType): void {
    this.config.theme = theme;
    this.styleSheetManager.applyTheme(this.getThemeClass());
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
    };
  }

  /**
   * スタイルシステムが準備完了かチェック
   */
  isReady(): boolean {
    return this.styleSheetManager.isReady();
  }
}
