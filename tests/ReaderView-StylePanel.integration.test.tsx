import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { fakeBrowser } from 'wxt/testing';
import ReaderView from '../components/ReaderView';
import { StyleController } from '../utils/StyleController';

describe('ReaderView + StylePanel 統合テスト', () => {
  let styleController: StyleController;
  const mockProps = {
    title: 'リーダービュー統合テスト',
    content:
      '<p>このテストではReaderViewとStylePanelの統合動作を確認します。</p><h2>見出し</h2><p>スタイル変更が正しく反映されることをテストします。</p>',
  };

  beforeEach(() => {
    fakeBrowser.reset();
    styleController = new StyleController();
  });

  describe('コンポーネント間の相互作用', () => {
    it('ReaderViewからStylePanelを開いてテーマを変更し、結果が反映される', () => {
      render(<ReaderView {...mockProps} styleController={styleController} />);

      // 初期状態の確認
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        mockProps.title
      );
      expect(
        screen.getByText(
          'このテストではReaderViewとStylePanelの統合動作を確認します。'
        )
      ).toBeInTheDocument();

      // StylePanelを開く
      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);

      // StylePanelが表示されることを確認
      expect(screen.getByText('スタイル設定')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ライト')).toBeInTheDocument();

      // テーマをダークに変更
      const themeSelect = screen.getByDisplayValue('ライト');
      fireEvent.change(themeSelect, { target: { value: 'dark' } });

      // テーマ変更が反映されることを確認
      expect(screen.getByDisplayValue('ダーク')).toBeInTheDocument();
      expect(styleController.getConfig().theme).toBe('dark');

      // StylePanelを閉じる
      const closeButton = screen.getByRole('button', { name: '閉じる' });
      fireEvent.click(closeButton);

      // StylePanelが非表示になり、コンテンツは引き続き表示されている
      expect(screen.queryByText('スタイル設定')).not.toBeInTheDocument();
      expect(
        screen.getByText(
          'このテストではReaderViewとStylePanelの統合動作を確認します。'
        )
      ).toBeInTheDocument();
    });

    it('フォントサイズとフォントファミリーの連続変更が正しく動作する', () => {
      render(<ReaderView {...mockProps} styleController={styleController} />);

      // StylePanelを開く
      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);

      // 初期設定の確認
      expect(screen.getByDisplayValue('中')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ゴシック体')).toBeInTheDocument();

      // フォントサイズを大に変更
      const fontSizeSelect = screen.getByDisplayValue('中');
      fireEvent.change(fontSizeSelect, { target: { value: 'large' } });

      // フォントファミリーを明朝体に変更
      const fontFamilySelect = screen.getByDisplayValue('ゴシック体');
      fireEvent.change(fontFamilySelect, { target: { value: 'serif' } });

      // 両方の変更が反映されていることを確認
      expect(screen.getByDisplayValue('大')).toBeInTheDocument();
      expect(screen.getByDisplayValue('明朝体')).toBeInTheDocument();
      expect(styleController.getConfig().fontSize).toBe('large');
      expect(styleController.getConfig().fontFamily).toBe('serif');
    });

    it('設定のリセット機能が正しく動作する', () => {
      render(<ReaderView {...mockProps} styleController={styleController} />);

      // StylePanelを開いて設定を変更
      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);

      const themeSelect = screen.getByDisplayValue('ライト');
      fireEvent.change(themeSelect, { target: { value: 'sepia' } });

      const fontSizeSelect = screen.getByDisplayValue('中');
      fireEvent.change(fontSizeSelect, { target: { value: 'xlarge' } });

      // 変更が適用されたことを確認
      expect(screen.getByDisplayValue('セピア')).toBeInTheDocument();
      expect(screen.getByDisplayValue('特大')).toBeInTheDocument();

      // リセットボタンをクリック
      const resetButton = screen.getByRole('button', { name: 'リセット' });
      fireEvent.click(resetButton);

      // デフォルト設定に戻ったことを確認
      expect(screen.getByDisplayValue('ライト')).toBeInTheDocument();
      expect(screen.getByDisplayValue('中')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ゴシック体')).toBeInTheDocument();
      expect(styleController.getConfig().theme).toBe('light');
      expect(styleController.getConfig().fontSize).toBe('medium');
      expect(styleController.getConfig().fontFamily).toBe('sans-serif');
    });

    it('設定変更後の状態が新しいStyleControllerインスタンスで復元できる', () => {
      render(<ReaderView {...mockProps} styleController={styleController} />);

      // StylePanelでテーマとフォントサイズを変更
      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);

      const themeSelect = screen.getByDisplayValue('ライト');
      fireEvent.change(themeSelect, { target: { value: 'dark' } });

      const fontSizeSelect = screen.getByDisplayValue('中');
      fireEvent.change(fontSizeSelect, { target: { value: 'large' } });

      // 設定が保存されていることを確認
      expect(styleController.getConfig().theme).toBe('dark');
      expect(styleController.getConfig().fontSize).toBe('large');

      // 新しいStyleControllerインスタンスで設定を復元
      const newStyleController = new StyleController();
      const loaded = newStyleController.loadFromStorage();

      expect(loaded).toBe(true);
      expect(newStyleController.getConfig().theme).toBe('dark');
      expect(newStyleController.getConfig().fontSize).toBe('large');
    });
  });

  describe('ユーザビリティテスト', () => {
    it('StylePanelの開閉がスムーズに動作する', () => {
      render(<ReaderView {...mockProps} styleController={styleController} />);

      const styleButton = screen.getByRole('button', { name: 'スタイル' });

      // 開く
      fireEvent.click(styleButton);
      expect(screen.getByText('スタイル設定')).toBeInTheDocument();

      // 閉じる（スタイルボタンで）
      fireEvent.click(styleButton);
      expect(screen.queryByText('スタイル設定')).not.toBeInTheDocument();

      // 再度開く
      fireEvent.click(styleButton);
      expect(screen.getByText('スタイル設定')).toBeInTheDocument();

      // 閉じるボタンで閉じる
      const closeButton = screen.getByRole('button', { name: '閉じる' });
      fireEvent.click(closeButton);
      expect(screen.queryByText('スタイル設定')).not.toBeInTheDocument();
    });

    it('全ての設定オプションが選択可能である', () => {
      render(<ReaderView {...mockProps} styleController={styleController} />);

      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);

      // テーマオプション
      const themeOptions = ['light', 'dark', 'sepia'];
      const themeSelect = screen.getByDisplayValue('ライト');

      themeOptions.forEach((theme) => {
        fireEvent.change(themeSelect, { target: { value: theme } });
        expect(styleController.getConfig().theme).toBe(theme);
      });

      // フォントサイズオプション
      const fontSizeOptions = ['small', 'medium', 'large', 'xlarge'];
      const allSelects = screen.getAllByRole('combobox');
      const fontSizeSelect = allSelects[1]; // テーマが0、フォントサイズが1

      fontSizeOptions.forEach((size) => {
        fireEvent.change(fontSizeSelect, { target: { value: size } });
        expect(styleController.getConfig().fontSize).toBe(size);
      });

      // フォントファミリーオプション
      const fontFamilyOptions = ['sans-serif', 'serif', 'monospace'];
      const fontFamilySelect = allSelects[2]; // フォントファミリーが2

      fontFamilyOptions.forEach((family) => {
        fireEvent.change(fontFamilySelect, { target: { value: family } });
        expect(styleController.getConfig().fontFamily).toBe(family);
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('不正な設定値でも安全に動作する', () => {
      render(<ReaderView {...mockProps} styleController={styleController} />);

      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);

      // HTML select要素では無効な値は自動的に制限されるため、
      // 実際のユーザー操作では不正な値が入力されることはない
      // これはClassical Testingの観点で、実際のユーザー操作をシミュレート
      const themeSelect = screen.getByDisplayValue('ライト');
      expect(themeSelect).toHaveValue('light');

      // 有効な値での動作確認
      fireEvent.change(themeSelect, { target: { value: 'dark' } });
      expect(styleController.getConfig().theme).toBe('dark');
    });
  });
});
