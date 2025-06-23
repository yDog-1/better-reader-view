import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReaderView from '../components/ReaderView';
import { StyleController } from '../utils/StyleController';

// StyleControllerのモック
vi.mock('../utils/StyleController');

// CSS modulesのモック
vi.mock('../components/ReaderView.css', () => ({
  readerContainer: 'mocked-reader-container',
  contentContainer: 'mocked-content-container',
  title: 'mocked-title',
  contentArea: 'mocked-content-area',
  styleButton: 'mocked-style-button',
}));

// StylePanelコンポーネントのモック
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
  let mockStyleController: StyleController;
  const mockProps = {
    title: 'テスト記事のタイトル',
    content:
      '<p>これはテスト記事の内容です。</p><h2>サブタイトル</h2><p>追加の段落です。</p>',
  };

  beforeEach(() => {
    // StyleControllerのモックインスタンスを作成
    mockStyleController = {
      getThemeClass: vi.fn().mockReturnValue('light-theme-class'),
      getInlineVars: vi.fn().mockReturnValue({ '--custom-var': 'value' }),
      getConfig: vi.fn().mockReturnValue({
        theme: 'light',
        fontSize: 'medium',
        fontFamily: 'sans-serif',
      }),
      setTheme: vi.fn(),
      setFontSize: vi.fn(),
      setFontFamily: vi.fn(),
      setCustomFontSize: vi.fn(),
      updateConfig: vi.fn(),
      saveToStorage: vi.fn(),
      loadFromStorage: vi.fn(),
      reset: vi.fn(),
    } as unknown as StyleController;
  });

  describe('基本レンダリング', () => {
    it('正しくレンダリングされる', () => {
      render(
        <ReaderView {...mockProps} styleController={mockStyleController} />
      );

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
        <ReaderView {...mockProps} styleController={mockStyleController} />
      );

      expect(mockStyleController.getThemeClass).toHaveBeenCalled();
      expect(mockStyleController.getInlineVars).toHaveBeenCalled();

      // コンテナにテーマクラスが適用されている
      const readerContainer = container.firstChild as HTMLElement;
      expect(readerContainer).toHaveClass(
        'mocked-reader-container',
        'light-theme-class'
      );
      expect(readerContainer).toHaveStyle('--custom-var: value');
    });

    it('dangerouslySetInnerHTMLでコンテンツが正しく挿入される', () => {
      const { container } = render(
        <ReaderView {...mockProps} styleController={mockStyleController} />
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
      render(
        <ReaderView {...mockProps} styleController={mockStyleController} />
      );

      expect(screen.queryByTestId('style-panel')).not.toBeInTheDocument();
    });

    it('スタイルボタンクリックでStylePanelが表示される', () => {
      render(
        <ReaderView {...mockProps} styleController={mockStyleController} />
      );

      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);

      expect(screen.getByTestId('style-panel')).toBeInTheDocument();
    });

    it('StylePanelが表示中にスタイルボタンを再クリックすると非表示になる', () => {
      render(
        <ReaderView {...mockProps} styleController={mockStyleController} />
      );

      const styleButton = screen.getByRole('button', { name: 'スタイル' });

      // 表示
      fireEvent.click(styleButton);
      expect(screen.getByTestId('style-panel')).toBeInTheDocument();

      // 非表示
      fireEvent.click(styleButton);
      expect(screen.queryByTestId('style-panel')).not.toBeInTheDocument();
    });

    it('StylePanelのCloseボタンで非表示になる', () => {
      render(
        <ReaderView {...mockProps} styleController={mockStyleController} />
      );

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
      // 再レンダリングを検出するために、getThemeClassの戻り値を変更
      let callCount = 0;
      mockStyleController.getThemeClass = vi.fn(() => {
        callCount++;
        return callCount === 1 ? 'light-theme-class' : 'dark-theme-class';
      });

      render(
        <ReaderView {...mockProps} styleController={mockStyleController} />
      );

      // StylePanelを表示
      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);

      // スタイル変更ボタンをクリック
      const changeStyleButton = screen.getByRole('button', {
        name: 'Change Style',
      });
      fireEvent.click(changeStyleButton);

      // StyleControllerのメソッドが再度呼ばれることを確認
      expect(mockStyleController.getThemeClass).toHaveBeenCalledTimes(2);
      expect(mockStyleController.getInlineVars).toHaveBeenCalledTimes(2);
    });
  });

  describe('プロパティの検証', () => {
    it('空のタイトルでも正常に動作する', () => {
      render(
        <ReaderView
          title=""
          content={mockProps.content}
          styleController={mockStyleController}
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
          styleController={mockStyleController}
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
          styleController={mockStyleController}
        />
      );

      expect(screen.getByText('Bold text')).toBeInTheDocument();
      expect(screen.getByText('italic text')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なセマンティック要素が使用されている', () => {
      render(
        <ReaderView {...mockProps} styleController={mockStyleController} />
      );

      // h1要素が存在する
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      // ボタン要素が存在する
      expect(
        screen.getByRole('button', { name: 'スタイル' })
      ).toBeInTheDocument();
    });

    it('ボタンがキーボードでアクセス可能', () => {
      render(
        <ReaderView {...mockProps} styleController={mockStyleController} />
      );

      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      expect(styleButton).toHaveAttribute('tabIndex', '0');
    });
  });
});
