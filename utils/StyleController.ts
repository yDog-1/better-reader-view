import { assignInlineVars } from '@vanilla-extract/dynamic';
import { themeVars, lightTheme, darkTheme, sepiaTheme } from './theme.css';

export type ThemeType = 'light' | 'dark' | 'sepia';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type FontFamily = 'sans-serif' | 'serif' | 'monospace';

export interface StyleConfig {
  theme: ThemeType;
  fontSize: FontSize;
  fontFamily: FontFamily;
  customFontSize?: number;
}

export interface Logger {
  warn(message: string, error?: unknown): void;
}

export class StyleController {
  private config: StyleConfig;
  private logger: Logger;
  private readonly themeClasses = {
    light: lightTheme,
    dark: darkTheme,
    sepia: sepiaTheme,
  };

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
    },
    logger?: Logger
  ) {
    this.config = initialConfig;
    this.logger = logger || console;
  }

  getThemeClass(): string {
    return this.themeClasses[this.config.theme];
  }

  getInlineVars(): Record<string, string> {
    const fontFamily = this.fontFamilies[this.config.fontFamily];
    const fontSize = this.config.customFontSize
      ? `${this.config.customFontSize}px`
      : undefined;

    const vars: Record<string, string> = {};

    // フォントファミリーを設定
    vars[themeVars.font.family] = fontFamily;

    // カスタムフォントサイズがある場合のみ設定
    if (fontSize) {
      vars[themeVars.font.size[this.config.fontSize]] = fontSize;
    }

    return assignInlineVars(vars);
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
      this.logger.warn('スタイル設定の保存に失敗しました:', error);
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
      this.logger.warn('スタイル設定の読み込みに失敗しました:', error);
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
