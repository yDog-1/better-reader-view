import type { ContentScriptContext } from 'wxt/utils/content-script-context';

/**
 * WXT UIライフサイクルに統合されたステート管理クラス
 *
 * このクラスは以下の機能を提供します：
 * - シングルトンインスタンスの管理
 * - ContentScriptContext無効化時の自動インスタンス削除
 * - 型安全なインスタンス作成とアクセス
 *
 * @example
 * ```typescript
 * const styleController = WXTUIStateManager.createInstance(
 *   'styleController',
 *   ctx,
 *   () => new StyleController()
 * );
 * ```
 */
export class WXTUIStateManager {
  private static instances = new Map<string, unknown>();

  /**
   * 指定した名前でインスタンスを作成または取得
   * ContentScriptContext無効化時に自動的にインスタンスが削除されます
   *
   * @param name インスタンスの識別名
   * @param ctx WXT ContentScriptContext
   * @param factory インスタンス作成ファクトリ関数
   * @returns 作成または既存のインスタンス
   */
  static createInstance<T>(
    name: string,
    ctx: ContentScriptContext,
    factory: () => T
  ): T {
    if (!this.instances.has(name)) {
      const instance = factory();
      this.instances.set(name, instance);

      // ContentScriptContext無効化時に自動削除
      ctx.onInvalidated(() => {
        this.instances.delete(name);
      });
    }

    return this.instances.get(name) as T;
  }

  /**
   * インスタンスを削除
   * @param name 削除するインスタンスの識別名
   */
  static removeInstance(name: string): void {
    this.instances.delete(name);
  }

  /**
   * 全てのインスタンスをクリア
   */
  static clearAll(): void {
    this.instances.clear();
  }

  /**
   * インスタンスが存在するかチェック
   * @param name インスタンスの識別名
   * @returns インスタンスが存在する場合true
   */
  static hasInstance(name: string): boolean {
    return this.instances.has(name);
  }
}
