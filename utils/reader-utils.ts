import { StyleController } from './StyleController';
import { ShadowDOMManager } from './DOMManager';
import { ReactComponentRenderer } from './ReactRenderer';
import { ReaderLifecycleManager } from './LifecycleManager';
import type { Article } from './types';

/**
 * リーダービューの状態とライフサイクルを管理するクラス
 * 新しいアーキテクチャでは Facade パターンを使用して各責任を分離したコンポーネントを協調させる
 */
class ReaderViewManager {
  private lifecycleManager: ReaderLifecycleManager;
  private styleController: StyleController;

  constructor(styleController: StyleController) {
    this.styleController = styleController;

    // 各責任を分離したコンポーネントを作成
    const domManager = new ShadowDOMManager();
    const reactRenderer = new ReactComponentRenderer();

    // ライフサイクルマネージャが全体を協調
    this.lifecycleManager = new ReaderLifecycleManager(
      domManager,
      reactRenderer,
      styleController
    );
  }

  /**
   * リーダービューをShadow DOMで表示
   */
  activateReader(doc: Document): boolean {
    return this.lifecycleManager.activate(doc);
  }

  /**
   * リーダービューを非表示にして元ページを復元
   */
  deactivateReader(doc: Document): void {
    this.lifecycleManager.deactivate(doc);
  }

  /**
   * StyleControllerへの参照を取得
   */
  getStyleController(): StyleController {
    return this.styleController;
  }

  /**
   * リーダービューが有効かどうかを確認
   */
  isActive(): boolean {
    return this.lifecycleManager.isActive();
  }
}

/**
 * ReaderViewManagerファクトリ関数
 * グローバル状態を排除し、純粋な関数型プログラミングアプローチを採用
 */
export const createReaderViewManager = (
  styleController: StyleController
): ReaderViewManager => {
  return new ReaderViewManager(styleController);
};

/**
 * リーダービューを有効化（関数型API）
 * @param manager ReaderViewManagerインスタンス
 * @param doc ドキュメント
 * @returns 成功したかどうか
 */
export const activateReader = (
  manager: ReaderViewManager,
  doc: Document
): boolean => {
  return manager.activateReader(doc);
};

/**
 * リーダービューを無効化（関数型API）
 * @param manager ReaderViewManagerインスタンス
 * @param doc ドキュメント
 */
export const deactivateReader = (
  manager: ReaderViewManager,
  doc: Document
): void => {
  manager.deactivateReader(doc);
};

/**
 * リーダービューの状態を確認（関数型API）
 * @param manager ReaderViewManagerインスタンス
 * @returns リーダービューが有効かどうか
 */
export const isReaderActive = (manager: ReaderViewManager): boolean => {
  return manager.isActive();
};

/**
 * Type guard function: Check if article is valid Article type
 */
export function isValidArticle(article: unknown): article is Article {
  if (!article || typeof article !== 'object') {
    return false;
  }

  const candidateArticle = article as Partial<Article>;

  return (
    typeof candidateArticle.title === 'string' &&
    candidateArticle.title.trim() !== '' &&
    typeof candidateArticle.content === 'string' &&
    candidateArticle.content.trim() !== '' &&
    typeof candidateArticle.textContent === 'string' &&
    typeof candidateArticle.length === 'number' &&
    typeof candidateArticle.excerpt === 'string'
  );
}
