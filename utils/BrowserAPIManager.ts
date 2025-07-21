import { browser } from 'wxt/browser';

/**
 * WXTベストプラクティスに基づくブラウザAPI管理クラス
 * Feature Detectionとフォールバック機能を提供
 */
export class BrowserAPIManager {
  /**
   * 指定されたAPIパスが利用可能かチェック
   * @param apiPath - チェックするAPIのパス（例: 'storage.local', 'tabs.query'）
   * @returns APIが利用可能かどうか
   */
  static isAPISupported(apiPath: string): boolean {
    try {
      const api = apiPath.split('.').reduce((obj: unknown, key) => {
        return obj && typeof obj === 'object' && key in obj
          ? (obj as Record<string, unknown>)[key]
          : undefined;
      }, browser);
      return api != null;
    } catch {
      return false;
    }
  }

  /**
   * 安全なAPI呼び出しを実行
   * APIが利用不可能な場合やエラーが発生した場合はフォールバック値を返す
   * @param apiCall - 実行するAPI呼び出し関数
   * @param fallback - フォールバック値
   * @param apiPath - チェックするAPIパス（オプション）。指定時は`isAPISupported`で機能検出し、未サポートならフォールバック値を返します。
   * @returns API呼び出しの結果またはフォールバック値
   */
  static safeAPICall<T>(apiCall: () => T, fallback: T, apiPath?: string): T {
    try {
      if (apiPath && !this.isAPISupported(apiPath)) {
        return fallback;
      }
      return apiCall();
    } catch {
      return fallback;
    }
  }

  /**
   * 非同期API呼び出しを安全に実行
   * @param apiCall - 実行する非同期API呼び出し関数
   * @param fallback - フォールバック値
   * @param apiPath - チェックするAPIパス（オプション）。指定時は`isAPISupported`で機能検出し、未サポートならフォールバック値を返します。
   * @returns API呼び出しの結果またはフォールバック値
   */
  static async safeAsyncAPICall<T>(
    apiCall: () => Promise<T>,
    fallback: T,
    apiPath?: string
  ): Promise<T> {
    try {
      if (apiPath && !this.isAPISupported(apiPath)) {
        return fallback;
      }
      return await apiCall();
    } catch {
      return fallback;
    }
  }

  /**
   * ストレージAPIが利用可能かチェック
   * browser.storage.localが利用可能であれば使用可能とする
   */
  static isStorageSupported(): boolean {
    // APIパスチェック
    const localCheck = this.isAPISupported('storage.local');

    // localが利用可能であれば使用可能とする（sessionは優先だがフォールバックとしてlocalを使用）
    return localCheck;
  }

  /**
   * 推奨ストレージエリアを取得
   * sessionが利用可能ならsession、そうでなければlocalを返す
   */
  static getPreferredStorageArea(): 'session' | 'local' {
    const sessionCheck = this.isAPISupported('storage.session');
    return sessionCheck ? 'session' : 'local';
  }

  /**
   * タブAPIが利用可能かチェック
   */
  static isTabsSupported(): boolean {
    return (
      this.isAPISupported('tabs.query') &&
      (this.isAPISupported('tabs.executeScript') ||
        this.isAPISupported('scripting.executeScript'))
    );
  }

  /**
   * ランタイムAPIが利用可能かチェック
   */
  static isRuntimeSupported(): boolean {
    return (
      this.isAPISupported('runtime.sendMessage') &&
      this.isAPISupported('runtime.onMessage')
    );
  }

  /**
   * ブラウザアクションAPIが利用可能かチェック
   */
  static isBrowserActionSupported(): boolean {
    // Firefox用のbrowserActionとChrome用のactionをチェック
    return (
      this.isAPISupported('browserAction') || this.isAPISupported('action')
    );
  }

  /**
   * スクリプト注入APIが利用可能かチェック
   */
  static isScriptingSupported(): boolean {
    // MV3のscripting APIまたは MV2のtabs.executeScript をチェック
    return (
      this.isAPISupported('scripting.executeScript') ||
      this.isAPISupported('tabs.executeScript')
    );
  }

  /**
   * 現在のブラウザタイプを判定
   */
  static getBrowserType(): 'chrome' | 'firefox' | 'unknown' {
    if (typeof globalThis !== 'undefined' && globalThis.navigator?.userAgent) {
      if (globalThis.navigator.userAgent.includes('Firefox')) {
        return 'firefox';
      }
      if (globalThis.navigator.userAgent.includes('Chrome')) {
        return 'chrome';
      }
    }
    return 'unknown';
  }

  /**
   * ストレージAPIを取得（Feature Detection付き）
   * @param area - ストレージエリア ('local', 'session', 'sync')
   * @returns ストレージAPI またはnull
   */
  static getStorageAPI(area: 'local' | 'session' | 'sync') {
    const result = this.safeAPICall(
      () => {
        if (!browser?.storage?.[area]) {
          // sessionが要求されたがlocalのみ利用可能な場合はフォールバック
          if (area === 'session' && browser?.storage?.local) {
            return browser.storage.local;
          }

          return null;
        }
        return browser.storage[area];
      },
      null,
      `storage.${area}`
    );

    return result;
  }

  /**
   * ブラウザ互換性情報を取得
   */
  static getBrowserCompatibility() {
    return {
      browserType: this.getBrowserType(),
      storage: this.isStorageSupported(),
      tabs: this.isTabsSupported(),
      runtime: this.isRuntimeSupported(),
      browserAction: this.isBrowserActionSupported(),
      scripting: this.isScriptingSupported(),
    };
  }
}
