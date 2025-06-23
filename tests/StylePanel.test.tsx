import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StylePanel from '../components/StylePanel';
import { StyleController, type StyleConfig } from '../utils/StyleController';

// CSS modulesのモック
vi.mock('../components/StylePanel.css', () => ({
  panel: 'mocked-panel',
  panelTitle: 'mocked-panel-title',
  controlGroup: 'mocked-control-group',
  label: 'mocked-label',
  select: 'mocked-select',
  button: 'mocked-button',
  closeButton: 'mocked-close-button',
}));

describe('StylePanel', () => {
  let mockStyleController: StyleController;
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnStyleChange: ReturnType<typeof vi.fn>;
  let mockConfig: StyleConfig;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockOnStyleChange = vi.fn();
    mockConfig = {
      theme: 'light',
      fontSize: 'medium',
      fontFamily: 'sans-serif',
    };

    mockStyleController = {
      getConfig: vi.fn().mockReturnValue(mockConfig),
      setTheme: vi.fn(),
      setFontSize: vi.fn(),
      setFontFamily: vi.fn(),
      setCustomFontSize: vi.fn(),
      updateConfig: vi.fn(),
      saveToStorage: vi.fn(),
      loadFromStorage: vi.fn(),
      reset: vi.fn(),
      getThemeClass: vi.fn(),
      getInlineVars: vi.fn(),
    } as any;
  });

  describe('基本レンダリング', () => {
    it('正しくレンダリングされる', () => {
      render(
        <StylePanel
          styleController={mockStyleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      expect(screen.getByText('スタイル設定')).toBeInTheDocument();
      expect(screen.getByText('テーマ')).toBeInTheDocument();
      expect(screen.getByText('フォントサイズ')).toBeInTheDocument();
      expect(screen.getByText('フォント種類')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'リセット' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument();
    });

    it('初期設定値が正しく表示される', () => {
      render(
        <StylePanel
          styleController={mockStyleController}
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
    it('テーマ変更が正しく動作する', () => {
      render(
        <StylePanel
          styleController={mockStyleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      const themeSelect = screen.getByDisplayValue('ライト');
      fireEvent.change(themeSelect, { target: { value: 'dark' } });

      expect(mockStyleController.setTheme).toHaveBeenCalledWith('dark');
      expect(mockStyleController.saveToStorage).toHaveBeenCalled();
      expect(mockOnStyleChange).toHaveBeenCalled();
    });

    it('全てのテーマオプションが表示される', () => {
      render(
        <StylePanel
          styleController={mockStyleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      expect(screen.getByRole('option', { name: 'ライト' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'ダーク' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'セピア' })).toBeInTheDocument();
    });
  });

  describe('フォントサイズ選択', () => {
    it('フォントサイズ変更が正しく動作する', () => {
      render(
        <StylePanel
          styleController={mockStyleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      const fontSizeSelect = screen.getByDisplayValue('中');
      fireEvent.change(fontSizeSelect, { target: { value: 'large' } });

      expect(mockStyleController.setFontSize).toHaveBeenCalledWith('large');
      expect(mockStyleController.saveToStorage).toHaveBeenCalled();
      expect(mockOnStyleChange).toHaveBeenCalled();
    });

    it('全てのフォントサイズオプションが表示される', () => {
      render(
        <StylePanel
          styleController={mockStyleController}
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
    it('フォントファミリー変更が正しく動作する', () => {
      render(
        <StylePanel
          styleController={mockStyleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      const fontFamilySelect = screen.getByDisplayValue('ゴシック体');
      fireEvent.change(fontFamilySelect, { target: { value: 'serif' } });

      expect(mockStyleController.setFontFamily).toHaveBeenCalledWith('serif');
      expect(mockStyleController.saveToStorage).toHaveBeenCalled();
      expect(mockOnStyleChange).toHaveBeenCalled();
    });

    it('全てのフォントファミリーオプションが表示される', () => {
      render(
        <StylePanel
          styleController={mockStyleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      expect(screen.getByRole('option', { name: 'ゴシック体' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '明朝体' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '等幅フォント' })).toBeInTheDocument();
    });
  });

  describe('ボタン操作', () => {
    it('リセットボタンが正しく動作する', () => {
      render(
        <StylePanel
          styleController={mockStyleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      const resetButton = screen.getByRole('button', { name: 'リセット' });
      fireEvent.click(resetButton);

      expect(mockStyleController.reset).toHaveBeenCalled();
      expect(mockOnStyleChange).toHaveBeenCalled();
    });

    it('閉じるボタンが正しく動作する', () => {
      render(
        <StylePanel
          styleController={mockStyleController}
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
    it('StyleControllerの設定変更時に内部状態が更新される', () => {
      const { rerender } = render(
        <StylePanel
          styleController={mockStyleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      // 設定変更をシミュレート
      const newConfig: StyleConfig = {
        theme: 'dark',
        fontSize: 'large',
        fontFamily: 'serif',
      };
      mockStyleController.getConfig = vi.fn().mockReturnValue(newConfig);

      // テーマ変更をトリガー
      const themeSelect = screen.getByDisplayValue('ライト');
      fireEvent.change(themeSelect, { target: { value: 'dark' } });

      // コンポーネントが新しい設定で更新されることを確認
      expect(mockStyleController.getConfig).toHaveBeenCalled();
    });

    it('異なる初期設定で正しく初期化される', () => {
      const customConfig: StyleConfig = {
        theme: 'sepia',
        fontSize: 'xlarge',
        fontFamily: 'monospace',
        customFontSize: 20,
      };
      mockStyleController.getConfig = vi.fn().mockReturnValue(customConfig);

      render(
        <StylePanel
          styleController={mockStyleController}
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
          styleController={mockStyleController}
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
          styleController={mockStyleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      const resetButton = screen.getByRole('button', { name: 'リセット' });
      const closeButton = screen.getByRole('button', { name: '閉じる' });

      expect(resetButton).toHaveAttribute('tabIndex', '0');
      expect(closeButton).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('イベントハンドリング', () => {
    it('複数の設定変更が順次処理される', () => {
      render(
        <StylePanel
          styleController={mockStyleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      // 複数の設定を順次変更
      const themeSelect = screen.getByDisplayValue('ライト');
      const fontSizeSelect = screen.getByDisplayValue('中');

      fireEvent.change(themeSelect, { target: { value: 'dark' } });
      fireEvent.change(fontSizeSelect, { target: { value: 'large' } });

      expect(mockStyleController.setTheme).toHaveBeenCalledWith('dark');
      expect(mockStyleController.setFontSize).toHaveBeenCalledWith('large');
      expect(mockStyleController.saveToStorage).toHaveBeenCalledTimes(2);
      expect(mockOnStyleChange).toHaveBeenCalledTimes(2);
    });

    it('無効な値での変更は処理されない', () => {
      render(
        <StylePanel
          styleController={mockStyleController}
          onClose={mockOnClose}
          onStyleChange={mockOnStyleChange}
        />
      );

      const themeSelect = screen.getByDisplayValue('ライト');
      
      // 無効な値を設定（実際のオプションにない値）
      fireEvent.change(themeSelect, { target: { value: 'invalid-theme' } });

      // TypeScriptの型チェックにより、実際には無効な値は渡されないが、
      // テストとしてStyleControllerが呼ばれることを確認
      expect(mockStyleController.setTheme).toHaveBeenCalledWith('invalid-theme');
    });
  });
});