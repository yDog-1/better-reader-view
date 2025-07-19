import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { ReaderLifecycleManager } from '@/utils/LifecycleManager';
import type { DOMManager, ReactRenderer } from '@/utils/types';
import { StyleController } from '@/utils/StyleController';
import DOMPurify from 'dompurify';
import { Readability } from '@mozilla/readability';

// DOMPurify と Readability をモック
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((content) => content),
  },
}));

vi.mock('@mozilla/readability', () => ({
  Readability: vi.fn(() => ({
    parse: vi.fn(() => ({
      title: 'テスト記事タイトル',
      content: '<p>テスト記事コンテンツ</p>',
    })),
  })),
}));

describe('ライフサイクル管理機能', () => {
  let lifecycleManager: ReaderLifecycleManager;
  let mockDOMManager: DOMManager;
  let mockReactRenderer: ReactRenderer;
  let styleController: StyleController;
  let document: Document;

  beforeEach(() => {
    // JSDOM でテスト環境をセットアップ
    const jsdom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head><title>テストページ</title></head>
        <body>
          <article>
            <h1>テスト記事タイトル</h1>
            <p>これは十分な長さのテスト記事コンテンツです。Readabilityの要件を満たすために、適切な量のテキストを含んでいます。</p>
          </article>
        </body>
      </html>
    `,
      {
        url: 'https://example.com', // localStorage エラーを回避
      }
    );
    document = jsdom.window.document;

    // モックの作成
    mockDOMManager = {
      createShadowContainer: vi.fn(() => {
        const container = document.createElement('div');
        container.id = 'better-reader-view-container';
        container.attachShadow({ mode: 'open' });
        return container;
      }),
      attachToDocument: vi.fn(),
      removeFromDocument: vi.fn(),
      hideOriginalContent: vi.fn(() => 'block'),
      restoreOriginalContent: vi.fn(),
    };

    mockReactRenderer = {
      render: vi.fn(() => ({ unmount: vi.fn() })),
      unmount: vi.fn(),
    };

    styleController = new StyleController();

    lifecycleManager = new ReaderLifecycleManager(
      mockDOMManager,
      mockReactRenderer,
      styleController
    );

    // モックをリセット
    vi.clearAllMocks();
  });

  describe('リーダービューの有効化', () => {
    it('有効なコンテンツがある場合はリーダービューを正常に有効化する', () => {
      const result = lifecycleManager.activate(document);

      expect(result).toBe(true);
      expect(mockDOMManager.hideOriginalContent).toHaveBeenCalledWith(document);
      expect(mockDOMManager.createShadowContainer).toHaveBeenCalledWith(
        document
      );
      expect(mockReactRenderer.render).toHaveBeenCalled();
      expect(mockDOMManager.attachToDocument).toHaveBeenCalled();
      expect(lifecycleManager.isActive()).toBe(true);
    });

    it('無効なコンテンツの場合は有効化に失敗する', () => {
      vi.mocked(Readability).mockImplementationOnce(() => ({
        parse: vi.fn(() => null), // 無効なコンテンツを返す
      }));

      const result = lifecycleManager.activate(document);

      expect(result).toBe(false);
      expect(lifecycleManager.isActive()).toBe(false);
      expect(mockDOMManager.hideOriginalContent).not.toHaveBeenCalled();
    });

    it('既にアクティブな場合は先に無効化してから有効化する', () => {
      // 最初の有効化
      lifecycleManager.activate(document);
      expect(lifecycleManager.isActive()).toBe(true);

      // モックをリセット
      vi.clearAllMocks();

      // 2回目の有効化
      const result = lifecycleManager.activate(document);

      expect(result).toBe(true);
      expect(lifecycleManager.isActive()).toBe(true);
      // 新しい有効化のために必要な処理が呼ばれる
      expect(mockDOMManager.hideOriginalContent).toHaveBeenCalled();
      expect(mockDOMManager.createShadowContainer).toHaveBeenCalled();
    });

    it('DOM操作でエラーが発生した場合は適切にハンドリングする', () => {
      mockDOMManager.createShadowContainer.mockImplementation(() => {
        throw new Error('DOM作成エラー');
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = lifecycleManager.activate(document);

      expect(result).toBe(false);
      expect(lifecycleManager.isActive()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'リーダービューの有効化に失敗しました:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('リーダービューの無効化', () => {
    beforeEach(() => {
      // テスト前にリーダービューを有効化
      lifecycleManager.activate(document);
      vi.clearAllMocks(); // 有効化時の呼び出しをリセット
    });

    it('正常にリーダービューを無効化する', () => {
      lifecycleManager.deactivate(document);

      expect(mockReactRenderer.unmount).toHaveBeenCalled();
      expect(mockDOMManager.removeFromDocument).toHaveBeenCalledWith(
        'better-reader-view-container',
        document
      );
      expect(mockDOMManager.restoreOriginalContent).toHaveBeenCalled();
      expect(lifecycleManager.isActive()).toBe(false);
    });

    it('アクティブでない場合も安全に無効化できる', () => {
      // 先に無効化
      lifecycleManager.deactivate(document);
      expect(lifecycleManager.isActive()).toBe(false);

      // もう一度無効化（エラーにならないことを確認）
      expect(() => {
        lifecycleManager.deactivate(document);
      }).not.toThrow();
    });

    it('無効化中にエラーが発生してもクラッシュしない', () => {
      mockReactRenderer.unmount.mockImplementation(() => {
        throw new Error('アンマウントエラー');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => {
        lifecycleManager.deactivate(document);
      }).not.toThrow();

      expect(lifecycleManager.isActive()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'リーダービューの無効化で一部エラーが発生しました:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('状態管理', () => {
    it('初期状態は非アクティブ', () => {
      expect(lifecycleManager.isActive()).toBe(false);
    });

    it('有効化後はアクティブ状態になる', () => {
      lifecycleManager.activate(document);
      expect(lifecycleManager.isActive()).toBe(true);
    });

    it('無効化後は非アクティブ状態になる', () => {
      lifecycleManager.activate(document);
      lifecycleManager.deactivate(document);
      expect(lifecycleManager.isActive()).toBe(false);
    });
  });

  describe('コンテンツ抽出', () => {
    it('有効な記事コンテンツを正しく抽出する', () => {
      vi.mocked(DOMPurify.sanitize).mockReturnValue(
        '<p>サニタイズされたコンテンツ</p>'
      );

      const result = lifecycleManager.activate(document);

      expect(result).toBe(true);
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(
        '<p>テスト記事コンテンツ</p>'
      );
    });

    it('タイトルが空の記事は無効とする', () => {
      vi.mocked(Readability).mockImplementationOnce(() => ({
        parse: vi.fn(() => ({
          title: '', // 空のタイトル
          content: '<p>コンテンツはある</p>',
        })),
      }));

      const result = lifecycleManager.activate(document);

      expect(result).toBe(false);
      expect(lifecycleManager.isActive()).toBe(false);
    });

    it('コンテンツが空の記事は無効とする', () => {
      vi.mocked(Readability).mockImplementationOnce(() => ({
        parse: vi.fn(() => ({
          title: 'タイトルはある',
          content: '', // 空のコンテンツ
        })),
      }));

      const result = lifecycleManager.activate(document);

      expect(result).toBe(false);
      expect(lifecycleManager.isActive()).toBe(false);
    });
  });

  describe('コンポーネント協調', () => {
    it('DOMManager、ReactRenderer、StyleController が正しく協調する', () => {
      const container = document.createElement('div');
      container.attachShadow({ mode: 'open' });
      mockDOMManager.createShadowContainer.mockReturnValue(container);

      const result = lifecycleManager.activate(document);

      expect(result).toBe(true);

      // 正しい順序で呼び出されることを確認
      expect(mockDOMManager.hideOriginalContent).toHaveBeenCalledWith(document);
      expect(mockDOMManager.createShadowContainer).toHaveBeenCalledWith(
        document
      );
      expect(mockReactRenderer.render).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'テスト記事タイトル',
          content: '<p>テスト記事コンテンツ</p>',
        }),
        container.shadowRoot,
        styleController
      );
      expect(mockDOMManager.attachToDocument).toHaveBeenCalledWith(
        container,
        document
      );
    });
  });

  describe('エラー復旧', () => {
    it('エラー発生時に適切にクリーンアップする', () => {
      // ReactRenderer でエラーを発生させる
      mockReactRenderer.render.mockImplementation(() => {
        throw new Error('レンダリングエラー');
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = lifecycleManager.activate(document);

      expect(result).toBe(false);
      expect(lifecycleManager.isActive()).toBe(false);
      // クリーンアップが呼ばれることを確認
      expect(mockDOMManager.restoreOriginalContent).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
