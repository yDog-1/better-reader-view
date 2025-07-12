export type ThemeType = 'light' | 'dark' | 'sepia';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type FontFamily = 'sans-serif' | 'serif' | 'monospace';

export interface StyleConfig {
  theme: ThemeType;
  fontSize: FontSize;
  fontFamily: FontFamily;
  customFontSize?: number;
}

export class StyleController {
  private config: StyleConfig;
  private styleSheet: unknown | null = null;
  
  private readonly themeClasses = {
    light: 'theme-light',
    dark: 'theme-dark',
    sepia: 'theme-sepia',
  };

  private readonly fontFamilyClasses = {
    'sans-serif': 'font-sans',
    serif: 'font-serif',
    monospace: 'font-mono',
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

  async initializeStyles(): Promise<void> {
    try {
      // CSSファイルを動的にインポート
      const themeCSS = await import('/utils/theme.css?raw');
      const readerViewCSS = await import('/components/ReaderView.css?raw');
      const stylePanelCSS = await import('/components/StylePanel.css?raw');
      
      // CSSルールを結合
      const combinedCSS = [
        themeCSS.default,
        readerViewCSS.default,
        stylePanelCSS.default,
      ].join('\n');
      
      // Document.adoptedStyleSheetsに対応している場合
      if ('adoptedStyleSheets' in document && 'CSSStyleSheet' in window) {
        // 新しいスタイルシートを作成
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.styleSheet = new (window as any).CSSStyleSheet();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (this.styleSheet as any).replace(combinedCSS);
        
        // Document.adoptedStyleSheetsに追加
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (document as any).adoptedStyleSheets = [...(document as any).adoptedStyleSheets, this.styleSheet];
      } else {
        // フォールバック: <style>タグを使用
        const styleElement = document.createElement('style');
        styleElement.textContent = combinedCSS;
        document.head.appendChild(styleElement);
        this.styleSheet = styleElement;
      }
    } catch (error) {
      console.warn('スタイルシートの初期化に失敗しました:', error);
      // フォールバック: インラインCSSを使用
      this.fallbackToInlineStyles();
    }
  }

  private fallbackToInlineStyles(): void {
    // 基本的なスタイルをインラインで追加
    const style = document.createElement('style');
    style.textContent = `
      .theme-light { --color-text: #333; --color-background: #fff; --color-accent: #0066cc; --color-border: #e0e0e0; }
      .theme-dark { --color-text: #e0e0e0; --color-background: #1a1a1a; --color-accent: #4da6ff; --color-border: #404040; }
      .theme-sepia { --color-text: #5c4b37; --color-background: #f4f1ea; --color-accent: #8b4513; --color-border: #d4c4a8; }
      .font-sans { --font-family: "Hiragino Sans", "Yu Gothic UI", sans-serif; }
      .font-serif { --font-family: "Times New Roman", "Yu Mincho", serif; }
      .font-mono { --font-family: "Consolas", "Monaco", monospace; }
    `;
    document.head.appendChild(style);
  }

  getThemeClass(): string {
    return this.themeClasses[this.config.theme];
  }

  getFontFamilyClass(): string {
    return this.fontFamilyClasses[this.config.fontFamily];
  }

  getCustomStyles(): Record<string, string> {
    const styles: Record<string, string> = {};

    // カスタムフォントサイズがある場合のみ設定
    if (this.config.customFontSize) {
      styles['--font-size-medium'] = `${this.config.customFontSize}px`;
    }

    return styles;
  }

  applyStylesToElement(element: HTMLElement): void {
    // テーマクラスを適用
    element.classList.add(this.getThemeClass());
    
    // フォントファミリークラスを適用
    element.classList.add(this.getFontFamilyClass());

    // カスタムスタイルを適用
    const customStyles = this.getCustomStyles();
    Object.entries(customStyles).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
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

  cleanup(): void {
    // adoptedStyleSheetsから削除またはstyleタグの削除
    if (this.styleSheet) {
      if ('adoptedStyleSheets' in document) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const adoptedSheets = (document as any).adoptedStyleSheets as unknown[];
        const index = adoptedSheets.indexOf(this.styleSheet);
        if (index !== -1) {
          const newSheets = Array.from(adoptedSheets);
          newSheets.splice(index, 1);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (document as any).adoptedStyleSheets = newSheets;
        }
      } else if (this.styleSheet instanceof HTMLStyleElement) {
        // styleタグの場合は削除
        this.styleSheet.remove();
      }
    }
  }
}