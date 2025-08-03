import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import {
  ResourceManagerError,
  withErrorHandling,
  ErrorHandler,
} from '@/utils/errors';

/**
 * WXTのContentScriptContextを活用した自動リソースクリーンアップマネージャー
 *
 * このクラスは以下の機能を提供します：
 * - WXT ContentScriptContextによる自動リソース管理
 * - イベントリスナー、タイマー、インターバルの自動クリーンアップ
 * - カスタムクリーンアップハンドラーの登録と実行
 * - コンテキスト無効化時の確実なリソースクリーンアップ
 *
 * @example
 * ```typescript
 * const resourceManager = createResourceManager(ctx);
 *
 * // 自動クリーンアップ付きイベントリスナー
 * resourceManager.addEventListeners(element, 'click', handler);
 *
 * // 自動クリーンアップ付きタイマー
 * resourceManager.addTimer(() => console.log('timer'), 1000);
 *
 * // カスタムクリーンアップの登録
 * resourceManager.registerCleanup(() => {
 *   // 手動クリーンアップ処理
 * });
 * ```
 */
export class WXTResourceManager {
  private cleanupHandlers: Set<() => void> = new Set();
  private isContextValid = true;

  constructor(private ctx: ContentScriptContext) {
    // コンテキスト無効化時の自動クリーンアップ
    this.ctx.onInvalidated(() => {
      this.cleanup();
    });
  }

  /**
   * WXTのctx.addEventListenerを使用してイベントリスナーを登録
   * コンテキスト無効化時に自動的にクリーンアップされます
   *
   * @param element - イベントを追加する対象要素
   * @param event - イベントタイプ
   * @param listener - イベントリスナー
   * @param options - オプション設定
   */
  addEventListeners(
    element: EventTarget,
    event: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    withErrorHandling(
      () => {
        if (!this.isContextValid) {
          throw new ResourceManagerError('Context is invalidated');
        }

        // WXTのContentScriptContextを使用した自動管理
        this.ctx.addEventListener(element, event, listener, options);
        return true;
      },
      (cause) => new ResourceManagerError('Event listener registration', cause)
    );
  }

  /**
   * WXTのctx.setTimeoutを使用してタイマーを登録
   * コンテキスト無効化時に自動的にクリーンアップされます
   *
   * @param callback - 実行するコールバック関数
   * @param delay - 遅延時間（ミリ秒）
   * @returns タイマーID
   */
  addTimer(callback: () => void, delay: number): number {
    return (
      withErrorHandling(
        () => {
          if (!this.isContextValid) {
            throw new ResourceManagerError('Context is invalidated');
          }

          // WXTのContentScriptContextを使用した自動管理
          return this.ctx.setTimeout(callback, delay);
        },
        (cause) => new ResourceManagerError('Timer registration', cause)
      ) ?? -1
    );
  }

  /**
   * WXTのctx.setIntervalを使用してインターバルを登録
   * コンテキスト無効化時に自動的にクリーンアップされます
   *
   * @param callback - 実行するコールバック関数
   * @param interval - インターバル時間（ミリ秒）
   * @returns インターバルID
   */
  addInterval(callback: () => void, interval: number): number {
    return (
      withErrorHandling(
        () => {
          if (!this.isContextValid) {
            throw new ResourceManagerError('Context is invalidated');
          }

          // WXTのContentScriptContextを使用した自動管理
          return this.ctx.setInterval(callback, interval);
        },
        (cause) => new ResourceManagerError('Interval registration', cause)
      ) ?? -1
    );
  }

  /**
   * カスタムクリーンアップハンドラーを登録
   * コンテキスト無効化時に実行されます
   *
   * @param handler - クリーンアップ処理を実行する関数
   */
  registerCleanup(handler: () => void): void {
    withErrorHandling(
      () => {
        if (!this.isContextValid) {
          throw new ResourceManagerError('Context is invalidated');
        }

        this.cleanupHandlers.add(handler);
        return true;
      },
      (cause) => new ResourceManagerError('Cleanup handler registration', cause)
    );
  }

  /**
   * 特定のクリーンアップハンドラーを削除
   *
   * @param handler - 削除するクリーンアップハンドラー
   */
  unregisterCleanup(handler: () => void): void {
    this.cleanupHandlers.delete(handler);
  }

  /**
   * 登録されたすべてのカスタムクリーンアップハンドラーを実行
   * WXTによる自動クリーンアップは別途実行されます
   */
  private cleanup(): void {
    this.isContextValid = false;

    // カスタムクリーンアップハンドラーを安全に実行
    for (const handler of this.cleanupHandlers) {
      try {
        handler();
      } catch (error) {
        ErrorHandler.handle(
          new ResourceManagerError(
            'Cleanup handler execution failed',
            error as Error
          )
        );
      }
    }

    this.cleanupHandlers.clear();
  }

  /**
   * リソースクリーンアップハンドラーを登録（別名メソッド）
   * @param cleanup クリーンアップ関数
   */
  addCleanupHandler(cleanup: () => void): void {
    this.registerCleanup(cleanup);
  }

  /**
   * コンテキストが有効かどうかを確認
   *
   * @returns コンテキストが有効な場合はtrue
   */
  isValid(): boolean {
    return this.isContextValid;
  }

  /**
   * 現在のContentScriptContextを取得
   *
   * @returns ContentScriptContext
   */
  getContext(): ContentScriptContext {
    return this.ctx;
  }

  /**
   * リソースクリーンアップハンドラーを登録（別名メソッド）
   * @param cleanup クリーンアップ関数
   */
  addCleanupHandler(cleanup: () => void): void {
    this.registerCleanup(cleanup);
  }
}

/**
 * WXTResourceManagerのファクトリ関数
 * ContentScriptContextからWXTResourceManagerインスタンスを作成
 *
 * @param ctx - WXT ContentScriptContext
 * @returns WXTResourceManagerインスタンス
 */
export function createResourceManager(
  ctx: ContentScriptContext
): WXTResourceManager {
  return new WXTResourceManager(ctx);
}

export default WXTResourceManager;
