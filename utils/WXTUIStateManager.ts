import {
  StateManagementError,
  WXTLifecycleError,
  StorageError,
  ErrorHandler,
  withAsyncErrorHandling,
} from '@/utils/errors';
import { StorageManager } from '@/utils/storage-config';
import { BrowserAPIManager } from '@/utils/BrowserAPIManager';
import type { WXTResourceManager } from '@/utils/WXTResourceManager';

/**
 * WXT UI状態管理インターフェース
 */
interface UIState {
  isReaderViewActive: boolean;
  currentUrl: string | null;
  currentTitle: string | null;
  lastActivated: number | null;
  uiMounted: boolean;
  shadowDOMAttached: boolean;
}

/**
 * 状態変更リスナーの型定義
 */
type StateChangeListener = (state: UIState, previousState: UIState) => void;

/**
 * WXT UI ライフサイクル管理クラス
 * WXTフレームワークのUIライフサイクルに合わせた状態管理を提供
 */
export class WXTUIStateManager {
  private state: UIState;
  private readonly listeners: Set<StateChangeListener> = new Set();
  private readonly resourceManager: WXTResourceManager;
  private isDestroyed = false;
  private storageUpdateInterval: number | null = null;

  constructor(resourceManager: WXTResourceManager) {
    this.resourceManager = resourceManager;

    // 初期状態の設定
    this.state = {
      isReaderViewActive: false,
      currentUrl: null,
      currentTitle: null,
      lastActivated: null,
      uiMounted: false,
      shadowDOMAttached: false,
    };

    this.setupResourceCleanup();
    this.initializeFromStorage();
  }

  /**
   * ストレージからの初期状態読み込み
   */
  private initializeFromStorage(): void {
    withAsyncErrorHandling(
      async () => {
        const readerState = await BrowserAPIManager.safeAsyncAPICall(
          () => StorageManager.getReaderViewState(),
          {
            isActive: false,
            url: undefined,
            title: undefined,
            lastActivated: undefined,
          },
          'storage.session'
        );

        const newState: UIState = {
          ...this.state,
          isReaderViewActive: readerState.isActive,
          currentUrl: readerState.url ?? null,
          currentTitle: readerState.title ?? null,
          lastActivated: readerState.lastActivated ?? null,
        };

        this.updateState(newState);
      },
      (cause) =>
        new StateManagementError('ストレージからの初期状態読み込み', cause)
    );
  }

  /**
   * UI状態の取得
   */
  getState(): Readonly<UIState> {
    if (this.isDestroyed) {
      throw new WXTLifecycleError('UIStateManagerは既に破棄されています');
    }
    return { ...this.state };
  }

  /**
   * リーダービューの活性化状態を更新
   */
  async setReaderViewActive(
    isActive: boolean,
    url?: string,
    title?: string
  ): Promise<void> {
    if (this.isDestroyed) {
      throw new WXTLifecycleError('UIStateManagerは既に破棄されています');
    }

    await withAsyncErrorHandling(
      async () => {
        const newState: UIState = {
          ...this.state,
          isReaderViewActive: isActive,
          currentUrl: isActive ? (url ?? this.state.currentUrl) : null,
          currentTitle: isActive ? (title ?? this.state.currentTitle) : null,
          lastActivated: isActive ? Date.now() : null,
        };

        this.updateState(newState);

        // ストレージの状態を同期
        if (isActive && newState.currentUrl && newState.currentTitle) {
          await BrowserAPIManager.safeAsyncAPICall(
            () =>
              StorageManager.activateReaderView(
                newState.currentUrl!,
                newState.currentTitle!
              ),
            undefined,
            'storage.session'
          );
        } else {
          await BrowserAPIManager.safeAsyncAPICall(
            () => StorageManager.deactivateReaderView(),
            undefined,
            'storage.session'
          );
        }
      },
      (cause) => new StateManagementError('リーダービュー状態の更新', cause)
    );
  }

  /**
   * UIマウント状態を更新
   */
  setUIMounted(mounted: boolean): void {
    if (this.isDestroyed) {
      throw new WXTLifecycleError('UIStateManagerは既に破棄されています');
    }

    const newState: UIState = {
      ...this.state,
      uiMounted: mounted,
    };

    this.updateState(newState);
  }

  /**
   * Shadow DOM接続状態を更新
   */
  setShadowDOMAttached(attached: boolean): void {
    if (this.isDestroyed) {
      throw new WXTLifecycleError('UIStateManagerは既に破棄されています');
    }

    const newState: UIState = {
      ...this.state,
      shadowDOMAttached: attached,
    };

    this.updateState(newState);
  }

  /**
   * 状態変更リスナーを追加
   */
  addStateChangeListener(listener: StateChangeListener): void {
    if (this.isDestroyed) {
      throw new WXTLifecycleError('UIStateManagerは既に破棄されています');
    }

    this.listeners.add(listener);
  }

  /**
   * 状態変更リスナーを削除
   */
  removeStateChangeListener(listener: StateChangeListener): void {
    this.listeners.delete(listener);
  }

  /**
   * ストレージとの定期同期を開始
   */
  startStorageSync(intervalMs: number = 5000): void {
    if (this.isDestroyed) {
      throw new WXTLifecycleError('UIStateManagerは既に破棄されています');
    }

    if (this.storageUpdateInterval !== null) {
      return; // 既に開始済み
    }

    this.storageUpdateInterval = this.resourceManager.setInterval(() => {
      this.syncWithStorage();
    }, intervalMs);
  }

  /**
   * ストレージとの定期同期を停止
   */
  stopStorageSync(): void {
    if (this.storageUpdateInterval !== null) {
      // WXTResourceManagerが管理するため、手動でのclearIntervalは不要
      this.storageUpdateInterval = null;
    }
  }

  /**
   * UIStateManagerの破棄
   */
  destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    try {
      this.stopStorageSync();
      this.listeners.clear();
      this.isDestroyed = true;
    } catch (error) {
      ErrorHandler.handle(
        new StateManagementError('UIStateManagerの破棄', error as Error)
      );
    }
  }

  /**
   * 破棄状態の確認
   */
  get destroyed(): boolean {
    return this.isDestroyed;
  }

  /**
   * アクティブなリスナー数の取得（デバッグ用）
   */
  get listenerCount(): number {
    return this.listeners.size;
  }

  /**
   * 内部状態を更新し、リスナーに通知
   */
  private updateState(newState: UIState): void {
    const previousState = { ...this.state };
    this.state = newState;

    // リスナーに通知
    for (const listener of this.listeners) {
      try {
        listener(newState, previousState);
      } catch (error) {
        console.error('状態変更リスナーでエラーが発生:', error);
      }
    }
  }

  /**
   * ストレージとの同期
   */
  private async syncWithStorage(): Promise<void> {
    if (this.isDestroyed) {
      return;
    }

    await withAsyncErrorHandling(
      async () => {
        const readerState = await BrowserAPIManager.safeAsyncAPICall(
          () => StorageManager.getReaderViewState(),
          {
            isActive: false,
            url: undefined,
            title: undefined,
            lastActivated: undefined,
          },
          'storage.session'
        );

        // ストレージと現在の状態が異なる場合のみ更新
        if (
          readerState.isActive !== this.state.isReaderViewActive ||
          (readerState.url ?? null) !== this.state.currentUrl ||
          (readerState.title ?? null) !== this.state.currentTitle ||
          (readerState.lastActivated ?? null) !== this.state.lastActivated
        ) {
          const newState: UIState = {
            ...this.state,
            isReaderViewActive: readerState.isActive,
            currentUrl: readerState.url ?? null,
            currentTitle: readerState.title ?? null,
            lastActivated: readerState.lastActivated ?? null,
          };

          this.updateState(newState);
        }
      },
      (cause) => new StorageError('ストレージ同期', cause)
    );
  }

  /**
   * WXTResourceManagerでのクリーンアップ登録
   */
  private setupResourceCleanup(): void {
    this.resourceManager.registerCleanup(() => {
      this.destroy();
    });
  }
}

/**
 * WXTUIStateManagerのファクトリ関数
 */
export function createUIStateManager(
  resourceManager: WXTResourceManager
): WXTUIStateManager {
  try {
    return new WXTUIStateManager(resourceManager);
  } catch (error) {
    throw new StateManagementError('WXTUIStateManagerの作成', error as Error, {
      resourceManagerDestroyed: resourceManager.destroyed,
    });
  }
}

export default WXTUIStateManager;
