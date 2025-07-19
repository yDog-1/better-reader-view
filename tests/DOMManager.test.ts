import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { ShadowDOMManager } from '@/utils/DOMManager';

describe('DOM管理機能', () => {
  let domManager: ShadowDOMManager;
  let document: Document;

  beforeEach(() => {
    const jsdom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <div>テストコンテンツ</div>
        </body>
      </html>
    `);
    document = jsdom.window.document;
    domManager = new ShadowDOMManager();
  });

  describe('Shadow DOMコンテナの作成', () => {
    it('適切なスタイルでShadow DOMコンテナを作成する', () => {
      const container = domManager.createShadowContainer(document);

      expect(container.id).toBe('better-reader-view-container');
      expect(container.style.position).toBe('fixed');
      expect(container.style.top).toBe('0px');
      expect(container.style.left).toBe('0px');
      expect(container.style.width).toBe('100vw');
      expect(container.style.height).toBe('100vh');
      expect(container.style.zIndex).toBe('2147483647');
      expect(container.shadowRoot).toBeTruthy();
      expect(container.shadowRoot!.mode).toBe('open');
    });

    it('Shadow DOMが正しく作成される', () => {
      const container = domManager.createShadowContainer(document);

      expect(container.shadowRoot).not.toBeNull();
      expect(container.shadowRoot!.innerHTML).toBe('');
    });
  });

  describe('ドキュメントへの添付', () => {
    it('コンテナを正常にドキュメントに添付する', () => {
      const container = domManager.createShadowContainer(document);

      domManager.attachToDocument(container, document);

      expect(document.documentElement.contains(container)).toBe(true);
      expect(container.parentElement).toBe(document.documentElement);
    });

    it('body の親要素が存在しない場合にエラーを投げる', () => {
      // body を null にして親要素をなくす
      const testDocument = new JSDOM('<div></div>').window.document;
      Object.defineProperty(testDocument, 'body', {
        value: null,
        writable: true,
      });

      const container = domManager.createShadowContainer(document);

      expect(() => {
        domManager.attachToDocument(container, testDocument);
      }).toThrow('無効なドキュメントまたは body 要素が見つかりません');
    });
  });

  describe('ドキュメントからの削除', () => {
    it('IDを指定してコンテナを正常に削除する', () => {
      const container = domManager.createShadowContainer(document);
      domManager.attachToDocument(container, document);

      // Shadow DOMにコンテンツを追加
      container.shadowRoot!.innerHTML = '<div>テストコンテンツ</div>';

      domManager.removeFromDocument('better-reader-view-container', document);

      expect(
        document.getElementById('better-reader-view-container')
      ).toBeNull();
    });

    it('存在しないIDを指定した場合は何もしない', () => {
      expect(() => {
        domManager.removeFromDocument('non-existent-container', document);
      }).not.toThrow();
    });

    it('Shadow DOMのコンテンツもクリアする', () => {
      const container = domManager.createShadowContainer(document);
      domManager.attachToDocument(container, document);

      // Shadow DOMにコンテンツを追加
      container.shadowRoot!.innerHTML = '<div>削除されるべきコンテンツ</div>';

      domManager.removeFromDocument('better-reader-view-container', document);

      // 削除されたコンテナは取得できない
      expect(
        document.getElementById('better-reader-view-container')
      ).toBeNull();
    });
  });

  describe('元コンテンツの表示制御', () => {
    it('元のコンテンツを非表示にし、元のdisplay値を返す', () => {
      document.body.style.display = 'block';

      const originalDisplay = domManager.hideOriginalContent(document);

      expect(document.body.style.display).toBe('none');
      expect(originalDisplay).toBe('block');
    });

    it('元のdisplay値が空の場合も正しく処理する', () => {
      document.body.style.display = '';

      const originalDisplay = domManager.hideOriginalContent(document);

      expect(document.body.style.display).toBe('none');
      expect(originalDisplay).toBe('');
    });

    it('元のコンテンツを正しく復元する', () => {
      const originalDisplay = 'flex';
      document.body.style.display = 'none';

      domManager.restoreOriginalContent(document, originalDisplay);

      expect(document.body.style.display).toBe('flex');
    });

    it('空文字列で復元する場合も正しく処理する', () => {
      document.body.style.display = 'none';

      domManager.restoreOriginalContent(document, '');

      expect(document.body.style.display).toBe('');
    });
  });

  describe('統合テスト', () => {
    it('完全なライフサイクルが正常に動作する', () => {
      // 1. コンテナ作成
      const container = domManager.createShadowContainer(document);
      expect(container.shadowRoot).toBeTruthy();

      // 2. 元コンテンツを非表示
      document.body.style.display = 'block';
      const originalDisplay = domManager.hideOriginalContent(document);
      expect(document.body.style.display).toBe('none');

      // 3. ドキュメントに添付
      domManager.attachToDocument(container, document);
      expect(document.documentElement.contains(container)).toBe(true);

      // 4. 削除
      domManager.removeFromDocument('better-reader-view-container', document);
      expect(
        document.getElementById('better-reader-view-container')
      ).toBeNull();

      // 5. 元コンテンツを復元
      domManager.restoreOriginalContent(document, originalDisplay);
      expect(document.body.style.display).toBe('block');
    });
  });
});
