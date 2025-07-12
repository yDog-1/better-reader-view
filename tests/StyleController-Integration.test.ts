import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StyleController } from '../utils/StyleController';
import { ExtensionStyleSheetManager } from '../utils/StyleSheetManager';

describe('StyleController Integration Tests', () => {
  let styleController: StyleController;
  let mockStyleSheetManager: ExtensionStyleSheetManager;

  beforeEach(() => {
    // StyleSheetManagerのモックを作成
    mockStyleSheetManager = {
      isSupported: true,
      initialize: vi.fn().mockResolvedValue(undefined),
      cleanup: vi.fn(),
      applyTheme: vi.fn(),
      isReady: vi.fn().mockReturnValue(true),
      getDebugInfo: vi.fn().mockReturnValue({
        isSupported: true,
        isInitialized: true,
        styleSheetType: 'CSSStyleSheet',
        adoptedStyleSheetsCount: 1,
      }),
    } as any;

    styleController = new StyleController(undefined, mockStyleSheetManager);
  });

  afterEach(() => {
    styleController.cleanup();
  });

  describe('初期化と統合', () => {
    it('StyleSheetManagerと正しく連携する', async () => {
      await styleController.initializeStyles();

      expect(mockStyleSheetManager.initialize).toHaveBeenCalledOnce();
      expect(styleController.isReady()).toBe(true);
    });

    it('初期化エラーを適切に処理する', async () => {
      vi.mocked(mockStyleSheetManager.initialize).mockRejectedValueOnce(
        new Error('Initialization failed')
      );

      await expect(styleController.initializeStyles()).rejects.toThrow('Initialization failed');
    });
  });

  describe('型安全なクラス名生成', () => {
    it('正しいテーマクラス名を返す', () => {
      styleController.setTheme('light');
      expect(styleController.getThemeClass()).toBe('theme-light');
      
      styleController.setTheme('dark');
      expect(styleController.getThemeClass()).toBe('theme-dark');
      
      styleController.setTheme('sepia');
      expect(styleController.getThemeClass()).toBe('theme-sepia');
    });

    it('正しいフォントファミリークラス名を返す', () => {
      styleController.setFontFamily('sans-serif');
      expect(styleController.getFontFamilyClass()).toBe('font-sans');
      
      styleController.setFontFamily('serif');
      expect(styleController.getFontFamilyClass()).toBe('font-serif');
      
      styleController.setFontFamily('monospace');
      expect(styleController.getFontFamilyClass()).toBe('font-mono');
    });
  });

  describe('DOM要素へのスタイル適用', () => {
    it('既存クラスを削除して新しいクラスを適用する', () => {
      const element = document.createElement('div');
      element.classList.add('theme-dark', 'font-serif', 'existing-class');

      styleController.setTheme('light');
      styleController.setFontFamily('sans-serif');
      styleController.applyStylesToElement(element);

      // 古いテーマクラスが削除され、新しいクラスが適用される
      expect(element.classList.contains('theme-dark')).toBe(false);
      expect(element.classList.contains('theme-light')).toBe(true);
      
      expect(element.classList.contains('font-serif')).toBe(false);
      expect(element.classList.contains('font-sans')).toBe(true);
      
      // 既存クラスは保持される
      expect(element.classList.contains('existing-class')).toBe(true);
    });

    it('カスタムスタイルをCSS変数として適用する', () => {
      const element = document.createElement('div');
      
      styleController.setCustomFontSize(20);
      styleController.applyStylesToElement(element);

      expect(element.style.getPropertyValue('--font-size-medium')).toBe('20px');
    });

    it('カスタムフォントサイズなしの場合CSS変数を設定しない', () => {
      const element = document.createElement('div');
      
      styleController.setFontSize('medium'); // カスタムサイズをクリア
      styleController.applyStylesToElement(element);

      expect(element.style.getPropertyValue('--font-size-medium')).toBe('');
    });
  });

  describe('テーマ変更時の連携', () => {
    it('テーマ変更時にStyleSheetManagerに通知する', () => {
      styleController.setTheme('dark');

      expect(mockStyleSheetManager.applyTheme).toHaveBeenCalledWith('theme-dark');
    });
  });

  describe('デバッグ機能', () => {
    it('包括的なデバッグ情報を提供する', () => {
      styleController.setTheme('dark');
      styleController.setFontFamily('serif');
      styleController.setCustomFontSize(18);

      const debugInfo = styleController.getDebugInfo();

      expect(debugInfo).toEqual({
        config: {
          theme: 'dark',
          fontSize: 'medium',
          fontFamily: 'serif',
          customFontSize: 18,
        },
        themeClass: 'theme-dark',
        fontFamilyClass: 'font-serif',
        customStyles: {
          '--font-size-medium': '18px',
        },
        styleSheetManager: {
          isSupported: true,
          isInitialized: true,
          styleSheetType: 'CSSStyleSheet',
          adoptedStyleSheetsCount: 1,
        },
      });
    });
  });

  describe('エラー境界', () => {
    it('StyleSheetManagerのエラーを適切に伝播する', async () => {
      vi.mocked(mockStyleSheetManager.isReady).mockReturnValue(false);

      expect(styleController.isReady()).toBe(false);
    });
  });

  describe('ライフサイクル管理', () => {
    it('クリーンアップ時にStyleSheetManagerもクリーンアップする', () => {
      styleController.cleanup();

      expect(mockStyleSheetManager.cleanup).toHaveBeenCalledOnce();
    });
  });
});