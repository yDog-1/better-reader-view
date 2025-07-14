import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExtensionStyleSheetManager } from '../utils/StyleSheetManager';
import type { DebugInfo } from '../utils/types';

describe('StyleSheetManager', () => {
  let styleSheetManager: ExtensionStyleSheetManager;

  beforeEach(() => {
    styleSheetManager = new ExtensionStyleSheetManager();

    // adoptedStyleSheetsを初期化
    Object.defineProperty(document, 'adoptedStyleSheets', {
      value: [],
      writable: true,
      configurable: true,
    });

    // 既存のスタイルタグを削除
    const existingStyles = document.querySelectorAll(
      'style[data-extension-styles]'
    );
    existingStyles.forEach((style) => style.remove());
  });

  afterEach(() => {
    styleSheetManager.cleanup();
  });

  describe('サポート検出', () => {
    it('adoptedStyleSheetsサポートを正しく検出する', () => {
      // 現代的なブラウザでは true になることを期待
      const isSupported = styleSheetManager.isSupported;
      expect(typeof isSupported).toBe('boolean');
    });
  });

  describe('初期化処理', () => {
    it('adoptedStyleSheets対応環境で正しく初期化される', async () => {
      // モックでサポート状況を偽装
      vi.spyOn(styleSheetManager, 'isSupported', 'get').mockReturnValue(true);

      // CSSStyleSheetコンストラクターをモック
      const mockReplace = vi.fn().mockResolvedValue(undefined);
      const mockStyleSheet = { replace: mockReplace };

      (
        globalThis as typeof globalThis & { CSSStyleSheet: new () => unknown }
      ).CSSStyleSheet = vi.fn().mockImplementation(() => mockStyleSheet);

      await styleSheetManager.initialize();

      expect(styleSheetManager.isReady()).toBe(true);
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('/* theme.css */')
      );
    });

    it('非対応環境でstyleタグフォールバックが機能する', async () => {
      // adoptedStyleSheetsを非対応に設定
      vi.spyOn(styleSheetManager, 'isSupported', 'get').mockReturnValue(false);

      await styleSheetManager.initialize();

      // styleタグが作成されることを確認
      const styleElements = document.querySelectorAll(
        'style[data-extension-styles="reader-view"]'
      );
      expect(styleElements.length).toBe(1);

      const styleElement = styleElements[0] as HTMLElement;
      expect(styleElement.textContent).toContain('/* theme.css */');
      expect(styleElement.textContent).toContain('.theme-light');

      expect(styleSheetManager.isReady()).toBe(true);
    });

    it('重複初期化を防ぐ', async () => {
      vi.spyOn(styleSheetManager, 'isSupported', 'get').mockReturnValue(true);

      const mockReplace = vi.fn().mockResolvedValue(undefined);
      const mockStyleSheet = { replace: mockReplace };
      (
        globalThis as typeof globalThis & { CSSStyleSheet: new () => unknown }
      ).CSSStyleSheet = vi.fn().mockImplementation(() => mockStyleSheet);

      await styleSheetManager.initialize();
      const firstInitDebugInfo = styleSheetManager.getDebugInfo();

      await styleSheetManager.initialize();
      const secondInitDebugInfo = styleSheetManager.getDebugInfo();

      expect(firstInitDebugInfo).toEqual(secondInitDebugInfo);
    });
  });

  describe('クリーンアップ処理', () => {
    it('adoptedStyleSheetsから正しく削除される', async () => {
      vi.spyOn(styleSheetManager, 'isSupported', 'get').mockReturnValue(true);

      const mockReplace = vi.fn().mockResolvedValue(undefined);
      const mockStyleSheet = { replace: mockReplace };
      (
        globalThis as typeof globalThis & { CSSStyleSheet: new () => unknown }
      ).CSSStyleSheet = vi.fn().mockImplementation(() => mockStyleSheet);

      await styleSheetManager.initialize();
      expect(styleSheetManager.isReady()).toBe(true);

      styleSheetManager.cleanup();
      expect(styleSheetManager.isReady()).toBe(false);
    });

    it('styleタグが正しく削除される', async () => {
      vi.spyOn(styleSheetManager, 'isSupported', 'get').mockReturnValue(false);

      await styleSheetManager.initialize();

      let styleElements = document.querySelectorAll(
        'style[data-extension-styles="reader-view"]'
      );
      expect(styleElements.length).toBe(1);

      styleSheetManager.cleanup();

      styleElements = document.querySelectorAll(
        'style[data-extension-styles="reader-view"]'
      );
      expect(styleElements.length).toBe(0);
      expect(styleSheetManager.isReady()).toBe(false);
    });
  });

  describe('エラーハンドリング', () => {
    it('adoptedStyleSheetsでエラーが発生してもフォールバックが動作する', async () => {
      vi.spyOn(styleSheetManager, 'isSupported', 'get').mockReturnValue(true);

      // CSSStyleSheet.replaceでエラーを発生させる
      const mockReplace = vi
        .fn()
        .mockRejectedValue(new Error('replace failed'));
      const mockStyleSheet = { replace: mockReplace };
      (
        globalThis as typeof globalThis & { CSSStyleSheet: new () => unknown }
      ).CSSStyleSheet = vi.fn().mockImplementation(() => mockStyleSheet);

      // エラーでもフォールバックで初期化されることを期待
      await styleSheetManager.initialize();

      // styleタグフォールバックが使用されることを確認
      const styleElements = document.querySelectorAll(
        'style[data-extension-styles="reader-view"]'
      );
      expect(styleElements.length).toBe(1);
      expect(styleSheetManager.isReady()).toBe(true);
    });
  });

  describe('デバッグ情報', () => {
    it('正しいデバッグ情報を返す', async () => {
      const debugInfo = styleSheetManager.getDebugInfo();

      expect(debugInfo).toHaveProperty('isSupported');
      expect(debugInfo).toHaveProperty('isInitialized');
      expect(debugInfo).toHaveProperty('styleSheetType');
      expect(debugInfo).toHaveProperty('adoptedStyleSheetsCount');

      const typedDebugInfo = debugInfo as DebugInfo;
      expect(typeof typedDebugInfo.isSupported).toBe('boolean');
      expect(typeof typedDebugInfo.isInitialized).toBe('boolean');
    });
  });

  describe('CSS内容の検証', () => {
    it('テーマクラスが含まれている', async () => {
      vi.spyOn(styleSheetManager, 'isSupported', 'get').mockReturnValue(false);

      await styleSheetManager.initialize();

      const styleElement = document.querySelector(
        'style[data-extension-styles="reader-view"]'
      ) as HTMLElement;
      const cssContent = styleElement.textContent || '';

      // テーマクラスの存在を確認
      expect(cssContent).toContain('.theme-light');
      expect(cssContent).toContain('.theme-dark');
      expect(cssContent).toContain('.theme-sepia');

      // フォントファミリークラスの存在を確認
      expect(cssContent).toContain('.font-sans');
      expect(cssContent).toContain('.font-serif');
      expect(cssContent).toContain('.font-mono');

      // CSS変数の存在を確認
      expect(cssContent).toContain('--color-text');
      expect(cssContent).toContain('--font-size-medium');
      expect(cssContent).toContain('--spacing-medium');
    });
  });
});
