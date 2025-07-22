import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { fakeBrowser } from 'wxt/testing';
import ReaderView from '../components/ReaderView';

describe('ReaderView', () => {
  let mockOnClose: () => void;
  const mockArticle = {
    title: 'テスト記事のタイトル',
    content:
      '<p>これはテスト記事の内容です。</p><h2>サブタイトル</h2><p>追加の段落です。</p>',
    textContent: 'これはテスト記事の内容です。サブタイトル追加の段落です。',
    length: 100,
    excerpt: 'これはテスト記事の内容です。',
    byline: 'テスト著者',
    dir: null,
    siteName: null,
    lang: 'ja',
    publishedTime: null,
  };

  beforeEach(() => {
    fakeBrowser.reset();
    mockOnClose = vi.fn();
  });

  describe('基本レンダリング', () => {
    it('正しくレンダリングされる', () => {
      render(<ReaderView article={mockArticle} onClose={mockOnClose} />);

      // タイトルが表示されている
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        mockArticle.title
      );

      // 閉じるボタンが表示されている
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();

      // 著者が表示されている
      expect(screen.getByText(mockArticle.byline)).toBeInTheDocument();

      // コンテンツが表示されている（dangerouslySetInnerHTMLで挿入されているため、特定の要素をチェック）
      expect(
        screen.getByText('これはテスト記事の内容です。')
      ).toBeInTheDocument();
      expect(screen.getByText('サブタイトル')).toBeInTheDocument();
    });

    it('閉じるボタンが正しく動作する', () => {
      render(<ReaderView article={mockArticle} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: '×' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('dangerouslySetInnerHTMLでコンテンツが正しく挿入される', () => {
      render(<ReaderView article={mockArticle} onClose={mockOnClose} />);

      // HTMLが正しく挿入されていることを確認（実際のコンテンツで確認）
      expect(
        screen.getByText('これはテスト記事の内容です。')
      ).toBeInTheDocument();
      expect(screen.getByText('サブタイトル')).toBeInTheDocument();
      expect(screen.getByText('追加の段落です。')).toBeInTheDocument();
    });
  });

  describe('プロパティの検証', () => {
    it('空のタイトルでも正常に動作する', () => {
      const articleWithEmptyTitle = { ...mockArticle, title: '' };

      render(
        <ReaderView article={articleWithEmptyTitle} onClose={mockOnClose} />
      );

      // 空のタイトルでもエラーにならない
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('');
    });

    it('空のコンテンツでも正常に動作する', () => {
      const articleWithEmptyContent = { ...mockArticle, content: '' };

      render(
        <ReaderView article={articleWithEmptyContent} onClose={mockOnClose} />
      );

      // 空のコンテンツでもエラーにならない
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        mockArticle.title
      );
    });

    it('bylineがない場合は表示されない', () => {
      const articleWithoutByline = { ...mockArticle, byline: undefined };

      render(
        <ReaderView article={articleWithoutByline} onClose={mockOnClose} />
      );

      // byline要素が存在しない
      expect(screen.queryByText('テスト著者')).not.toBeInTheDocument();
    });

    it('HTMLタグを含むコンテンツが正しく処理される', () => {
      const articleWithComplexHTML = {
        ...mockArticle,
        content:
          '<ul><li>リスト項目1</li><li>リスト項目2</li></ul><blockquote>引用文</blockquote>',
      };

      render(
        <ReaderView article={articleWithComplexHTML} onClose={mockOnClose} />
      );

      // HTMLタグが正しく解釈されている
      expect(screen.getByText('リスト項目1')).toBeInTheDocument();
      expect(screen.getByText('リスト項目2')).toBeInTheDocument();
      expect(screen.getByText('引用文')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なセマンティック要素が使用されている', () => {
      render(<ReaderView article={mockArticle} onClose={mockOnClose} />);

      // h1要素でタイトルが表示されている
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      // ボタンが適切にマークアップされている
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('ボタンがキーボードでアクセス可能', () => {
      render(<ReaderView article={mockArticle} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: '×' });

      // ボタンがフォーカス可能
      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);
    });
  });
});
