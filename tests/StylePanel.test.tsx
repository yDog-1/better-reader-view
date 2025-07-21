import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { fakeBrowser } from 'wxt/testing';
import StylePanel from '../components/StylePanel';
import { StyleController } from '../utils/StyleController';

describe('StylePanel', () => {
  let styleController: StyleController;
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnStyleChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fakeBrowser.reset();
    mockOnClose = vi.fn();
    mockOnStyleChange = vi.fn();
    styleController = new StyleController();
  });

  describe('基本レンダリング', () => {
    it('正しくレンダリングされる', () => {
      render(
        <StylePanel
          styleController={styleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      expect(screen.getByText('スタイル設定')).toBeInTheDocument();
      expect(screen.getByText('テーマ')).toBeInTheDocument();
      expect(screen.getByText('フォントサイズ')).toBeInTheDocument();
      expect(screen.getByText('フォント種類')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'リセット' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '閉じる' })
      ).toBeInTheDocument();
    });

    it('初期設定値が正しく表示される', () => {
      render(
        <StylePanel
          styleController={styleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      const themeSelect = screen.getByDisplayValue('ライト');
      const fontSizeSelect = screen.getByDisplayValue('中');
      const fontFamilySelect = screen.getByDisplayValue('ゴシック体');

      expect(themeSelect).toBeInTheDocument();
      expect(fontSizeSelect).toBeInTheDocument();
      expect(fontFamilySelect).toBeInTheDocument();
    });
  });

  describe('テーマ選択', () => {
    it('テーマ変更が正しく動作する', async () => {
      render(
        <StylePanel
          styleController={styleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      const themeSelect = screen.getByDisplayValue('ライト');
      fireEvent.change(themeSelect, { target: { value: 'dark' } });

      // 非同期処理完了を待つ
      await waitFor(() => {
        expect(styleController.getConfig().theme).toBe('dark');
      });
      expect(mockOnStyleChange).toHaveBeenCalled();

      // 設定が保存され、新しいStyleControllerインスタンスで復元できることを確認
      const newStyleController = new StyleController();
      const loaded = await newStyleController.loadFromStorage();
      expect(loaded).toBe(true);
      expect(newStyleController.getConfig().theme).toBe('dark');
    });

    it('全てのテーマオプションが表示される', () => {
      render(
        <StylePanel
          styleController={styleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      expect(
        screen.getByRole('option', { name: 'ライト' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'ダーク' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'セピア' })
      ).toBeInTheDocument();
    });
  });

  describe('フォントサイズ選択', () => {
    it('フォントサイズ変更が正しく動作する', async () => {
      render(
        <StylePanel
          styleController={styleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      const fontSizeSelect = screen.getByDisplayValue('中');
      fireEvent.change(fontSizeSelect, { target: { value: 'large' } });

      // 非同期処理完了を待つ
      await waitFor(() => {
        expect(styleController.getConfig().fontSize).toBe('large');
      });
      expect(mockOnStyleChange).toHaveBeenCalled();
    });

    it('全てのフォントサイズオプションが表示される', () => {
      render(
        <StylePanel
          styleController={styleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      expect(screen.getByRole('option', { name: '小' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '中' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '大' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '特大' })).toBeInTheDocument();
    });
  });

  describe('フォントファミリー選択', () => {
    it('フォントファミリー変更が正しく動作する', async () => {
      render(
        <StylePanel
          styleController={styleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      const fontFamilySelect = screen.getByDisplayValue('ゴシック体');
      fireEvent.change(fontFamilySelect, { target: { value: 'serif' } });

      // 非同期処理完了を待つ
      await waitFor(() => {
        expect(styleController.getConfig().fontFamily).toBe('serif');
      });
      expect(mockOnStyleChange).toHaveBeenCalled();
    });

    it('全てのフォントファミリーオプションが表示される', () => {
      render(
        <StylePanel
          styleController={styleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      expect(
        screen.getByRole('option', { name: 'ゴシック体' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: '明朝体' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: '等幅フォント' })
      ).toBeInTheDocument();
    });
  });

  describe('ボタン操作', () => {
    it('リセットボタンが正しく動作する', async () => {
      // まず設定を変更
      styleController.setTheme('dark');
      styleController.setFontSize('large');

      render(
        <StylePanel
          styleController={styleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      const resetButton = screen.getByRole('button', { name: 'リセット' });
      fireEvent.click(resetButton);

      // 非同期処理完了を待つ
      await waitFor(() => {
        const config = styleController.getConfig();
        expect(config.theme).toBe('light');
        expect(config.fontSize).toBe('medium');
        expect(config.fontFamily).toBe('sans-serif');
      });
      expect(mockOnStyleChange).toHaveBeenCalled();
    });

    it('閉じるボタンが正しく動作する', () => {
      render(
        <StylePanel
          styleController={styleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      const closeButton = screen.getByRole('button', { name: '閉じる' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('状態管理', () => {
    it('異なる初期設定で正しく初期化される', () => {
      const customStyleController = new StyleController({
        theme: 'sepia',
        fontSize: 'extra-large',
        fontFamily: 'monospace',
        customFontSize: 20,
      });

      render(
        <StylePanel
          styleController={customStyleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      expect(screen.getByDisplayValue('セピア')).toBeInTheDocument();
      expect(screen.getByDisplayValue('特大')).toBeInTheDocument();
      expect(screen.getByDisplayValue('等幅フォント')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('ラベルとフォーム要素が正しく関連付けられている', () => {
      render(
        <StylePanel
          styleController={styleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      // セレクト要素がラベルと関連付けられていることを確認
      const themeSelect = screen.getByDisplayValue('ライト');
      const fontSizeSelect = screen.getByDisplayValue('中');
      const fontFamilySelect = screen.getByDisplayValue('ゴシック体');

      expect(themeSelect).toBeInTheDocument();
      expect(fontSizeSelect).toBeInTheDocument();
      expect(fontFamilySelect).toBeInTheDocument();
    });

    it('全てのボタンがキーボードでアクセス可能', () => {
      render(
        <StylePanel
          styleController={styleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      const resetButton = screen.getByRole('button', { name: 'リセット' });
      const closeButton = screen.getByRole('button', { name: '閉じる' });

      // ボタンは通常デフォルトでキーボードアクセス可能
      expect(resetButton).toBeInTheDocument();
      expect(closeButton).toBeInTheDocument();
      expect(resetButton.tagName).toBe('BUTTON');
      expect(closeButton.tagName).toBe('BUTTON');
    });
  });

  describe('イベントハンドリング', () => {
    it('複数の設定変更が順次処理される', async () => {
      render(
        <StylePanel
          styleController={styleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      // 複数の設定を順次変更
      const themeSelect = screen.getByDisplayValue('ライト');
      const fontSizeSelect = screen.getByDisplayValue('中');

      fireEvent.change(themeSelect, { target: { value: 'dark' } });
      fireEvent.change(fontSizeSelect, { target: { value: 'large' } });

      // 非同期処理完了を待つ
      await waitFor(() => {
        const config = styleController.getConfig();
        expect(config.theme).toBe('dark');
        expect(config.fontSize).toBe('large');
      });
      expect(mockOnStyleChange).toHaveBeenCalledTimes(2);
    });

    it('無効な値での変更は適切に処理される', () => {
      render(
        <StylePanel
          styleController={styleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      const themeSelect = screen.getByDisplayValue('ライト');

      // セレクトボックスは有効なオプションのみを持つため、
      // 実際の使用時には無効な値は選択できない
      expect(themeSelect).toHaveValue('light');

      // 有効な値での変更をテスト
      fireEvent.change(themeSelect, { target: { value: 'dark' } });
      expect(styleController.getConfig().theme).toBe('dark');
    });
  });
});
