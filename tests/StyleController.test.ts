import { describe, it, expect, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { StyleController, type StyleConfig } from '../utils/StyleController';

describe('StyleController', () => {
  let styleController: StyleController;

  beforeEach(() => {
    // fakeBrowserの状態をリセット
    fakeBrowser.reset();
    styleController = new StyleController();
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
      const lightClass = styleController.getThemeClass();
      expect(typeof lightClass).toBe('string');
      expect(lightClass).toBeTruthy();

      styleController.setTheme('dark');
      const darkClass = styleController.getThemeClass();
      expect(typeof darkClass).toBe('string');
      expect(darkClass).toBeTruthy();
      expect(darkClass).not.toBe(lightClass);
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

  describe('インラインスタイル変数', () => {
    it('フォントファミリーの変数を生成する', () => {
      styleController.setFontFamily('serif');
      const vars = styleController.getInlineVars();

      expect(vars).toBeInstanceOf(Object);
      expect(Object.keys(vars).length).toBeGreaterThan(0);
    });

    it('カスタムフォントサイズがある時は適切な変数を生成する', () => {
      styleController.setCustomFontSize(22);
      const vars = styleController.getInlineVars();

      expect(vars).toBeInstanceOf(Object);
      expect(Object.keys(vars).length).toBeGreaterThan(0);
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
      styleController.saveToStorage();

      // sessionStorageの実際の値をチェック
      const storedValue = sessionStorage.getItem('readerViewStyleConfig');
      const parsedValue = JSON.parse(storedValue!);

      expect(parsedValue).toEqual({
        theme: 'dark',
        fontSize: 'large',
        fontFamily: 'sans-serif',
      });
    });

    it('ストレージから設定を読み込める', () => {
      const savedConfig: StyleConfig = {
        theme: 'sepia',
        fontSize: 'xlarge',
        fontFamily: 'monospace',
        customFontSize: 24,
      };

      sessionStorage.setItem(
        'readerViewStyleConfig',
        JSON.stringify(savedConfig)
      );

      const result = styleController.loadFromStorage();
      expect(result).toBe(true);
      expect(styleController.getConfig()).toEqual(savedConfig);
    });

    it('無効なストレージデータの場合はfalseを返す', () => {
      sessionStorage.setItem('readerViewStyleConfig', 'invalid json');

      const result = styleController.loadFromStorage();
      expect(result).toBe(false);
    });

    it('ストレージにデータがない場合はfalseを返す', () => {
      const result = styleController.loadFromStorage();
      expect(result).toBe(false);
    });

    it('部分的なストレージデータでもデフォルト値で補完される', () => {
      const partialConfig = { theme: 'dark' };
      sessionStorage.setItem(
        'readerViewStyleConfig',
        JSON.stringify(partialConfig)
      );

      styleController.loadFromStorage();
      const config = styleController.getConfig();

      expect(config.theme).toBe('dark');
      expect(config.fontSize).toBe('medium'); // デフォルト値
      expect(config.fontFamily).toBe('sans-serif'); // デフォルト値
    });
  });

  describe('リセット機能', () => {
    it('設定をデフォルトにリセットできる', () => {
      styleController.setTheme('dark');
      styleController.setFontSize('large');
      styleController.setFontFamily('serif');
      styleController.setCustomFontSize(20);

      styleController.reset();

      expect(styleController.getConfig()).toEqual({
        theme: 'light',
        fontSize: 'medium',
        fontFamily: 'sans-serif',
      });
    });

    it('リセット時にストレージからも削除される', () => {
      styleController.saveToStorage();
      styleController.reset();

      const storedValue = sessionStorage.getItem('readerViewStyleConfig');
      expect(storedValue).toBeNull();
    });
  });

  describe('エラーハンドリング', () => {
    it('ストレージ保存でエラーが発生してもクラッシュしない', () => {
      // sessionStorageを無効化してエラーを誘発
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          setItem: () => {
            throw new Error('Storage error');
          },
          getItem: () => null,
          removeItem: () => {},
        },
        configurable: true,
      });

      expect(() => {
        styleController.saveToStorage();
      }).not.toThrow();

      // テスト後にfakeBrowserのsessionStorageを復元
      fakeBrowser.reset();
    });

    it('ストレージ読み込みでエラーが発生してもクラッシュしない', () => {
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          getItem: () => {
            throw new Error('Storage error');
          },
          setItem: () => {},
          removeItem: () => {},
        },
        configurable: true,
      });

      expect(() => {
        const result = styleController.loadFromStorage();
        expect(result).toBe(false);
      }).not.toThrow();

      fakeBrowser.reset();
    });
  });
});
