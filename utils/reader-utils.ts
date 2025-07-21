import { StyleController } from './StyleController';
import { ShadowDOMManager } from './DOMManager';
import { ReactComponentRenderer } from './ReactRenderer';
import { ReaderLifecycleManager } from './LifecycleManager';
import type { Article } from './types';
import {
  ArticleExtractionError,
  ShadowDOMError,
  RenderingError,
  ErrorHandler,
  withErrorHandling,
} from './errors';

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
    const domManager = withErrorHandling(
      () => new ShadowDOMManager(),
      (cause) => new ShadowDOMError('ShadowDOMManagerの初期化', cause)
    );

    const reactRenderer = withErrorHandling(
      () => new ReactComponentRenderer(),
      (cause) => new RenderingError('ReactComponentRendererの初期化', cause)
    );

    if (!domManager || !reactRenderer) {
      throw new ShadowDOMError(
        'ReaderViewManagerコンポーネントの初期化に失敗しました'
      );
    }

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
    return (
      withErrorHandling(
        () => this.lifecycleManager.activate(doc),
        (cause) => new ShadowDOMError('リーダービューの有効化', cause)
      ) ?? false
    );
  }

  /**
   * リーダービューを非表示にして元ページを復元
   */
  deactivateReader(doc: Document): void {
    withErrorHandling(
      () => {
        this.lifecycleManager.deactivate(doc);
        return true;
      },
      (cause) => new ShadowDOMError('リーダービューの無効化', cause)
    );
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
    return (
      withErrorHandling(
        () => this.lifecycleManager.isActive(),
        (cause) => new ShadowDOMError('リーダービューの状態確認', cause)
      ) ?? false
    );
  }
}

/**
 * ReaderViewManagerファクトリ関数
 * グローバル状態を排除し、純粋な関数型プログラミングアプローチを採用
 */
export const createReaderViewManager = (
  styleController: StyleController
): ReaderViewManager | null => {
  return withErrorHandling(
    () => new ReaderViewManager(styleController),
    (cause) => new ShadowDOMError('ReaderViewManagerの作成', cause)
  );
};

/**
 * リーダービューを有効化（関数型API）
 * @param manager ReaderViewManagerインスタンス
 * @param doc ドキュメント
 * @returns 成功したかどうか
 */
export const activateReader = (
  manager: ReaderViewManager | null,
  doc: Document
): boolean => {
  if (!manager) {
    ErrorHandler.handle(
      new ShadowDOMError('無効なReaderViewManagerインスタンス')
    );
    return false;
  }
  return manager.activateReader(doc);
};

/**
 * リーダービューを無効化（関数型API）
 * @param manager ReaderViewManagerインスタンス
 * @param doc ドキュメント
 */
export const deactivateReader = (
  manager: ReaderViewManager | null,
  doc: Document
): void => {
  if (!manager) {
    ErrorHandler.handle(
      new ShadowDOMError('無効なReaderViewManagerインスタンス')
    );
    return;
  }
  manager.deactivateReader(doc);
};

/**
 * リーダービューの状態を確認（関数型API）
 * @param manager ReaderViewManagerインスタンス
 * @returns リーダービューが有効かどうか
 */
export const isReaderActive = (manager: ReaderViewManager | null): boolean => {
  if (!manager) {
    ErrorHandler.handle(
      new ShadowDOMError('無効なReaderViewManagerインスタンス')
    );
    return false;
  }
  return manager.isActive();
};

/**
 * Type guard function: Check if article is valid Article type
 */
export function isValidArticle(article: unknown): article is Article {
  return (
    withErrorHandling(
      () => {
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
      },
      (cause) => new ArticleExtractionError(cause)
    ) ?? false
  );
}
