import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  WXTResourceManager,
  createResourceManager,
} from '@/utils/WXTResourceManager';
import type { ContentScriptContext } from 'wxt/utils/content-script-context';

// ContentScriptContextのモック作成
function createMockContext(): ContentScriptContext & {
  invalidate: () => void;
} {
  const listeners: Array<() => void> = [];
  const timers: Map<number, NodeJS.Timeout> = new Map();
  const intervals: Map<number, NodeJS.Timeout> = new Map();
  let nextId = 1;

  return {
    contentScriptName: 'test-content-script',
    isTopFrame: true,
    abortController: new AbortController(),
    signal: new AbortController().signal,
    isInvalid: false,
    isValid: () => true,
    receivedMessageIds: new Set(),
    locationWatcher: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    notificationWatcher: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    abort: vi.fn(),
    block: vi.fn(),
    requestAnimationFrame: vi.fn(),
    requestIdleCallback: vi.fn(),
    cancelAnimationFrame: vi.fn(),
    cancelIdleCallback: vi.fn(),
    addEventListener: vi.fn(
      (
        element: EventTarget,
        event: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
      ) => {
        element.addEventListener(event, listener, options);
      }
    ),
    removeEventListener: vi.fn(),
    setTimeout: vi.fn((callback: () => void, delay: number) => {
      const id = nextId++;
      const timerId = globalThis.setTimeout(callback, delay);
      timers.set(id, timerId);
      return id;
    }),
    clearTimeout: vi.fn(),
    setInterval: vi.fn((callback: () => void, interval: number) => {
      const id = nextId++;
      const intervalId = globalThis.setInterval(callback, interval);
      intervals.set(id, intervalId);
      return id;
    }),
    clearInterval: vi.fn(),
    onInvalidated: vi.fn((callback: () => void) => {
      listeners.push(callback);
      return () => {}; // アンsubscribe関数を返す
    }),
    postMessage: vi.fn(),
    sendMessage: vi.fn(),
    notifyInvalidated: vi.fn(),
    stopOldScripts: vi.fn(),
    verifyScriptStartedEvent: vi.fn(),
    listenForNewerScripts: vi.fn(),
    invalidate: () => {
      // コンテキストを無効化し、すべてのリスナーを実行
      listeners.forEach((listener) => {
        try {
          listener();
        } catch (error) {
          console.error('Invalidation listener error:', error);
        }
      });
      listeners.length = 0;

      // タイマーとインターバルをクリア
      for (const timerId of timers.values()) {
        globalThis.clearTimeout(timerId);
      }
      for (const intervalId of intervals.values()) {
        globalThis.clearInterval(intervalId);
      }
      timers.clear();
      intervals.clear();
    },
  } as unknown as ContentScriptContext & { invalidate: () => void };
}

describe('WXTResourceManager', () => {
  let resourceManager: WXTResourceManager;
  let mockContext: ContentScriptContext & { invalidate: () => void };
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockContext = createMockContext();
    resourceManager = new WXTResourceManager(mockContext);
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);

    // すべてのモックをリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (mockElement.parentNode) {
      mockElement.parentNode.removeChild(mockElement);
    }
    // リソースの適切なクリーンアップ
    if (mockContext.invalidate) {
      mockContext.invalidate();
    }
  });

  describe('基本機能', () => {
    it('ContentScriptContextからインスタンスが作成される', () => {
      expect(resourceManager).toBeInstanceOf(WXTResourceManager);
      expect(resourceManager.isValid()).toBe(true);
      expect(resourceManager.getContext()).toBe(mockContext);
    });

    it('createResourceManagerファクトリ関数が正常に動作する', () => {
      const manager = createResourceManager(mockContext);
      expect(manager).toBeInstanceOf(WXTResourceManager);
      expect(manager.getContext()).toBe(mockContext);
    });
  });

  describe('イベントリスナー管理', () => {
    it('addEventListenersが正常に動作する', () => {
      const listener = vi.fn();

      resourceManager.addEventListeners(mockElement, 'click', listener);

      // WXT Context経由でイベントリスナーが登録されることを確認
      expect(mockContext.addEventListener).toHaveBeenCalledWith(
        mockElement,
        'click',
        listener,
        undefined
      );
    });

    it('オプション付きでイベントリスナーを登録できる', () => {
      const listener = vi.fn();
      const options = { once: true, passive: true };

      resourceManager.addEventListeners(
        mockElement,
        'scroll',
        listener,
        options
      );

      expect(mockContext.addEventListener).toHaveBeenCalledWith(
        mockElement,
        'scroll',
        listener,
        options
      );
    });

    it('実際のイベントが正常に発火される', () => {
      const listener = vi.fn();
      resourceManager.addEventListeners(mockElement, 'click', listener);

      // イベントを発火
      mockElement.click();

      expect(listener).toHaveBeenCalledOnce();
    });

    it('コンテキスト無効化後はイベントリスナーを登録できない', () => {
      mockContext.invalidate();

      const listener = vi.fn();
      resourceManager.addEventListeners(mockElement, 'click', listener);

      // 無効化後は登録されない
      expect(mockContext.addEventListener).not.toHaveBeenCalled();
      expect(resourceManager.isValid()).toBe(false);
    });
  });

  describe('タイマー管理', () => {
    it('addTimerが正常に動作する', () => {
      const callback = vi.fn();
      const delay = 1000;

      const timerId = resourceManager.addTimer(callback, delay);

      expect(mockContext.setTimeout).toHaveBeenCalledWith(callback, delay);
      expect(timerId).toBeGreaterThan(0);
    });

    it('タイマーコールバックが実行される', async () => {
      const callback = vi.fn();

      resourceManager.addTimer(callback, 10);

      // 短時間待機してコールバックが実行されることを確認
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(callback).toHaveBeenCalledOnce();
    });

    it('コンテキスト無効化後はタイマーを登録できない', () => {
      mockContext.invalidate();

      const callback = vi.fn();
      const timerId = resourceManager.addTimer(callback, 1000);

      expect(mockContext.setTimeout).not.toHaveBeenCalled();
      expect(timerId).toBe(-1);
      expect(resourceManager.isValid()).toBe(false);
    });
  });

  describe('インターバル管理', () => {
    it('addIntervalが正常に動作する', () => {
      const callback = vi.fn();
      const interval = 500;

      const intervalId = resourceManager.addInterval(callback, interval);

      expect(mockContext.setInterval).toHaveBeenCalledWith(callback, interval);
      expect(intervalId).toBeGreaterThan(0);
    });

    it('インターバルコールバックが複数回実行される', async () => {
      const callback = vi.fn();

      resourceManager.addInterval(callback, 10);

      // 複数回の実行を待機
      await new Promise((resolve) => setTimeout(resolve, 35));
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('コンテキスト無効化後はインターバルを登録できない', () => {
      mockContext.invalidate();

      const callback = vi.fn();
      const intervalId = resourceManager.addInterval(callback, 500);

      expect(mockContext.setInterval).not.toHaveBeenCalled();
      expect(intervalId).toBe(-1);
      expect(resourceManager.isValid()).toBe(false);
    });
  });

  describe('カスタムクリーンアップ管理', () => {
    it('registerCleanupが正常に動作する', () => {
      const cleanupHandler = vi.fn();

      resourceManager.registerCleanup(cleanupHandler);

      // クリーンアップハンドラーが登録されているが、まだ実行されていない
      expect(cleanupHandler).not.toHaveBeenCalled();
    });

    it('unregisterCleanupでクリーンアップハンドラーを削除できる', () => {
      const cleanupHandler = vi.fn();

      resourceManager.registerCleanup(cleanupHandler);
      resourceManager.unregisterCleanup(cleanupHandler);

      // コンテキストを無効化してもクリーンアップは実行されない
      mockContext.invalidate();
      expect(cleanupHandler).not.toHaveBeenCalled();
    });

    it('コンテキスト無効化時にクリーンアップハンドラーが実行される', () => {
      const cleanupHandler1 = vi.fn();
      const cleanupHandler2 = vi.fn();

      resourceManager.registerCleanup(cleanupHandler1);
      resourceManager.registerCleanup(cleanupHandler2);

      // コンテキストを無効化
      mockContext.invalidate();

      expect(cleanupHandler1).toHaveBeenCalledOnce();
      expect(cleanupHandler2).toHaveBeenCalledOnce();
      expect(resourceManager.isValid()).toBe(false);
    });

    it('クリーンアップハンドラーでエラーが発生しても他のハンドラーは実行される', () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Cleanup error');
      });
      const normalHandler = vi.fn();

      resourceManager.registerCleanup(errorHandler);
      resourceManager.registerCleanup(normalHandler);

      // エラーが発生してもクリーンアップは継続される
      mockContext.invalidate();

      expect(errorHandler).toHaveBeenCalledOnce();
      expect(normalHandler).toHaveBeenCalledOnce();
    });

    it('コンテキスト無効化後はクリーンアップハンドラーを登録できない', () => {
      mockContext.invalidate();

      const cleanupHandler = vi.fn();
      resourceManager.registerCleanup(cleanupHandler);

      expect(resourceManager.isValid()).toBe(false);
    });
  });

  describe('ライフサイクル管理', () => {
    it('コンテキスト無効化前後で状態が正しく変化する', () => {
      expect(resourceManager.isValid()).toBe(true);

      mockContext.invalidate();

      expect(resourceManager.isValid()).toBe(false);
    });

    it('onInvalidatedリスナーが正しく登録される', () => {
      // 新しいインスタンスを作成してコンストラクタの動作を確認
      const newContext = createMockContext();
      new WXTResourceManager(newContext);

      expect(newContext.onInvalidated).toHaveBeenCalledOnce();
      expect(newContext.onInvalidated).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  describe('統合テスト', () => {
    it('複数のリソースを登録してまとめてクリーンアップできる', async () => {
      const eventListener = vi.fn();
      const timerCallback = vi.fn();
      const intervalCallback = vi.fn();
      const cleanupHandler = vi.fn();

      // 各種リソースを登録
      resourceManager.addEventListeners(mockElement, 'click', eventListener);
      resourceManager.addTimer(timerCallback, 100);
      resourceManager.addInterval(intervalCallback, 50);
      resourceManager.registerCleanup(cleanupHandler);

      // 少し待機してタイマー/インターバルが動作することを確認
      await new Promise((resolve) => setTimeout(resolve, 75));
      expect(intervalCallback).toHaveBeenCalled();

      // イベントが動作することを確認
      mockElement.click();
      expect(eventListener).toHaveBeenCalledOnce();

      // コンテキストを無効化
      mockContext.invalidate();

      // カスタムクリーンアップが実行されることを確認
      expect(cleanupHandler).toHaveBeenCalledOnce();
      expect(resourceManager.isValid()).toBe(false);

      // 無効化後はイベントリスナーが動作しないことを確認
      // (実際のDOMイベントは引き続き動作するが、WXTの管理下からは外れる)
      mockElement.click();
      expect(eventListener).toHaveBeenCalledTimes(2); // 実際にはDOMイベントは動作し続ける
    });

    it('ResourceManagerErrorが適切に処理される', () => {
      // 既に無効化されたコンテキストでの操作
      mockContext.invalidate();

      const eventListener = vi.fn();
      resourceManager.addEventListeners(mockElement, 'click', eventListener);

      // エラーが発生してもリソースマネージャーは安定している
      expect(resourceManager.isValid()).toBe(false);
      expect(mockContext.addEventListener).not.toHaveBeenCalled();
    });
  });

  describe('メモリリーク防止', () => {
    it('同じハンドラーを複数回登録しても1回だけクリーンアップされる', () => {
      const cleanupHandler = vi.fn();

      resourceManager.registerCleanup(cleanupHandler);
      resourceManager.registerCleanup(cleanupHandler); // 重複登録

      mockContext.invalidate();

      // Set使用により重複は防止され、1回だけ実行される
      expect(cleanupHandler).toHaveBeenCalledOnce();
    });

    it('大量のリソース登録とクリーンアップが効率的に処理される', () => {
      const handlers: Array<() => void> = [];

      // 大量のリソースを登録
      for (let i = 0; i < 1000; i++) {
        const handler = vi.fn();
        handlers.push(handler);
        resourceManager.registerCleanup(handler);
      }

      // クリーンアップ実行
      const startTime = performance.now();
      mockContext.invalidate();
      const endTime = performance.now();

      // すべてのハンドラーが実行される
      handlers.forEach((handler) => {
        expect(handler).toHaveBeenCalledOnce();
      });

      // パフォーマンスが良好であることを確認（1000ハンドラーが10ms以内でクリーンアップ）
      expect(endTime - startTime).toBeLessThan(10);
    });
  });
});
