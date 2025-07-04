import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { fakeBrowser } from 'wxt/testing';
import ReaderView from '../components/ReaderView';
import { StyleController } from '../utils/StyleController';

// StylePanelコンポーネントのモック（UI相互作用のテストのため最小限のモック）
vi.mock('../components/StylePanel', () => ({
  default: ({
    onClose,
    onStyleChange,
  }: {
    onClose: () => void;
    onStyleChange: () => void;
  }) => (
    <div data-testid="style-panel">
      <button onClick={onClose}>Close</button>
      <button onClick={onStyleChange}>Change Style</button>
    </div>
  ),
}));

describe('ReaderView', () => {
  let styleController: StyleController;
  const mockProps = {
    title: 'テスト記事のタイトル',
    content:
      '<p>これはテスト記事の内容です。</p><h2>サブタイトル</h2><p>追加の段落です。</p>',
  };

  beforeEach(() => {
    fakeBrowser.reset();
    // 実際のStyleControllerインスタンスを使用
    styleController = new StyleController();
  });

  describe('基本レンダリング', () => {
    it('正しくレンダリングされる', () => {
      render(<ReaderView {...mockProps} styleController={styleController} />);

      // タイトルが表示されている
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        mockProps.title
      );

      // スタイルボタンが表示されている
      expect(
        screen.getByRole('button', { name: 'スタイル' })
      ).toBeInTheDocument();

      // コンテンツが表示されている（dangerouslySetInnerHTMLで挿入されているため、特定の要素をチェック）
      expect(
        screen.getByText('これはテスト記事の内容です。')
      ).toBeInTheDocument();
      expect(screen.getByText('サブタイトル')).toBeInTheDocument();
    });

    it('StyleControllerから適切なクラスとスタイルを取得する', () => {
      const { container } = render(
        <ReaderView {...mockProps} styleController={styleController} />
      );

      // コンテナにテーマクラスが適用されている
      const readerContainer = container.firstChild as HTMLElement;
      expect(readerContainer).toHaveClass(styleController.getThemeClass());

      // インラインスタイルが適用されている
      const inlineVars = styleController.getInlineVars();
      Object.entries(inlineVars).forEach(([property, value]) => {
        expect(readerContainer).toHaveStyle(`${property}: ${value}`);
      });
    });

    it('dangerouslySetInnerHTMLでコンテンツが正しく挿入される', () => {
      const { container } = render(
        <ReaderView {...mockProps} styleController={styleController} />
      );

      // HTMLが正しく挿入されていることを確認
      const contentArea = container.querySelector('.mocked-content-area');
      expect(contentArea).toBeInTheDocument();
      expect(contentArea?.innerHTML).toContain(
        '<p>これはテスト記事の内容です。</p>'
      );
      expect(contentArea?.innerHTML).toContain('<h2>サブタイトル</h2>');
    });
  });

  describe('StylePanelの表示/非表示', () => {
    it('初期状態ではStylePanelが非表示', () => {
      render(<ReaderView {...mockProps} styleController={styleController} />);

      expect(screen.queryByTestId('style-panel')).not.toBeInTheDocument();
    });

    it('スタイルボタンクリックでStylePanelが表示される', () => {
      render(<ReaderView {...mockProps} styleController={styleController} />);

      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);

      expect(screen.getByTestId('style-panel')).toBeInTheDocument();
    });

    it('StylePanelが表示中にスタイルボタンを再クリックすると非表示になる', () => {
      render(<ReaderView {...mockProps} styleController={styleController} />);

      const styleButton = screen.getByRole('button', { name: 'スタイル' });

      // 表示
      fireEvent.click(styleButton);
      expect(screen.getByTestId('style-panel')).toBeInTheDocument();

      // 非表示
      fireEvent.click(styleButton);
      expect(screen.queryByTestId('style-panel')).not.toBeInTheDocument();
    });

    it('StylePanelのCloseボタンで非表示になる', () => {
      render(<ReaderView {...mockProps} styleController={styleController} />);

      // StylePanelを表示
      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);
      expect(screen.getByTestId('style-panel')).toBeInTheDocument();

      // Closeボタンをクリック
      const closeButton = screen.getByRole('button', { name: 'Close' });
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('style-panel')).not.toBeInTheDocument();
    });
  });

  describe('スタイル変更の処理', () => {
    it('StylePanelからのスタイル変更でコンポーネントが再レンダリングされる', () => {
      const { container } = render(
        <ReaderView {...mockProps} styleController={styleController} />
      );

      const initialThemeClass = styleController.getThemeClass();
      const readerContainer = container.firstChild as HTMLElement;
      expect(readerContainer).toHaveClass(initialThemeClass);

      // StylePanelを表示
      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);

      // スタイル変更ボタンをクリック（実際のStyleControllerの状態は変わらないが、再レンダリングをトリガー）
      const changeStyleButton = screen.getByRole('button', {
        name: 'Change Style',
      });
      fireEvent.click(changeStyleButton);

      // 再レンダリング後も同じテーマクラスが適用されている
      expect(readerContainer).toHaveClass(styleController.getThemeClass());
    });
  });

  describe('プロパティの検証', () => {
    it('空のタイトルでも正常に動作する', () => {
      render(
        <ReaderView
          title=""
          content={mockProps.content}
          styleController={styleController}
        />
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('');
    });

    it('空のコンテンツでも正常に動作する', () => {
      render(
        <ReaderView
          title={mockProps.title}
          content=""
          styleController={styleController}
        />
      );

      const contentArea = document.querySelector('.mocked-content-area');
      expect(contentArea?.innerHTML).toBe('');
    });

    it('HTMLタグを含むコンテンツが正しく処理される', () => {
      const htmlContent =
        '<div><strong>Bold text</strong> and <em>italic text</em></div>';

      render(
        <ReaderView
          title={mockProps.title}
          content={htmlContent}
          styleController={styleController}
        />
      );

      expect(screen.getByText('Bold text')).toBeInTheDocument();
      expect(screen.getByText('italic text')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なセマンティック要素が使用されている', () => {
      render(<ReaderView {...mockProps} styleController={styleController} />);

      // h1要素が存在する
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      // ボタン要素が存在する
      expect(
        screen.getByRole('button', { name: 'スタイル' })
      ).toBeInTheDocument();
    });

    it('ボタンがキーボードでアクセス可能', () => {
      render(<ReaderView {...mockProps} styleController={styleController} />);

      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      // ボタンは通常デフォルトでキーボードアクセス可能
      expect(styleButton).toBeInTheDocument();
      expect(styleButton.tagName).toBe('BUTTON');
    });
  });
});
