import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserAPIManager } from '@/utils/BrowserAPIManager';

// wxt/browserをモック
vi.mock('wxt/browser', () => {
  const mockBrowser = {
    storage: {
      local: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
      },
      session: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
      },
    },
    tabs: {
      query: vi.fn(),
      executeScript: vi.fn(),
    },
    runtime: {
      sendMessage: vi.fn(),
      onMessage: {
        addListener: vi.fn(),
      },
    },
    action: {
      onClicked: {
        addListener: vi.fn(),
      },
    },
    browserAction: {
      onClicked: {
        addListener: vi.fn(),
      },
    },
  };

  return {
    browser: mockBrowser,
  };
});

describe('BrowserAPIManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // globalThis.navigator.userAgentをモック
    Object.defineProperty(globalThis, 'navigator', {
      writable: true,
      value: {
        userAgent: 'Mozilla/5.0 (Chrome/91.0)',
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isAPISupported', () => {
    it('利用可能なAPIパスでtrueを返す', () => {
      expect(BrowserAPIManager.isAPISupported('storage.local')).toBe(true);
      expect(BrowserAPIManager.isAPISupported('tabs.query')).toBe(true);
      expect(BrowserAPIManager.isAPISupported('runtime.sendMessage')).toBe(
        true
      );
    });

    it('利用不可能なAPIパスでfalseを返す', () => {
      expect(BrowserAPIManager.isAPISupported('nonexistent.api')).toBe(false);
      expect(BrowserAPIManager.isAPISupported('storage.nonexistent')).toBe(
        false
      );
    });

    it('空文字列やundefinedでfalseを返す', () => {
      expect(BrowserAPIManager.isAPISupported('')).toBe(false);
    });

    it('APIパスのチェック中にエラーが発生した場合はfalseを返す', () => {
      // nullのプロパティにアクセスしようとするとエラーが発生する
      expect(BrowserAPIManager.isAPISupported('null.property')).toBe(false);
    });
  });

  describe('safeAPICall', () => {
    it('正常なAPI呼び出しで結果を返す', () => {
      const result = BrowserAPIManager.safeAPICall(() => 'success', 'fallback');
      expect(result).toBe('success');
    });

    it('エラーが発生した場合はフォールバック値を返す', () => {
      const result = BrowserAPIManager.safeAPICall(() => {
        throw new Error('API Error');
      }, 'fallback');
      expect(result).toBe('fallback');
    });

    it('APIパスが利用不可能な場合はフォールバック値を返す', () => {
      const result = BrowserAPIManager.safeAPICall(
        () => 'success',
        'fallback',
        'nonexistent.api'
      );
      expect(result).toBe('fallback');
    });

    it('APIパスが利用可能な場合は結果を返す', () => {
      const result = BrowserAPIManager.safeAPICall(
        () => 'success',
        'fallback',
        'storage.local'
      );
      expect(result).toBe('success');
    });
  });

  describe('safeAsyncAPICall', () => {
    it('正常な非同期API呼び出しで結果を返す', async () => {
      const result = await BrowserAPIManager.safeAsyncAPICall(
        async () => 'async success',
        'fallback'
      );
      expect(result).toBe('async success');
    });

    it('非同期エラーが発生した場合はフォールバック値を返す', async () => {
      const result = await BrowserAPIManager.safeAsyncAPICall(async () => {
        throw new Error('Async API Error');
      }, 'fallback');
      expect(result).toBe('fallback');
    });

    it('非同期APIパスが利用不可能な場合はフォールバック値を返す', async () => {
      const result = await BrowserAPIManager.safeAsyncAPICall(
        async () => 'success',
        'fallback',
        'nonexistent.api'
      );
      expect(result).toBe('fallback');
    });
  });

  describe('API可用性チェック', () => {
    it('isStorageSupported: ストレージAPIが利用可能', () => {
      expect(BrowserAPIManager.isStorageSupported()).toBe(true);
    });

    it('isTabsSupported: タブAPIが利用可能', () => {
      expect(BrowserAPIManager.isTabsSupported()).toBe(true);
    });

    it('isRuntimeSupported: ランタイムAPIが利用可能', () => {
      expect(BrowserAPIManager.isRuntimeSupported()).toBe(true);
    });

    it('isBrowserActionSupported: ブラウザアクションAPIが利用可能', () => {
      expect(BrowserAPIManager.isBrowserActionSupported()).toBe(true);
    });
  });

  describe('getBrowserType', () => {
    it('Chrome useragentでchromeを返す', () => {
      Object.defineProperty(globalThis, 'navigator', {
        writable: true,
        value: {
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      expect(BrowserAPIManager.getBrowserType()).toBe('chrome');
    });

    it('Firefox useragentでfirefoxを返す', () => {
      Object.defineProperty(globalThis, 'navigator', {
        writable: true,
        value: {
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        },
      });
      expect(BrowserAPIManager.getBrowserType()).toBe('firefox');
    });

    it('未知のuseragentでunknownを返す', () => {
      Object.defineProperty(globalThis, 'navigator', {
        writable: true,
        value: {
          userAgent: 'Unknown Browser',
        },
      });
      expect(BrowserAPIManager.getBrowserType()).toBe('unknown');
    });

    it('navigatorが存在しない場合はunknownを返す', () => {
      // navigatorを一時的に削除
      const originalNavigator = globalThis.navigator;
      // @ts-expect-error テスト用にnavigatorを削除
      delete globalThis.navigator;

      expect(BrowserAPIManager.getBrowserType()).toBe('unknown');

      // navigatorを復元
      globalThis.navigator = originalNavigator;
    });
  });

  describe('getBrowserCompatibility', () => {
    it('ブラウザ互換性情報を正しく返す', () => {
      const compatibility = BrowserAPIManager.getBrowserCompatibility();

      expect(compatibility).toEqual({
        browserType: 'chrome',
        storage: true,
        tabs: true,
        runtime: true,
        browserAction: true,
      });
    });
  });

  describe('エラー耐性', () => {
    it('browserオブジェクトが部分的に利用できない場合も正常に動作', async () => {
      // 動的importでbrowserオブジェクトを取得
      const { browser } = await import('wxt/browser');

      // 一時的にstorageを削除してテスト
      const originalStorage = (browser as Record<string, unknown>).storage;
      delete (browser as Record<string, unknown>).storage;

      expect(BrowserAPIManager.isAPISupported('storage.local')).toBe(false);
      expect(BrowserAPIManager.isStorageSupported()).toBe(false);

      // storageを復元
      (browser as Record<string, unknown>).storage = originalStorage;
    });

    it('null/undefinedのプロパティアクセスでもクラッシュしない', () => {
      expect(() => {
        BrowserAPIManager.isAPISupported('null.undefined.property');
      }).not.toThrow();
    });
  });
});
