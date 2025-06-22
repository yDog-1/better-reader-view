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
 * ReactコンポーネントをShadow DOMにレンダリングする関数
 */
const renderReaderViewToShadow = (
  shadowRoot: ShadowRoot,
  content: { title: string; content: string }
): ReactDOM.Root => {
  const root = ReactDOM.createRoot(shadowRoot);
  root.render(React.createElement(ReaderView, content));
  return root;
};

// Reader viewの状態を管理するグローバル変数
let readerContainer: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let reactRoot: ReactDOM.Root | null = null;
let originalPageDisplay: string = '';

/**
 * リーダービューをShadow DOMで表示する関数
 */
export const activateReader = (doc: Document): boolean => {
  const content = extractContent(doc);
  if (!content) {
    return false;
  }

  // 既存のリーダービューコンテナがあれば削除
  deactivateReader(doc);

  // 既存ページを非表示
  originalPageDisplay = doc.body.style.display;
  doc.body.style.display = 'none';

  // コンテナ要素を作成してbodyに追加
  readerContainer = doc.createElement('div');
  readerContainer.id = 'better-reader-view-container';
  readerContainer.style.cssText =
    'all: initial; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 2147483647;';

  // Shadow DOMを作成
  shadowRoot = readerContainer.attachShadow({ mode: 'open' });

  // ReactコンポーネントをShadow DOMにレンダリング
  reactRoot = renderReaderViewToShadow(shadowRoot, content);

  // コンテナをドキュメントに追加
  doc.body.parentElement?.appendChild(readerContainer);

  return true;
};

/**
 * リーダービューを非表示にして元ページを復元する関数
 */
export const deactivateReader = (doc: Document): void => {
  // React rootをアンマウント
  if (reactRoot) {
    try {
      reactRoot.unmount();
    } catch (e) {
      console.warn('Failed to unmount React root:', e);
    }
    reactRoot = null;
  }

  // Shadow rootのコンテンツをクリア
  if (shadowRoot) {
    shadowRoot.innerHTML = '';
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

  // グローバル変数もクリア
  if (readerContainer && readerContainer.parentNode) {
    readerContainer.parentNode.removeChild(readerContainer);
  }
  
  readerContainer = null;
  shadowRoot = null;

  // 元ページを表示
  doc.body.style.display = originalPageDisplay;
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
