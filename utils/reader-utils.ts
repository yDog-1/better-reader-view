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

// グローバルインスタンス管理
let readerViewManager: ReaderViewManager | null = null;

/**
 * ReaderViewManagerを初期化（StyleControllerが必要）
 */
export const initializeReaderViewManager = (
  styleController: StyleController
): void => {
  readerViewManager = new ReaderViewManager(styleController);
};

/**
 * ReaderViewManagerインスタンスを取得
 */
export const getReaderViewManager = (): ReaderViewManager => {
  if (!readerViewManager) {
    throw new Error(
      'ReaderViewManager が初期化されていません。initializeReaderViewManager() を先に呼び出してください。'
    );
  }
  return readerViewManager;
};

/**
 * リーダービューを有効化（グローバル関数としてエクスポート）
 */
export const activateReader = (doc: Document): boolean => {
  return getReaderViewManager().activateReader(doc);
};

/**
 * リーダービューを無効化（グローバル関数としてエクスポート）
 */
export const deactivateReader = (doc: Document): void => {
  getReaderViewManager().deactivateReader(doc);
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
