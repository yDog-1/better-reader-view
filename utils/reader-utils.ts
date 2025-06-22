import DOMPurify from 'dompurify';
import { Readability } from '@mozilla/readability';
import ReactDOM from 'react-dom/client';
import React from 'react';
import ReaderView from '~/components/ReaderView';

/**
 * Article type for reader view content
 * Based on Mozilla Readability API result with extended properties
 */
export interface Article {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string | null;
  dir: string | null;
  siteName: string | null;
  lang: string | null;
}

/**
 * 純粋関数: documentから抽出し、DOMPurifyでサニタイズして{title, content}を返す
 */
const extractContent = (
  document: Document
): { title: string; content: string } | null => {
  const documentClone = document.cloneNode(true) as Document;
  const article = new Readability(documentClone).parse();

  if (!isValidArticle(article)) {
    return null;
  }

  // DOMPurifyでサニタイズ
  const sanitizedContent = DOMPurify.sanitize(article.content);

  return {
    title: article.title,
    content: sanitizedContent,
  };
};

/**
 * リーダービューの状態とライフサイクルを管理するクラス
 */
class ReaderViewManager {
  private readerContainer: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private reactRoot: ReactDOM.Root | null = null;
  private originalPageDisplay: string = '';

  /**
   * ReactコンポーネントをShadow DOMにレンダリング
   */
  private renderReaderViewToShadow(
    shadowRoot: ShadowRoot,
    content: { title: string; content: string }
  ): ReactDOM.Root {
    const root = ReactDOM.createRoot(shadowRoot);
    root.render(React.createElement(ReaderView, content));
    return root;
  }

  /**
   * リーダービューをShadow DOMで表示
   */
  activateReader(doc: Document): boolean {
    const content = extractContent(doc);
    if (!content) {
      return false;
    }

    // 既存のリーダービューがあれば先に削除
    this.deactivateReader(doc);

    // 既存ページを非表示
    this.originalPageDisplay = doc.body.style.display;
    doc.body.style.display = 'none';

    // コンテナ要素を作成
    this.readerContainer = doc.createElement('div');
    this.readerContainer.id = 'better-reader-view-container';
    this.readerContainer.style.cssText =
      'all: initial; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 2147483647;';

    // Shadow DOMを作成
    this.shadowRoot = this.readerContainer.attachShadow({ mode: 'open' });

    // ReactコンポーネントをShadow DOMにレンダリング
    this.reactRoot = this.renderReaderViewToShadow(this.shadowRoot, content);

    // コンテナをドキュメントに追加
    doc.body.parentElement?.appendChild(this.readerContainer);

    return true;
  }

  /**
   * リーダービューを非表示にして元ページを復元
   */
  deactivateReader(doc: Document): void {
    // React rootをアンマウント
    if (this.reactRoot) {
      try {
        this.reactRoot.unmount();
      } catch (e) {
        console.warn('Failed to unmount React root:', e);
      }
      this.reactRoot = null;
    }

    // Shadow rootのコンテンツをクリア
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = '';
      this.shadowRoot = null;
    }

    // コンテナを削除（IDで検索して確実に削除）
    const containerById = doc.getElementById('better-reader-view-container');
    if (containerById) {
      // ShadowRootがあれば先にクリア
      if (containerById.shadowRoot) {
        containerById.shadowRoot.innerHTML = '';
      }
      if (containerById.parentNode) {
        containerById.parentNode.removeChild(containerById);
      }
    }

    // インスタンス変数もクリア
    if (this.readerContainer && this.readerContainer.parentNode) {
      this.readerContainer.parentNode.removeChild(this.readerContainer);
    }
    this.readerContainer = null;

    // 元ページを表示
    doc.body.style.display = this.originalPageDisplay;
  }
}

// シングルトンインスタンス
const readerViewManager = new ReaderViewManager();

/**
 * リーダービューを有効化（グローバル関数としてエクスポート）
 */
export const activateReader = (doc: Document): boolean => {
  return readerViewManager.activateReader(doc);
};

/**
 * リーダービューを無効化（グローバル関数としてエクスポート）
 */
export const deactivateReader = (doc: Document): void => {
  readerViewManager.deactivateReader(doc);
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
