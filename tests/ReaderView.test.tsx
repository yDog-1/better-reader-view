import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { fakeBrowser } from 'wxt/testing';
import ReaderView from '../components/ReaderView';
import { StyleController } from '../utils/StyleController';

describe('ReaderView', () => {
  let styleController: StyleController;
  let mockShadowRoot: ShadowRoot;
  const mockProps = {
    title: 'テスト記事のタイトル',
    content:
      '<p>これはテスト記事の内容です。</p><h2>サブタイトル</h2><p>追加の段落です。</p>',
  };

  beforeEach(() => {
    fakeBrowser.reset();
    // 実際のStyleControllerインスタンスを使用
    styleController = new StyleController();

    // Mock Shadow DOM
    const mockContainer = document.createElement('div');
    mockShadowRoot = mockContainer.attachShadow({ mode: 'open' });
  });

  describe('基本レンダリング', () => {
    it('正しくレンダリングされる', () => {
      render(
        <ReaderView
          {...mockProps}
          styleController={styleController}
          shadowRoot={mockShadowRoot}
        />
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

    it('StyleControllerから適切なスタイルが適用される', () => {
      const { container } = render(
        <ReaderView
          {...mockProps}
          styleController={styleController}
          shadowRoot={mockShadowRoot}
        />
      );

      // コンテナが正常にレンダリングされ、基本的なスタイルが適用されている
      const readerContainer = container.firstChild as HTMLElement;
      expect(readerContainer).toBeInTheDocument();
      expect(readerContainer).toHaveClass('reader-container');

      // コンテンツが読みやすく表示されている（見た目の確認）
      expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
      expect(screen.getByText('これはテスト記事の内容です。')).toBeVisible();
    });

    it('dangerouslySetInnerHTMLでコンテンツが正しく挿入される', () => {
      render(
        <ReaderView
          {...mockProps}
          styleController={styleController}
          shadowRoot={mockShadowRoot}
        />
      );

      // HTMLが正しく挿入されていることを確認（実際のコンテンツで確認）
      expect(
        screen.getByText('これはテスト記事の内容です。')
      ).toBeInTheDocument();
      expect(screen.getByText('サブタイトル')).toBeInTheDocument();
      expect(screen.getByText('追加の段落です。')).toBeInTheDocument();
    });
  });

  describe('StylePanelの表示/非表示', () => {
    it('初期状態ではStylePanelが非表示', () => {
      render(
        <ReaderView
          {...mockProps}
          styleController={styleController}
          shadowRoot={mockShadowRoot}
        />
      );

      // 実際のStylePanelは初期状態では非表示なので、「スタイル設定」テキストが見えない
      expect(screen.queryByText('スタイル設定')).not.toBeInTheDocument();
    });

    it('スタイルボタンクリックでStylePanelが表示される', () => {
      render(
        <ReaderView
          {...mockProps}
          styleController={styleController}
          shadowRoot={mockShadowRoot}
        />
      );

      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);

      // 実際のStylePanelが表示されることを確認
      expect(screen.getByText('スタイル設定')).toBeInTheDocument();
      expect(screen.getByText('テーマ')).toBeInTheDocument();
      expect(screen.getByText('フォントサイズ')).toBeInTheDocument();
    });

    it('StylePanelが表示中にスタイルボタンを再クリックすると非表示になる', () => {
      render(
        <ReaderView
          {...mockProps}
          styleController={styleController}
          shadowRoot={mockShadowRoot}
        />
      );

      const styleButton = screen.getByRole('button', { name: 'スタイル' });

      // 表示
      fireEvent.click(styleButton);
      expect(screen.getByText('スタイル設定')).toBeInTheDocument();

      // 非表示
      fireEvent.click(styleButton);
      expect(screen.queryByText('スタイル設定')).not.toBeInTheDocument();
    });

    it('StylePanelのCloseボタンで非表示になる', () => {
      render(
        <ReaderView
          {...mockProps}
          styleController={styleController}
          shadowRoot={mockShadowRoot}
        />
      );

      // StylePanelを表示
      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);
      expect(screen.getByText('スタイル設定')).toBeInTheDocument();

      // 閉じるボタンをクリック
      const closeButton = screen.getByRole('button', { name: '閉じる' });
      fireEvent.click(closeButton);

      expect(screen.queryByText('スタイル設定')).not.toBeInTheDocument();
    });
  });

  describe('スタイル変更の処理', () => {
    it('StylePanelからのテーマ変更でコンポーネントが再レンダリングされる', () => {
      render(
        <ReaderView
          {...mockProps}
          styleController={styleController}
          shadowRoot={mockShadowRoot}
        />
      );

      // StylePanelを表示
      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);

      // 初期状態でライトテーマが選択されていることを確認
      expect(screen.getByDisplayValue('ライト')).toBeInTheDocument();

      // テーマを変更（ライトからダークへ）
      const themeSelect = screen.getByDisplayValue('ライト');
      fireEvent.change(themeSelect, { target: { value: 'dark' } });

      // 変更後にダークテーマが選択されていることを確認（見た目の変化）
      expect(screen.getByDisplayValue('ダーク')).toBeInTheDocument();

      // StyleControllerの状態が実際に変更されたことを確認
      expect(styleController.getConfig().theme).toBe('dark');
    });
  });

  describe('プロパティの検証', () => {
    it('空のタイトルでも正常に動作する', () => {
      render(
        <ReaderView
          title=""
          content={mockProps.content}
          styleController={styleController}
          shadowRoot={mockShadowRoot}
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
          shadowRoot={mockShadowRoot}
        />
      );

      // タイトルは表示されるが、コンテンツテキストは存在しない
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        mockProps.title
      );
      expect(
        screen.queryByText('これはテスト記事の内容です。')
      ).not.toBeInTheDocument();
    });

    it('HTMLタグを含むコンテンツが正しく処理される', () => {
      const htmlContent =
        '<div><strong>Bold text</strong> and <em>italic text</em></div>';

      render(
        <ReaderView
          title={mockProps.title}
          content={htmlContent}
          styleController={styleController}
          shadowRoot={mockShadowRoot}
        />
      );

      expect(screen.getByText('Bold text')).toBeInTheDocument();
      expect(screen.getByText('italic text')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なセマンティック要素が使用されている', () => {
      render(
        <ReaderView
          {...mockProps}
          styleController={styleController}
          shadowRoot={mockShadowRoot}
        />
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
        <ReaderView
          {...mockProps}
          styleController={styleController}
          shadowRoot={mockShadowRoot}
        />
      );

      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      // ボタンは通常デフォルトでキーボードアクセス可能
      expect(styleButton).toBeInTheDocument();
      expect(styleButton.tagName).toBe('BUTTON');
    });
  });
});
