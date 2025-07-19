import type { DOMManager } from './types';
import { isValidDocument, hasShadowRoot } from './typeGuards';

/**
 * Shadow DOM の作成・管理を担当するクラス
 * DOM 操作の責任を分離して単体テストを容易にする
 */
export class ShadowDOMManager implements DOMManager {
  private static readonly CONTAINER_ID = 'better-reader-view-container';
  private static readonly CONTAINER_Z_INDEX = '2147483647';

  /**
   * Shadow DOM コンテナ要素を作成
   */
  createShadowContainer(doc: Document): HTMLElement {
    const container = doc.createElement('div');
    container.id = ShadowDOMManager.CONTAINER_ID;
    container.style.cssText = [
      'all: initial',
      'position: fixed',
      'top: 0',
      'left: 0',
      'width: 100vw',
      'height: 100vh',
      `z-index: ${ShadowDOMManager.CONTAINER_Z_INDEX}`,
    ].join('; ');

    // Shadow DOM を作成（open モードでスタイル注入を可能にする）
    container.attachShadow({ mode: 'open' });

    return container;
  }

  /**
   * コンテナをドキュメントに追加
   */
  attachToDocument(container: HTMLElement, doc: Document): void {
    if (!isValidDocument(doc)) {
      throw new Error('無効なドキュメントまたは body 要素が見つかりません');
    }

    const parent = doc.body.parentElement;
    if (!parent) {
      throw new Error('ドキュメントに body の親要素が見つかりません');
    }
    parent.appendChild(container);
  }

  /**
   * コンテナをドキュメントから削除
   */
  removeFromDocument(containerId: string, doc: Document): void {
    // ID による検索で確実に削除
    const containerById = doc.getElementById(containerId);
    if (containerById) {
      // ShadowRoot があれば先にクリア
      if (hasShadowRoot(containerById)) {
        containerById.shadowRoot.innerHTML = '';
      }
      if (containerById.parentNode) {
        containerById.parentNode.removeChild(containerById);
      }
    }
  }

  /**
   * 元のページコンテンツを非表示にする
   * @returns 元の display 値
   */
  hideOriginalContent(doc: Document): string {
    if (!isValidDocument(doc)) {
      throw new Error('無効なドキュメントまたは body 要素が見つかりません');
    }

    const originalDisplay = doc.body.style.display;
    doc.body.style.display = 'none';
    return originalDisplay;
  }

  /**
   * 元のページコンテンツを復元する
   */
  restoreOriginalContent(doc: Document, originalDisplay: string): void {
    if (!isValidDocument(doc)) {
      throw new Error('無効なドキュメントまたは body 要素が見つかりません');
    }

    doc.body.style.display = originalDisplay;
  }
}
