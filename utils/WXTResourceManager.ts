import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import {
  ResourceManagementError,
  MemoryLeakError,
  WXTLifecycleError,
} from '@/utils/errors';

/**
 * WXTリソース管理クラス
 * WXTのContentScriptContextを活用した自動リソースクリーンアップを提供
 */
export class WXTResourceManager {
  public readonly context: ContentScriptContext;
  private readonly resources: Set<() => void> = new Set();
  private isDestroyed = false;

  constructor(context: ContentScriptContext) {
    this.context = context;
    this.setupCleanup();
  }

  /**
   * WXTのaddEventListenerを使用してイベントリスナーを自動管理
   */
  addEventListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (this.isDestroyed) {
      throw new WXTLifecycleError(
        'イベントリスナーを追加しようとしましたが、ResourceManagerは既に破棄されています'
      );
    }

    try {
      this.context.addEventListener(target, type, listener, options);
    } catch (error) {
      throw new ResourceManagementError(
        'WXTイベントリスナーの登録',
        error as Error,
        { target: target.constructor.name, type, options }
      );
    }
  }

  /**
   * WXTのsetTimeoutを使用してタイマーを自動管理
   */
  setTimeout(handler: () => void, timeout?: number): number {
    if (this.isDestroyed) {
      throw new WXTLifecycleError(
        'タイマーを設定しようとしましたが、ResourceManagerは既に破棄されています'
      );
    }

    try {
      return this.context.setTimeout(handler, timeout);
    } catch (error) {
      throw new ResourceManagementError('WXTタイマーの設定', error as Error, {
        timeout,
      });
    }
  }

  /**
   * WXTのsetIntervalを使用してインターバルを自動管理
   */
  setInterval(handler: () => void, timeout?: number): number {
    if (this.isDestroyed) {
      throw new WXTLifecycleError(
        'インターバルを設定しようとしましたが、ResourceManagerは既に破棄されています'
      );
    }

    try {
      return this.context.setInterval(handler, timeout);
    } catch (error) {
      throw new ResourceManagementError(
        'WXTインターバルの設定',
        error as Error,
        { timeout }
      );
    }
  }

  /**
   * カスタムリソースクリーンアップ関数を登録
   */
  registerCleanup(cleanupFn: () => void): void {
    if (this.isDestroyed) {
      throw new WXTLifecycleError(
        'クリーンアップ関数を登録しようとしましたが、ResourceManagerは既に破棄されています'
      );
    }

    this.resources.add(cleanupFn);
  }

  /**
   * 特定のクリーンアップ関数を削除
   */
  unregisterCleanup(cleanupFn: () => void): void {
    this.resources.delete(cleanupFn);
  }

  /**
   * 手動でリソースクリーンアップを実行
   */
  cleanup(): void {
    if (this.isDestroyed) {
      return; // 既にクリーンアップ済み
    }

    try {
      // カスタムリソースのクリーンアップ
      for (const cleanupFn of this.resources) {
        try {
          cleanupFn();
        } catch (error) {
          console.error('リソースクリーンアップ中にエラー:', error);
        }
      }
      this.resources.clear();

      // WXTコンテキストの無効化はWXT側で自動実行される
      this.isDestroyed = true;
    } catch (error) {
      throw new MemoryLeakError(
        'リソースクリーンアップ実行中にエラーが発生しました',
        error as Error
      );
    }
  }

  /**
   * ResourceManagerの破棄状態を確認
   */
  get destroyed(): boolean {
    return this.isDestroyed;
  }

  /**
   * WXTコンテキストの有効性を確認
   */
  get isContextValid(): boolean {
    return !this.context.isInvalid && !this.isDestroyed;
  }

  /**
   * 管理中のリソース数を取得（デバッグ用）
   */
  get resourceCount(): number {
    return this.resources.size;
  }

  /**
   * WXTライフサイクルに基づく自動クリーンアップ設定
   */
  private setupCleanup(): void {
    // WXTコンテキストが無効化されたときの自動クリーンアップ
    this.context.onInvalidated(() => {
      try {
        this.cleanup();
      } catch (error) {
        console.error('WXTコンテキスト無効化時のクリーンアップエラー:', error);
      }
    });
  }
}

/**
 * WXTResourceManagerのファクトリ関数
 */
export function createResourceManager(
  context: ContentScriptContext
): WXTResourceManager {
  try {
    return new WXTResourceManager(context);
  } catch (error) {
    throw new ResourceManagementError(
      'WXTResourceManagerの作成',
      error as Error,
      { contextInvalid: context.isInvalid }
    );
  }
}

export default WXTResourceManager;
