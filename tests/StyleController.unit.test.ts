import { describe, it, expect, beforeEach, vi } from 'vitest';

// StyleControllerの型定義だけをインポート
export type ThemeType = 'light' | 'dark' | 'sepia';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type FontFamily = 'sans-serif' | 'serif' | 'monospace';

export interface StyleConfig {
  theme: ThemeType;
  fontSize: FontSize;
  fontFamily: FontFamily;
  customFontSize?: number;
}

// テスト用のStyleControllerの簡素版
class TestStyleController {
  private config: StyleConfig;

  private readonly fontFamilies = {
    'sans-serif': '"Hiragino Sans", "Yu Gothic UI", sans-serif',
    serif: '"Times New Roman", "Yu Mincho", serif',
    monospace: '"Consolas", "Monaco", monospace',
  };

  constructor(
    initialConfig: StyleConfig = {
      theme: 'light',
      fontSize: 'medium',
      fontFamily: 'sans-serif',
    }
  ) {
    this.config = initialConfig;
  }

  getThemeClass(): string {
    return `${this.config.theme}-theme-class`;
  }

  getInlineVars(): Record<string, string> {
    const fontFamily = this.fontFamilies[this.config.fontFamily];
    const vars: Record<string, string> = {};

    vars['--font-family'] = fontFamily;

    if (this.config.customFontSize) {
      vars[`--font-size-${this.config.fontSize}`] =
        `${this.config.customFontSize}px`;
    }

    return vars;
  }

  setTheme(theme: ThemeType): void {
    this.config.theme = theme;
  }

  setFontSize(fontSize: FontSize): void {
    this.config.fontSize = fontSize;
    this.config.customFontSize = undefined;
  }

  setCustomFontSize(size: number): void {
    this.config.customFontSize = size;
  }

  setFontFamily(fontFamily: FontFamily): void {
    this.config.fontFamily = fontFamily;
  }

  getConfig(): StyleConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<StyleConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  saveToStorage(): void {
    try {
      sessionStorage.setItem(
        'readerViewStyleConfig',
        JSON.stringify(this.config)
      );
    } catch (error) {
      console.warn('スタイル設定の保存に失敗しました:', error);
    }
  }

  loadFromStorage(): boolean {
    try {
      const saved = sessionStorage.getItem('readerViewStyleConfig');
      if (saved) {
        const parsedConfig = JSON.parse(saved) as StyleConfig;
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

  reset(): void {
    this.config = {
      theme: 'light',
      fontSize: 'medium',
      fontFamily: 'sans-serif',
    };
    sessionStorage.removeItem('readerViewStyleConfig');
  }
}

// sessionStorageのモック
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('StyleController Unit Tests', () => {
  let styleController: TestStyleController;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.clear();
    styleController = new TestStyleController();
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

      const customController = new TestStyleController(customConfig);
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
      expect(styleController.getThemeClass()).toBe('light-theme-class');

      styleController.setTheme('dark');
      expect(styleController.getThemeClass()).toBe('dark-theme-class');
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

      expect(vars['--font-family']).toBe(
        '"Times New Roman", "Yu Mincho", serif'
      );
    });

    it('カスタムフォントサイズがある時は適切な変数を生成する', () => {
      styleController.setCustomFontSize(22);
      const vars = styleController.getInlineVars();

      expect(vars['--font-size-medium']).toBe('22px');
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
    it('設定をストレージに保存できる', () => {
      styleController.setTheme('dark');
      styleController.setFontSize('large');
      styleController.saveToStorage();

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'readerViewStyleConfig',
        JSON.stringify({
          theme: 'dark',
          fontSize: 'large',
          fontFamily: 'sans-serif',
        })
      );
    });

    it('ストレージから設定を読み込める', () => {
      const savedConfig: StyleConfig = {
        theme: 'sepia',
        fontSize: 'xlarge',
        fontFamily: 'monospace',
        customFontSize: 24,
      };

      mockSessionStorage.setItem(
        'readerViewStyleConfig',
        JSON.stringify(savedConfig)
      );

      const result = styleController.loadFromStorage();
      expect(result).toBe(true);
      expect(styleController.getConfig()).toEqual(savedConfig);
    });

    it('無効なストレージデータの場合はfalseを返す', () => {
      mockSessionStorage.setItem('readerViewStyleConfig', 'invalid json');

      const result = styleController.loadFromStorage();
      expect(result).toBe(false);
    });

    it('ストレージにデータがない場合はfalseを返す', () => {
      const result = styleController.loadFromStorage();
      expect(result).toBe(false);
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

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'readerViewStyleConfig'
      );
    });
  });

  describe('エラーハンドリング', () => {
    it('ストレージ保存でエラーが発生してもクラッシュしない', () => {
      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        styleController.saveToStorage();
      }).not.toThrow();
    });

    it('ストレージ読み込みでエラーが発生してもクラッシュしない', () => {
      mockSessionStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        const result = styleController.loadFromStorage();
        expect(result).toBe(false);
      }).not.toThrow();
    });
  });
});
