import { Readability } from '@mozilla/readability';
import DOMPurify from 'dompurify';
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
 * 記事コンテンツを抽出する純粋関数
 * Mozilla Readabilityを使用してメインコンテンツを抽出し、DOMPurifyでサニタイズ
 */
export function extractContent(document: Document): Article | null {
  return withErrorHandling(
    () => {
      // ドキュメントをクローンして元のDOMに影響しないようにする
      const documentClone = document.cloneNode(true) as Document;
      
      // Mozilla Readabilityで記事コンテンツを抽出
      const reader = new Readability(documentClone);
      const article = reader.parse();

      if (!article) {
        return null;
      }

      // DOMPurifyでHTMLをサニタイズ
      const sanitizedContent = DOMPurify.sanitize(article.content || '', {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'dl', 'dt', 'dd',
          'blockquote', 'pre', 'code',
          'a', 'img', 'figure', 'figcaption',
          'table', 'thead', 'tbody', 'tr', 'td', 'th',
          'div', 'span', 'article', 'section', 'aside', 'header', 'footer',
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'width', 'height',
          'class', 'id', 'role', 'aria-label', 'aria-describedby',
        ],
        KEEP_CONTENT: true,
      });

      return {
        title: article.title || document.title || 'Untitled',
        content: sanitizedContent,
        textContent: article.textContent || '',
        length: article.length || 0,
        excerpt: article.excerpt || '',
        byline: article.byline || '',
        dir: article.dir || 'ltr',
        siteName: article.siteName || '',
        lang: article.lang || 'ja',
        publishedTime: article.publishedTime || null,
      };
    },
    (cause) => new ArticleExtractionError(cause)
  );
}

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
