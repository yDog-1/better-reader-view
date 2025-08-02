import type { ContentScriptContext } from 'wxt/utils/content-script-context';

/**
 * WXTのUI Lifecycleに合わせたステート管理クラス
 * ContentScriptContextの無効化時に自動的にインスタンスをクリーンアップ
 */
export class WXTUIStateManager {
  private static instances = new Map<string, unknown>();

  /**
   * シングルトンインスタンスの作成または取得
   * @param name インスタンスの識別名
   * @param ctx WXTのContentScriptContext
   * @param factory インスタンスを作成するファクトリ関数
   * @returns 作成または取得されたインスタンス
   */
  static createInstance<T>(
    name: string,
    ctx: ContentScriptContext,
    factory: () => T
  ): T {
    if (!this.instances.has(name)) {
      const instance = factory();
      this.instances.set(name, instance);

      // コンテキスト無効化時のクリーンアップ
      ctx.onInvalidated(() => {
        this.instances.delete(name);
      });
    }

    return this.instances.get(name) as T;
  }

  /**
   * インスタンスの手動削除
   * @param name インスタンスの識別名
   */
  static removeInstance(name: string): void {
    this.instances.delete(name);
  }

  /**
   * すべてのインスタンスをクリア
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