import { StyleSheetManager, DebugInfo } from './types';
import { getCombinedCSS } from './CSSLoader';
import { ErrorHandler, CSSVariableApplicationError } from './errors';
import { DebugLogger } from './debug-logger';

/**
 * ブラウザ拡張環境でのスタイルシート管理
 * Document.adoptedStyleSheetsとフォールバックを適切に処理
 */
export class ExtensionStyleSheetManager implements StyleSheetManager {
  private styleSheet: globalThis.CSSStyleSheet | HTMLElement | null = null;
  private isInitialized = false;

  /**
   * adoptedStyleSheetsがサポートされているかチェック
   */
  get isSupported(): boolean {
    return 'adoptedStyleSheets' in document && 'CSSStyleSheet' in globalThis;
  }

  /**
   * スタイルシートの初期化
   * adoptedStyleSheets対応ブラウザではそれを使用、
   * 非対応ブラウザでは<style>タグにフォールバック
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    DebugLogger.log('StyleSheetManager', '=== Initializing StyleSheetManager ===');

    try {
      const cssContent = getCombinedCSS();
      DebugLogger.log('StyleSheetManager', `CSS content length: ${cssContent.length}`);
      DebugLogger.log('StyleSheetManager', `Adopted stylesheets supported: ${this.isSupported}`);

      if (this.isSupported) {
        DebugLogger.log('StyleSheetManager', 'Using adopted stylesheets');
        await this.initializeWithAdoptedStyleSheets(cssContent);
      } else {
        DebugLogger.log('StyleSheetManager', 'Using style element fallback');
        this.initializeWithStyleElement(cssContent);
      }

      this.isInitialized = true;
      DebugLogger.log('StyleSheetManager', 'StyleSheetManager initialized successfully');
    } catch (error) {
      DebugLogger.error('StyleSheetManager', 'Initialization failed', error);
      const stylesheetError = new CSSVariableApplicationError(
        'stylesheet initialization',
        'combined CSS'
      );
      ErrorHandler.handle(stylesheetError);
      
      // エラー時はフォールバックを試行
      DebugLogger.log('StyleSheetManager', 'Attempting fallback initialization');
      try {
        this.initializeWithStyleElement(getCombinedCSS());
        this.isInitialized = true;
        DebugLogger.log('StyleSheetManager', 'Fallback initialization successful');
      } catch (fallbackError) {
        DebugLogger.error('StyleSheetManager', 'Fallback initialization failed', fallbackError);
        this.isInitialized = true; // Prevent infinite retry
      }
    }
  }

  /**
   * Document.adoptedStyleSheetsを使用した初期化
   */
  private async initializeWithAdoptedStyleSheets(
    cssContent: string
  ): Promise<void> {
    const styleSheet = new globalThis.CSSStyleSheet();
    await styleSheet.replace(cssContent);

    // 現在のadoptedStyleSheetsに追加
    const currentSheets = Array.from(document.adoptedStyleSheets || []);
    currentSheets.push(styleSheet);
    document.adoptedStyleSheets = currentSheets;

    this.styleSheet = styleSheet;
  }

  /**
   * <style>タグを使用したフォールバック初期化
   */
  private initializeWithStyleElement(cssContent: string): void {
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-extension-styles', 'reader-view');
    styleElement.textContent = cssContent;

    // headに追加
    document.head.appendChild(styleElement);
    this.styleSheet = styleElement;
  }

  /**
   * テーマクラスの適用
   * 現在はユーザーが手動でクラスを適用する想定
   */
  applyTheme(_theme: string): void {
    // この実装では、StyleControllerが直接DOMクラスを操作する
    // 将来的にはここでテーマ変更の処理を集約できる
    // Debug: Theme application prepared for ${theme}
  }

  /**
   * クリーンアップ処理
   */
  cleanup(): void {
    if (!this.styleSheet) {
      return;
    }

    if (
      this.styleSheet instanceof globalThis.CSSStyleSheet &&
      this.isSupported
    ) {
      // adoptedStyleSheetsから削除
      const currentSheets = Array.from(document.adoptedStyleSheets || []);
      const index = currentSheets.indexOf(this.styleSheet);
      if (index !== -1) {
        currentSheets.splice(index, 1);
        document.adoptedStyleSheets = currentSheets;
      }
    } else if (this.styleSheet instanceof HTMLElement) {
      // styleタグを削除
      this.styleSheet.remove();
    }

    this.styleSheet = null;
    this.isInitialized = false;
  }

  /**
   * スタイルシートが正しく初期化されているかチェック
   */
  isReady(): boolean {
    return this.isInitialized && this.styleSheet !== null;
  }

  /**
   * 現在のスタイルシートの情報を取得（デバッグ用）
   */
  getDebugInfo(): DebugInfo {
    return {
      isSupported: this.isSupported,
      isInitialized: this.isInitialized,
      styleSheetType: this.styleSheet?.constructor.name || null,
      adoptedStyleSheetsCount: document.adoptedStyleSheets?.length || 0,
    };
  }
}
