import { StyleSheetManager as IStyleSheetManager, DebugInfo } from './types';
import { getCombinedCSS } from './CSSLoader';
import { ErrorHandler, CSSVariableApplicationError } from './errors';

/**
 * ブラウザ拡張環境でのスタイルシート管理
 * Document.adoptedStyleSheetsとフォールバックを適切に処理
 */
export class StyleSheetManager {
  private styleSheet: globalThis.CSSStyleSheet | HTMLElement | null = null;
  private isInitialized = false;

  /**
   * adoptedStyleSheetsがサポートされているかチェック
   */
  get isSupported(): boolean {
    if (!('adoptedStyleSheets' in document && 'CSSStyleSheet' in globalThis)) {
      return false;
    }

    try {
      const testSheet = new globalThis.CSSStyleSheet();
      testSheet.replaceSync('/* test */');
      return true;
    } catch {
      return false;
    }
  }

  constructor(private shadowRoot?: ShadowRoot) {}

  /**
   * 初期化
   */
  async initialize(): Promise<void> {
    // 実装
  }

  /**
   * テーマを適用
   */
  applyTheme(themeClass: string): void {
    // Shadow DOM環境での実装
    if (this.shadowRoot) {
      const host = this.shadowRoot.host as HTMLElement;
      host.classList.remove('theme-light', 'theme-dark', 'theme-sepia');
      host.classList.add(themeClass);
    }
  }

  /**
   * クリーンアップ
   */
  cleanup(): void {
    // 実装
  }

  /**
   * 準備完了状態
   */
  isReady(): boolean {
    return true;
  }

  /**
   * デバッグ情報
   */
  getDebugInfo(): DebugInfo {
    return {
      isSupported: true,
      isInitialized: true,
      styleSheetType: 'shadow-root',
      adoptedStyleSheetsCount: 0,
    };
  }
}

/**
 * ブラウザ拡張環境でのスタイルシート管理
 * Document.adoptedStyleSheetsとフォールバックを適切に処理
 */
export class ExtensionStyleSheetManager implements IStyleSheetManager {
  private styleSheet: globalThis.CSSStyleSheet | HTMLElement | null = null;
  private isInitialized = false;

  /**
   * adoptedStyleSheetsがサポートされているかチェック
   * Firefox content scriptではXray wrapperにより実際の使用時にエラーになるため、
   * 実際に使用可能かテストする
   */
  get isSupported(): boolean {
    if (!('adoptedStyleSheets' in document && 'CSSStyleSheet' in globalThis)) {
      return false;
    }

    // Firefox content scriptでのXray wrapper制限をチェック
    try {
      // 一時的なCSSStyleSheetを作成してテスト
      const testSheet = new globalThis.CSSStyleSheet();
      testSheet.replaceSync('/* test */');

      // adoptedStyleSheetsへのアクセスをテスト
      const currentSheets = Array.from(document.adoptedStyleSheets || []);
      currentSheets.push(testSheet);
      document.adoptedStyleSheets = currentSheets;

      // 成功した場合は即座にクリーンアップ
      document.adoptedStyleSheets = currentSheets.slice(0, -1);
      return true;
    } catch {
      return false;
    }
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

    try {
      const cssContent = getCombinedCSS();

      if (this.isSupported) {
        await this.initializeWithAdoptedStyleSheets(cssContent);
      } else {
        this.initializeWithStyleElement(cssContent);
      }

      this.isInitialized = true;
    } catch {
      // エラー時はフォールバックを試行（エラー報告は成功/失敗後に判断）
      try {
        this.initializeWithStyleElement(getCombinedCSS());
        this.isInitialized = true;
      } catch {
        this.isInitialized = true; // Prevent infinite retry

        // フォールバックも失敗した場合のみエラー報告
        const stylesheetError = new CSSVariableApplicationError(
          'stylesheet initialization (both primary and fallback failed)',
          'combined CSS'
        );
        ErrorHandler.handle(stylesheetError);
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
