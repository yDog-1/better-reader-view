import { browser } from 'wxt/browser';

/**
 * Reader Viewのスタイル設定インターフェース
 */
export interface ReaderViewStyleConfig {
  theme: 'light' | 'dark' | 'sepia';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: 'sans-serif' | 'serif' | 'monospace';
}

/**
 * Reader Viewの状態インターフェース
 */
export interface ReaderViewState {
  isActive: boolean;
  url?: string;
  title?: string;
}

/**
 * ストレージキー定数
 */
const STYLE_CONFIG_KEY = 'readerViewStyleConfig';
const STATE_KEY = 'readerViewState';

/**
 * デフォルト設定
 */
const DEFAULT_STYLE_CONFIG: ReaderViewStyleConfig = {
  theme: 'light',
  fontSize: 'medium',
  fontFamily: 'sans-serif',
};

const DEFAULT_STATE: ReaderViewState = {
  isActive: false,
};

/**
 * ストレージヘルパー関数
 */
export class StorageManager {
  /**
   * スタイル設定を取得
   */
  static async getStyleConfig(): Promise<ReaderViewStyleConfig> {
    try {
      const result = await browser.storage.local.get(STYLE_CONFIG_KEY);
      const stored = result[STYLE_CONFIG_KEY];
      // 部分的なデータでもデフォルト値でマージ
      if (stored) {
        return { ...DEFAULT_STYLE_CONFIG, ...stored };
      }
      return DEFAULT_STYLE_CONFIG;
    } catch {
      return DEFAULT_STYLE_CONFIG;
    }
  }

  /**
   * スタイル設定を更新
   */
  static async updateStyleConfig(
    config: Partial<ReaderViewStyleConfig>
  ): Promise<void> {
    const currentConfig = await this.getStyleConfig();
    const newConfig = { ...currentConfig, ...config };
    await browser.storage.local.set({ [STYLE_CONFIG_KEY]: newConfig });
  }

  /**
   * Reader View状態を取得
   */
  static async getReaderViewState(): Promise<ReaderViewState> {
    try {
      const result = await browser.storage.session.get(STATE_KEY);
      return result[STATE_KEY] || DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  }

  /**
   * Reader View状態を更新
   */
  static async updateReaderViewState(
    state: Partial<ReaderViewState>
  ): Promise<void> {
    const currentState = await this.getReaderViewState();
    const newState = { ...currentState, ...state };
    await browser.storage.session.set({ [STATE_KEY]: newState });
  }

  /**
   * Reader Viewを有効化
   */
  static async activateReaderView(url?: string, title?: string): Promise<void> {
    await browser.storage.session.set({
      [STATE_KEY]: {
        isActive: true,
        url,
        title,
      },
    });
  }

  /**
   * Reader Viewを無効化
   */
  static async deactivateReaderView(): Promise<void> {
    await browser.storage.session.set({
      [STATE_KEY]: {
        isActive: false,
        url: undefined,
        title: undefined,
      },
    });
  }

  /**
   * 全ての設定をリセット
   */
  static async resetAllSettings(): Promise<void> {
    await browser.storage.local.set({
      [STYLE_CONFIG_KEY]: DEFAULT_STYLE_CONFIG,
    });
    await this.deactivateReaderView();
  }
}
