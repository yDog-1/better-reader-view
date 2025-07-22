import DOMPurify from 'dompurify';
import { Readability } from '@mozilla/readability';
import type {
  LifecycleManager,
  DOMManager,
  ReactRenderer,
  Article,
} from './types';
import type { StyleController } from './StyleController';
import { isValidArticle } from './typeGuards';
import { ErrorHandler, StorageError, ShadowDOMError } from './errors';

// localStorage エラーをフォールバックで処理する関数
const safeLocalStorageAccess = (callback: () => void) => {
  try {
    callback();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('localStorage is not available')
    ) {
      // localStorage が利用できない場合はスキップ
      const storageError = new StorageError('localStorage access failed');
      ErrorHandler.handle(storageError);
    } else {
      throw error;
    }
  }
};

/**
 * リーダービューのライフサイクル全体を管理するクラス
 * 各コンポーネント間の協調を担当し、全体的な状態管理を行う
 */
export class ReaderLifecycleManager implements LifecycleManager {
  private static readonly CONTAINER_ID = 'better-reader-view-container';

  private domManager: DOMManager;
  private reactRenderer: ReactRenderer;
  private styleController: StyleController;
  private currentState: {
    isActive: boolean;
    container: HTMLElement | null;
    shadowRoot: ShadowRoot | null;
    reactRoot: unknown | null;
    originalDisplay: string;
  };

  constructor(
    domManager: DOMManager,
    reactRenderer: ReactRenderer,
    styleController: StyleController
  ) {
    this.domManager = domManager;
    this.reactRenderer = reactRenderer;
    this.styleController = styleController;
    this.currentState = {
      isActive: false,
      container: null,
      shadowRoot: null,
      reactRoot: null,
      originalDisplay: '',
    };
  }

  /**
   * リーダービューを有効化
   */
  activate(doc: Document): boolean {
    try {
      // コンテンツを抽出
      const content = this.extractContent(doc);
      if (!content) {
        return false;
      }

      // 既存のリーダービューがあれば先に無効化
      if (this.currentState.isActive) {
        this.deactivate(doc);
      }

      // 元のコンテンツを非表示
      this.currentState.originalDisplay =
        this.domManager.hideOriginalContent(doc);

      // Shadow DOM コンテナを作成
      this.currentState.container = this.domManager.createShadowContainer(doc);
      this.currentState.shadowRoot = this.currentState.container.shadowRoot;

      if (!this.currentState.shadowRoot) {
        throw new Error('Shadow DOM の作成に失敗しました');
      }

      // React コンポーネントをレンダリング
      this.currentState.reactRoot = this.reactRenderer.render(
        content,
        this.currentState.shadowRoot,
        () => this.deactivate(doc)
      );

      // コンテナをドキュメントに追加
      this.domManager.attachToDocument(this.currentState.container, doc);

      // StyleController の初期化を安全に実行
      safeLocalStorageAccess(() => {
        // localStorage を使用する処理があれば実行
      });

      this.currentState.isActive = true;
      return true;
    } catch (error) {
      const activationError = new ShadowDOMError(
        'reader view activation',
        error as Error
      );
      ErrorHandler.handle(activationError);
      this.cleanup(doc);
      return false;
    }
  }

  /**
   * リーダービューを無効化
   */
  deactivate(doc: Document): void {
    try {
      // React root をアンマウント
      if (this.currentState.reactRoot) {
        this.reactRenderer.unmount(this.currentState.reactRoot);
        this.currentState.reactRoot = null;
      }

      // Shadow root のコンテンツをクリア
      if (this.currentState.shadowRoot) {
        this.currentState.shadowRoot.innerHTML = '';
        this.currentState.shadowRoot = null;
      }

      // コンテナを削除
      this.domManager.removeFromDocument(
        ReaderLifecycleManager.CONTAINER_ID,
        doc
      );

      // インスタンス変数もクリア
      if (
        this.currentState.container &&
        this.currentState.container.parentNode
      ) {
        this.currentState.container.parentNode.removeChild(
          this.currentState.container
        );
      }
      this.currentState.container = null;

      // 元のページを復元
      this.domManager.restoreOriginalContent(
        doc,
        this.currentState.originalDisplay
      );

      this.currentState.isActive = false;
    } catch (error) {
      const deactivationError = new ShadowDOMError(
        'reader view deactivation',
        error as Error
      );
      ErrorHandler.handle(deactivationError);
      this.currentState.isActive = false;
    }
  }

  /**
   * リーダービューが有効かどうかを確認
   */
  isActive(): boolean {
    return this.currentState.isActive;
  }

  /**
   * コンテンツ抽出の純粋関数
   */
  private extractContent(document: Document): Article | null {
    const documentClone = document.cloneNode(true) as Document;
    const article = new Readability(documentClone).parse();

    if (!isValidArticle(article)) {
      return null;
    }

    // DOMPurify でサニタイズ
    const sanitizedContent = DOMPurify.sanitize(article.content);

    return {
      title: article.title || '',
      content: sanitizedContent,
      textContent: article.textContent || '',
      length: article.length || 0,
      excerpt: article.excerpt || '',
      byline: article.byline || null,
      dir: article.dir || null,
      siteName: article.siteName || null,
      lang: article.lang || null,
      publishedTime: article.publishedTime || null,
    };
  }

  /**
   * エラー時のクリーンアップ処理
   */
  private cleanup(doc: Document): void {
    if (this.currentState.originalDisplay) {
      this.domManager.restoreOriginalContent(
        doc,
        this.currentState.originalDisplay
      );
    }
    this.currentState = {
      isActive: false,
      container: null,
      shadowRoot: null,
      reactRoot: null,
      originalDisplay: '',
    };
  }
}
