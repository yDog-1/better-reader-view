import type ReactDOM from 'react-dom/client';

/**
 * Documentオブジェクトがbodyプロパティを持つ有効なDocumentかどうかをチェック
 */
export function isValidDocument(
  doc: unknown
): doc is Document & { body: HTMLElement } {
  return (
    doc !== null &&
    typeof doc === 'object' &&
    'body' in doc &&
    doc.body !== null &&
    doc.body !== undefined &&
    typeof doc.body === 'object' &&
    'style' in doc.body &&
    typeof (doc as Document).createElement === 'function'
  );
}

/**
 * オブジェクトがReactDOM.Rootインスタンスかどうかをチェック
 */
export function isReactRoot(root: unknown): root is ReactDOM.Root {
  if (
    root !== null &&
    typeof root === 'object' &&
    'unmount' in root &&
    'render' in root
  ) {
    const reactRoot = root as ReactDOM.Root;
    return (
      typeof reactRoot.unmount === 'function' &&
      typeof reactRoot.render === 'function'
    );
  }
  return false;
}

/**
 * HTMLElementがshadowRootプロパティを持つかどうかをチェック
 */
export function hasShadowRoot(
  element: HTMLElement
): element is HTMLElement & { shadowRoot: ShadowRoot } {
  return (
    element instanceof HTMLElement &&
    'shadowRoot' in element &&
    element.shadowRoot instanceof ShadowRoot
  );
}

/**
 * エレメントが有効なHTMLElementかどうかをチェック
 */
export function isValidHTMLElement(element: unknown): element is HTMLElement {
  return element instanceof HTMLElement;
}

/**
 * エレメントがShadowRootを作成可能かどうかをチェック
 */
export function canAttachShadow(element: unknown): element is HTMLElement {
  return (
    element instanceof HTMLElement && typeof element.attachShadow === 'function'
  );
}

/**
 * Article の型ガード関数
 */
export function isValidArticle(article: unknown): article is {
  title: string;
  content: string;
} {
  if (!article || typeof article !== 'object') {
    return false;
  }

  const candidateArticle = article as Record<string, unknown>;

  return (
    typeof candidateArticle.title === 'string' &&
    candidateArticle.title.trim() !== '' &&
    typeof candidateArticle.content === 'string' &&
    candidateArticle.content.trim() !== ''
  );
}
