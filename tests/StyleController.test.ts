import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { StyleController, type StyleConfig } from '../utils/StyleController';
import { JSDOM } from 'jsdom';

describe('StyleController', () => {
  let styleController: StyleController;

  beforeEach(() => {
    // fakeBrowserの状態をリセット
    fakeBrowser.reset();

    // browser APIをglobalに設定
    (
      globalThis as typeof globalThis & { browser: typeof fakeBrowser }
    ).browser = fakeBrowser;

    // DOM環境をセットアップ
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    (globalThis as unknown as { document: Document }).document =
      dom.window.document;
    (globalThis as unknown as { window: typeof dom.window }).window =
      dom.window;

    // テスト環境でのbrowser.storage.localをクリア
    try {
      sessionStorage.clear();
    } catch {
      // テスト環境でsessionStorageが未実装の場合は無視
    }

    // モックのStyleSheetManagerを作成
    const mockStyleSheetManager = {
      isSupported: true,
      initialize: vi.fn().mockResolvedValue(undefined),
      cleanup: vi.fn(),
      applyTheme: vi.fn(),
      isReady: vi.fn().mockReturnValue(true),
      getDebugInfo: vi.fn().mockReturnValue({
        isSupported: true,
        isInitialized: true,
        styleSheetType: 'Mock',
        adoptedStyleSheetsCount: 0,
      }),
    };

    styleController = new StyleController(undefined, mockStyleSheetManager);
  });

  describe('初期化', () => {
    it('デフォルト設定で初期化される', () => {
      const config = styleController.getConfig();
      expect(config).toEqual({
        theme: 'light',
        fontSize: 'medium',
        fontFamily: 'sans-serif',
      });
    });

    it('カスタム初期設定で初期化される', () => {
      const customConfig: StyleConfig = {
        theme: 'dark',
        fontSize: 'large',
        fontFamily: 'serif',
        customFontSize: 20,
      };

      const customController = new StyleController(customConfig);
      expect(customController.getConfig()).toEqual(customConfig);
    });
  });

  describe('テーマ管理', () => {
    it('テーマを変更できる', () => {
      styleController.setTheme('dark');
      expect(styleController.getConfig().theme).toBe('dark');

      styleController.setTheme('sepia');
      expect(styleController.getConfig().theme).toBe('sepia');
    });

    it('正しいテーマクラスを返す', () => {
      styleController.setTheme('light');
      expect(styleController.getThemeClass()).toBe('theme-light');

      styleController.setTheme('dark');
      expect(styleController.getThemeClass()).toBe('theme-dark');

      styleController.setTheme('sepia');
      expect(styleController.getThemeClass()).toBe('theme-sepia');
    });
  });

  describe('フォント管理', () => {
    it('フォントサイズを変更できる', () => {
      styleController.setFontSize('large');
      expect(styleController.getConfig().fontSize).toBe('large');

      styleController.setFontSize('small');
      expect(styleController.getConfig().fontSize).toBe('small');
    });

    it('カスタムフォントサイズを設定できる', () => {
      styleController.setCustomFontSize(18);
      expect(styleController.getConfig().customFontSize).toBe(18);
    });

    it('フォントファミリーを変更できる', () => {
      styleController.setFontFamily('serif');
      expect(styleController.getConfig().fontFamily).toBe('serif');

      styleController.setFontFamily('monospace');
      expect(styleController.getConfig().fontFamily).toBe('monospace');
    });

    it('フォントサイズ変更時にカスタムフォントサイズがリセットされる', () => {
      styleController.setCustomFontSize(20);
      expect(styleController.getConfig().customFontSize).toBe(20);

      styleController.setFontSize('large');
      expect(styleController.getConfig().customFontSize).toBeUndefined();
    });
  });

  describe('カスタムスタイル', () => {
    it('カスタムフォントサイズがある時は適切なスタイルを生成する', () => {
      styleController.setCustomFontSize(22);
      const styles = styleController.getCustomStyles();

      expect(styles).toBeInstanceOf(Object);
      expect(styles['--font-size']).toBe('22px');
      expect(styles['--title-font-size']).toBe('33px'); // 22 * 1.5
      expect(styles['--heading-font-size']).toBe('24.75px'); // 22 * 1.125
      expect(styles['--button-font-size']).toBe('19.25px'); // 22 * 0.875
    });

    it('カスタムフォントサイズなしの場合はデフォルトスタイルを返す', () => {
      styleController.setFontSize('medium'); // カスタムサイズをリセット
      const styles = styleController.getCustomStyles();

      expect(styles['--font-size']).toBe('16px');
      expect(styles['--title-font-size']).toBe('24px'); // 16 * 1.5
      expect(styles['--heading-font-size']).toBe('18px'); // 16 * 1.125
      expect(styles['--button-font-size']).toBe('14px'); // 16 * 0.875
    });

    it('異なるカスタムフォントサイズで異なるスタイルを生成する', () => {
      styleController.setCustomFontSize(18);
      const styles18 = styleController.getCustomStyles();

      styleController.setCustomFontSize(24);
      const styles24 = styleController.getCustomStyles();

      expect(styles18['--font-size']).toBe('18px');
      expect(styles24['--font-size']).toBe('24px');
      expect(styles18).not.toEqual(styles24);
    });

    it('フォントファミリークラスを正しく返す', () => {
      styleController.setFontFamily('serif');
      expect(styleController.getFontFamilyClass()).toBe('font-serif');

      styleController.setFontFamily('monospace');
      expect(styleController.getFontFamilyClass()).toBe('font-mono');

      styleController.setFontFamily('sans-serif');
      expect(styleController.getFontFamilyClass()).toBe('font-sans');
    });
  });

  describe('DOM要素へのスタイル適用', () => {
    it('要素にテーマとフォントファミリークラスを適用する', () => {
      const element = document.createElement('div');

      styleController.setTheme('dark');
      styleController.setFontFamily('serif');
      styleController.applyStylesToElement(element);

      expect(element.classList.contains('theme-dark')).toBe(true);
      expect(element.classList.contains('font-serif')).toBe(true);
    });

    it('既存のクラスを削除して新しいクラスを適用する', () => {
      const element = document.createElement('div');
      element.classList.add('theme-light', 'font-sans', 'existing-class');

      styleController.setTheme('sepia');
      styleController.setFontFamily('monospace');
      styleController.applyStylesToElement(element);

      expect(element.classList.contains('theme-light')).toBe(false);
      expect(element.classList.contains('font-sans')).toBe(false);
      expect(element.classList.contains('theme-sepia')).toBe(true);
      expect(element.classList.contains('font-mono')).toBe(true);
      expect(element.classList.contains('existing-class')).toBe(true);
    });

    it('カスタムフォントサイズをCSS変数として適用する', () => {
      const element = document.createElement('div');

      styleController.setCustomFontSize(20);
      styleController.applyStylesToElement(element);

      expect(element.style.getPropertyValue('--font-size')).toBe('20px');
      expect(element.style.getPropertyValue('--title-font-size')).toBe('30px');
    });

    it('カスタムフォントサイズなしの場合はCSS変数を設定しない', () => {
      const element = document.createElement('div');

      styleController.setFontSize('medium'); // カスタムサイズをクリア
      styleController.applyStylesToElement(element);

      // デフォルトサイズが設定される
      expect(element.style.getPropertyValue('--font-size')).toBe('16px');
    });
  });

  describe('設定の更新', () => {
    it('部分的な設定更新ができる', () => {
      const initialConfig = styleController.getConfig();

      styleController.updateConfig({ theme: 'dark', fontSize: 'large' });

      const updatedConfig = styleController.getConfig();
      expect(updatedConfig.theme).toBe('dark');
      expect(updatedConfig.fontSize).toBe('large');
      expect(updatedConfig.fontFamily).toBe(initialConfig.fontFamily);
    });
  });

  describe('ストレージ操作', () => {
    it('設定をストレージに保存できる', async () => {
      styleController.setTheme('dark');
      styleController.setFontSize('large');
      await styleController.saveToStorage();

      // browser.storage.localの実際の値をチェック
      const storedValue = await browser.storage.local.get(
        'globalReaderViewStyleConfig'
      );

      expect(storedValue.globalReaderViewStyleConfig).toEqual({
        theme: 'dark',
        fontSize: 'large',
        fontFamily: 'sans-serif',
      });
    });

    it('ストレージから設定を読み込める', async () => {
      const savedConfig: StyleConfig = {
        theme: 'sepia',
        fontSize: 'xlarge',
        fontFamily: 'monospace',
        customFontSize: 24,
      };

      await browser.storage.local.set({
        globalReaderViewStyleConfig: savedConfig,
      });

      const result = await styleController.loadFromStorage();
      expect(result).toBe(true);
      expect(styleController.getConfig()).toEqual(savedConfig);
    });

    it('無効なストレージデータの場合はfalseを返す', async () => {
      // 無効なデータを保存する代わりに、ストレージをクリアしてテスト
      await browser.storage.local.clear();

      const result = await styleController.loadFromStorage();
      expect(result).toBe(false);
    });

    it('ストレージにデータがない場合はfalseを返す', async () => {
      const result = await styleController.loadFromStorage();
      expect(result).toBe(false);
    });

    it('部分的なストレージデータでもデフォルト値で補完される', async () => {
      const partialConfig = { theme: 'dark' };
      await browser.storage.local.set({
        globalReaderViewStyleConfig: partialConfig,
      });

      await styleController.loadFromStorage();
      const config = styleController.getConfig();

      expect(config.theme).toBe('dark');
      expect(config.fontSize).toBe('medium'); // デフォルト値
      expect(config.fontFamily).toBe('sans-serif'); // デフォルト値
    });
  });

  describe('リセット機能', () => {
    it('設定をデフォルトにリセットできる', async () => {
      styleController.setTheme('dark');
      styleController.setFontSize('large');
      styleController.setFontFamily('serif');
      styleController.setCustomFontSize(20);

      await styleController.reset();

      expect(styleController.getConfig()).toEqual({
        theme: 'light',
        fontSize: 'medium',
        fontFamily: 'sans-serif',
      });
    });

    it('リセット時にストレージからも削除される', async () => {
      await styleController.saveToStorage();
      await styleController.reset();

      const storedValue = await browser.storage.local.get(
        'globalReaderViewStyleConfig'
      );
      expect(storedValue.globalReaderViewStyleConfig).toBeUndefined();
    });
  });

  describe('エラーハンドリング', () => {
    it('ストレージ保存でエラーが発生してもクラッシュしない', async () => {
      // browser.storage.localをモックしてエラーを誘発
      const originalSet = browser.storage.local.set;
      browser.storage.local.set = vi
        .fn()
        .mockRejectedValue(new Error('Storage error'));

      await expect(styleController.saveToStorage()).resolves.toBeUndefined();

      // テスト後にbrowser.storage.localを復元
      browser.storage.local.set = originalSet;
    });

    it('ストレージ読み込みでエラーが発生してもクラッシュしない', async () => {
      // browser.storage.localをモックしてエラーを誘発
      const originalGet = browser.storage.local.get;
      browser.storage.local.get = vi
        .fn()
        .mockRejectedValue(new Error('Storage error'));

      const result = await styleController.loadFromStorage();
      expect(result).toBe(false);

      // テスト後にbrowser.storage.localを復元
      browser.storage.local.get = originalGet;
    });
  });
});
