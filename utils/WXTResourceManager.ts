/* eslint-disable no-undef */
import type { ContentScriptContext } from 'wxt/utils/content-script-context';

/**
 * WXTのContentScriptContextを活用した自動リソースクリーンアップマネージャー
 * コンテキスト無効化時に自動的にリソースが解放される
 */
export class WXTResourceManager {
  constructor(private ctx: ContentScriptContext) {}

  /**
   * イベントリスナーを追加（自動クリーンアップ付き）
   * @param element イベントターゲット
   * @param event イベント名
   * @param listener イベントリスナー
   * @param options オプション
   */
  addEventListeners(
    element: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    // WXTのctx.addEventListenerを使用して自動クリーンアップ
    this.ctx.addEventListener(element, event, listener, options);
  }

  /**
   * タイマーを設定（自動クリーンアップ付き）
   * @param callback コールバック関数
   * @param delay 遅延時間（ミリ秒）
   * @returns タイマーID
   */
  addTimer(callback: () => void, delay: number): number {
    // WXTのctx.setTimeoutを使用（自動クリーンアップ）
    return this.ctx.setTimeout(callback, delay);
  }

  /**
   * インターバルを設定（自動クリーンアップ付き）
   * @param callback コールバック関数
   * @param interval インターバル時間（ミリ秒）
   * @returns インターバルID
   */
  addInterval(callback: () => void, interval: number): number {
    // WXTのctx.setIntervalを使用（自動クリーンアップ）
    return this.ctx.setInterval(callback, interval);
  }

  /**
   * リソースクリーンアップハンドラーを登録
   * @param cleanup クリーンアップ関数
   */
  addCleanupHandler(cleanup: () => void): void {
    this.ctx.onInvalidated(cleanup);
  }
}