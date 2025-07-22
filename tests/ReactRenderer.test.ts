import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { ReactComponentRenderer } from '@/utils/ReactRenderer';
import { ErrorHandler } from '@/utils/errors';
import ReactDOM from 'react-dom/client';
import React from 'react';

// React と ReactDOM をモック
vi.mock('react-dom/client', () => ({
  default: {
    createRoot: vi.fn(() => ({
      render: vi.fn(),
      unmount: vi.fn(),
    })),
  },
}));

vi.mock('react', () => ({
  default: {
    createElement: vi.fn(() => ({ type: 'ReaderView', props: {} })),
  },
}));

// ReaderView コンポーネントをモック
vi.mock('~/components/ReaderView', () => ({
  default: vi.fn(() => null),
}));

describe('React レンダリング機能', () => {
  let reactRenderer: ReactComponentRenderer;
  let shadowRoot: ShadowRoot;
  let article: { title: string; content: string; byline?: string };
  let onClose: () => void;

  beforeEach(() => {
    // JSDOM でテスト環境をセットアップ
    const jsdom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <div id="container"></div>
        </body>
      </html>
    `,
      {
        url: 'https://example.com', // localStorage エラーを回避
      }
    );

    const container = jsdom.window.document.getElementById('container')!;
    shadowRoot = container.attachShadow({ mode: 'open' });

    reactRenderer = new ReactComponentRenderer();
    article = {
      title: 'テスト記事タイトル',
      content: '<p>テスト記事コンテンツ</p>',
      textContent: 'テスト記事コンテンツ',
      length: 50,
      excerpt: 'テスト記事コンテンツ',
      byline: null,
      dir: null,
      siteName: null,
      lang: 'ja',
      publishedTime: null,
    };
    onClose = vi.fn();

    // モックをリセット
    vi.clearAllMocks();
  });

  describe('コンポーネントのレンダリング', () => {
    it('ReaderView コンポーネントを正常にレンダリングする', () => {
      const mockRoot = { render: vi.fn(), unmount: vi.fn() };
      vi.mocked(ReactDOM.createRoot).mockReturnValue(mockRoot);

      const result = reactRenderer.render(article, shadowRoot, onClose);

      expect(ReactDOM.createRoot).toHaveBeenCalledWith(shadowRoot);
      expect(mockRoot.render).toHaveBeenCalled();
      expect(React.createElement).toHaveBeenCalledWith(
        expect.anything(), // ReaderView コンポーネント
        expect.objectContaining({
          article,
          onClose,
        })
      );
      expect(result).toBe(mockRoot);
    });

    it('レンダリング時にエラーが発生した場合は適切にエラーを投げる', () => {
      vi.mocked(ReactDOM.createRoot).mockImplementation(() => {
        throw new Error('React createRoot が失敗しました');
      });

      expect(() => {
        reactRenderer.render(article, shadowRoot, onClose);
      }).toThrow('React コンポーネントのレンダリングに失敗しました');
    });

    it('正しいプロパティでコンポーネントをレンダリングする', () => {
      const mockRoot = { render: vi.fn(), unmount: vi.fn() };
      vi.mocked(ReactDOM.createRoot).mockReturnValue(mockRoot);

      const customArticle = {
        title: 'カスタムタイトル',
        content: '<div>カスタムコンテンツ</div>',
        textContent: 'カスタムコンテンツ',
        length: 30,
        excerpt: 'カスタムコンテンツ',
        byline: null,
        dir: null,
        siteName: null,
        lang: 'ja',
        publishedTime: null,
      };
      const customOnClose = vi.fn();

      reactRenderer.render(customArticle, shadowRoot, customOnClose);

      expect(React.createElement).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          article: customArticle,
          onClose: customOnClose,
        })
      );
    });
  });

  describe('コンポーネントのアンマウント', () => {
    it('React root を正常にアンマウントする', () => {
      const mockRoot = { render: vi.fn(), unmount: vi.fn() };

      reactRenderer.unmount(mockRoot);

      expect(mockRoot.unmount).toHaveBeenCalledOnce();
    });

    it('アンマウント時にエラーが発生してもクラッシュしない', () => {
      const mockRoot = {
        render: vi.fn(),
        unmount: vi.fn(() => {
          throw new Error('アンマウントエラー');
        }),
      };

      // ErrorHandlerのhandle メソッドをモック
      const errorHandlerSpy = vi
        .spyOn(ErrorHandler, 'handle')
        .mockImplementation(() => {});

      expect(() => {
        reactRenderer.unmount(mockRoot as unknown);
      }).not.toThrow();

      expect(errorHandlerSpy).toHaveBeenCalled();

      errorHandlerSpy.mockRestore();
    });

    it('null や undefined を渡した場合はエラーをログ出力する', () => {
      // ErrorHandlerのhandle メソッドをモック
      const errorHandlerSpy = vi
        .spyOn(ErrorHandler, 'handle')
        .mockImplementation(() => {});

      reactRenderer.unmount(null);
      expect(errorHandlerSpy).toHaveBeenCalled();

      errorHandlerSpy.mockClear();

      reactRenderer.unmount(undefined);
      expect(errorHandlerSpy).toHaveBeenCalled();

      errorHandlerSpy.mockRestore();
    });
  });

  describe('エラーハンドリング', () => {
    it('render メソッドでエラーが発生した場合は詳細な情報を含むエラーを投げる', () => {
      const originalError = new Error('内部エラー詳細');
      vi.mocked(ReactDOM.createRoot).mockImplementation(() => {
        throw originalError;
      });

      expect(() => {
        reactRenderer.render(article, shadowRoot, onClose);
      }).toThrow(
        'React コンポーネントのレンダリングに失敗しました: Error: 内部エラー詳細'
      );
    });

    it('React.createElement でエラーが発生した場合も適切に処理する', () => {
      const mockRoot = { render: vi.fn(), unmount: vi.fn() };
      vi.mocked(ReactDOM.createRoot).mockReturnValue(mockRoot);

      // render メソッドでエラーを発生させる
      mockRoot.render.mockImplementation(() => {
        throw new Error('createElement エラー');
      });

      expect(() => {
        reactRenderer.render(article, shadowRoot, onClose);
      }).toThrow('React コンポーネントのレンダリングに失敗しました');
    });
  });

  describe('統合テスト', () => {
    it('レンダリングからアンマウントまでの完全なライフサイクル', () => {
      const mockRoot = { render: vi.fn(), unmount: vi.fn() };
      vi.mocked(ReactDOM.createRoot).mockReturnValue(mockRoot);

      // 1. レンダリング
      const root = reactRenderer.render(article, shadowRoot, onClose);
      expect(root).toBe(mockRoot);
      expect(mockRoot.render).toHaveBeenCalledOnce();

      // 2. アンマウント
      reactRenderer.unmount(root);
      expect(mockRoot.unmount).toHaveBeenCalledOnce();
    });
  });
});
