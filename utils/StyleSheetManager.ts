import { StyleSheetManager, ThemeClassName } from './types';
import { getCombinedCSS } from './CSSLoader';

/**
 * ブラウザ拡張環境でのスタイルシート管理
 * Document.adoptedStyleSheetsとフォールバックを適切に処理
 */
export class ExtensionStyleSheetManager implements StyleSheetManager {
  private styleSheet: CSSStyleSheet | HTMLStyleElement | null = null;
  private isInitialized = false;

  /**
   * adoptedStyleSheetsがサポートされているかチェック
   */
  get isSupported(): boolean {
    return 'adoptedStyleSheets' in document && 'CSSStyleSheet' in window;
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
    } catch (error) {
      console.warn('スタイルシートの初期化に失敗しました:', error);
      // エラー時はフォールバックを試行
      this.initializeWithStyleElement(getCombinedCSS());
      this.isInitialized = true;
    }
  }

  /**
   * Document.adoptedStyleSheetsを使用した初期化
   */
  private async initializeWithAdoptedStyleSheets(cssContent: string): Promise<void> {
    const styleSheet = new CSSStyleSheet();
    await styleSheet.replace(cssContent);
    
    // 現在のadoptedStyleSheetsに追加
    const currentSheets = Array.from(document.adoptedStyleSheets || []);
    currentSheets.push(styleSheet);
    (document as any).adoptedStyleSheets = currentSheets;
    
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
  applyTheme(theme: ThemeClassName): void {
    // この実装では、StyleControllerが直接DOMクラスを操作する
    // 将来的にはここでテーマ変更の処理を集約できる
    console.log(`テーマ ${theme} の適用準備完了`);
  }

  /**
   * クリーンアップ処理
   */
  cleanup(): void {
    if (!this.styleSheet) {
      return;
    }

    if (this.styleSheet instanceof CSSStyleSheet && this.isSupported) {
      // adoptedStyleSheetsから削除
      const currentSheets = Array.from(document.adoptedStyleSheets || []);
      const index = currentSheets.indexOf(this.styleSheet);
      if (index !== -1) {
        currentSheets.splice(index, 1);
        (document as any).adoptedStyleSheets = currentSheets;
      }
    } else if (this.styleSheet instanceof HTMLStyleElement) {
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
  getDebugInfo(): object {
    return {
      isSupported: this.isSupported,
      isInitialized: this.isInitialized,
      styleSheetType: this.styleSheet?.constructor.name || null,
      adoptedStyleSheetsCount: document.adoptedStyleSheets?.length || 0,
    };
  }
}