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
  return (
    root !== null &&
    typeof root === 'object' &&
    'unmount' in root &&
    'render' in root &&
    typeof (root as ReactDOM.Root).unmount === 'function' &&
    typeof (root as ReactDOM.Root).render === 'function'
  );
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
