/**
 * @vitest-environment happy-dom
 * @vitest-setup ../tests/setup-classical.ts
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JSDOM } from 'jsdom';
import React from 'react';
import ReaderView from '~/components/ReaderView';
import { StyleController } from '@/utils/StyleController';
import {
  initializeReaderViewManager,
  activateReader,
  deactivateReader,
} from '@/utils/reader-utils';

/**
 * 古典学派アプローチによる統合テスト
 * - StyleController と ReaderView の実際の相互作用をテスト
 * - ユーザーが体験する実際のワークフローをテスト
 * - モックを最小限に抑制
 */

// テストデータビルダー
class TestDocumentBuilder {
  private title: string = 'Test Article';
  private content: string = '';

  withTitle(title: string): TestDocumentBuilder {
    this.title = title;
    return this;
  }

  withValidArticleContent(): TestDocumentBuilder {
    this.content = `
      <article>
        <h1>統合テスト記事</h1>
        <p>これは統合テストのための記事です。StyleControllerとReaderViewの相互作用をテストします。十分な長さのコンテンツでReadabilityアルゴリズムの要件を満たします。</p>
        <p>追加の段落でコンテンツの品質を確保します。Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p>最後の段落でReadabilityの最小要件を満たします。Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      </article>
    `;
    return this;
  }

  build(): Document {
    const jsdom = new JSDOM(`
      <!DOCTYPE html>
      <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <title>${this.title}</title>
        </head>
        <body>
          ${this.content}
        </body>
      </html>
    `);
    return jsdom.window.document;
  }
}

function createTestDocument(): TestDocumentBuilder {
  return new TestDocumentBuilder();
}

describe('Reader Integration Tests (Classical Approach)', () => {
  let styleController: StyleController;

  beforeEach(() => {
    // 実際のStyleControllerインスタンスを使用
    styleController = new StyleController();
    initializeReaderViewManager(styleController);

    // sessionStorageをクリア
    sessionStorage.clear();
  });

  describe('StyleController と ReaderView の統合', () => {
    it('Given: StyleControllerの設定変更, When: ReaderViewをレンダリング, Then: 新しいスタイルが適用される', async () => {
      // Given
      const testProps = {
        title: '統合テスト記事',
        content: '<p>テストコンテンツ</p>',
        styleController,
      };

      const { container, rerender } = render(<ReaderView {...testProps} />);

      // 初期状態を確認
      const readerContainer = container.firstChild as HTMLElement;
      const initialThemeClass = styleController.getThemeClass();
      expect(readerContainer).toHaveClass(initialThemeClass);

      // When: StyleControllerの設定を変更
      styleController.setTheme('dark');
      styleController.setFontSize('large');
      styleController.setFontFamily('serif');

      // ReaderViewを再レンダリング
      rerender(<ReaderView {...testProps} />);

      // Then: 新しいスタイルが適用される
      const updatedReaderContainer = container.firstChild as HTMLElement;
      const newThemeClass = styleController.getThemeClass();
      expect(updatedReaderContainer).toHaveClass(newThemeClass);
      expect(newThemeClass).not.toBe(initialThemeClass);

      // インラインスタイルも更新される
      const inlineVars = styleController.getInlineVars();
      Object.entries(inlineVars).forEach(([property, value]) => {
        expect(updatedReaderContainer).toHaveStyle(`${property}: ${value}`);
      });
    });

    it('Given: ReaderViewでスタイル変更, When: StylePanelで設定変更, Then: 変更が永続化される', async () => {
      // Given
      const testProps = {
        title: '永続化テスト',
        content: '<p>設定永続化のテスト</p>',
        styleController,
      };

      render(<ReaderView {...testProps} />);

      // StylePanelを開く
      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      fireEvent.click(styleButton);

      // When: StylePanelで設定を変更
      const themeSelect = screen.getByLabelText('テーマ');
      fireEvent.change(themeSelect, { target: { value: 'sepia' } });

      const fontSizeSelect = screen.getByLabelText('フォントサイズ');
      fireEvent.change(fontSizeSelect, { target: { value: 'xlarge' } });

      // Then: StyleControllerの設定が更新される
      const config = styleController.getConfig();
      expect(config.theme).toBe('sepia');
      expect(config.fontSize).toBe('xlarge');

      // sessionStorageに永続化される
      const savedConfig = JSON.parse(
        sessionStorage.getItem('readerViewStyleConfig') || '{}'
      );
      expect(savedConfig.theme).toBe('sepia');
      expect(savedConfig.fontSize).toBe('xlarge');
    });

    it('Given: 保存された設定, When: StyleController初期化, Then: 設定が復元される', () => {
      // Given: sessionStorageに設定を保存
      const savedConfig = {
        theme: 'dark',
        fontSize: 'large',
        fontFamily: 'monospace',
        customFontSize: 18,
      };
      sessionStorage.setItem(
        'readerViewStyleConfig',
        JSON.stringify(savedConfig)
      );

      // When: 新しいStyleControllerを作成し、設定を読み込み
      const newStyleController = new StyleController();
      const loadResult = newStyleController.loadFromStorage();

      // Then: 設定が正しく復元される
      expect(loadResult).toBe(true);
      const restoredConfig = newStyleController.getConfig();
      expect(restoredConfig).toEqual(savedConfig);
    });
  });

  describe('エンドツーエンドワークフロー', () => {
    it('Given: 記事ページ, When: リーダービュー有効化→スタイル変更→無効化, Then: 完全なワークフローが動作する', async () => {
      // Given: テスト用の記事ドキュメント
      const document = createTestDocument()
        .withTitle('E2Eテスト記事')
        .withValidArticleContent()
        .build();

      // When: リーダービューを有効化
      const activationResult = activateReader(document);

      // Then: リーダービューが正常に有効化される
      expect(activationResult).toBe(true);
      expect(document.body.style.display).toBe('none');
      expect(
        document.getElementById('better-reader-view-container')
      ).toBeTruthy();

      // When: リーダービューを無効化
      deactivateReader(document);

      // Then: 元のページが復元される
      expect(document.body.style.display).toBe('');
      expect(
        document.getElementById('better-reader-view-container')
      ).toBeFalsy();
    });

    it('Given: 複数回のアクティベーション, When: 重複実行, Then: 適切にクリーンアップされる', () => {
      // Given
      const document = createTestDocument().withValidArticleContent().build();

      // When: 複数回リーダービューを有効化
      const firstResult = activateReader(document);
      const secondResult = activateReader(document);

      // Then: 両方とも成功し、コンテナが1つだけ存在する
      expect(firstResult).toBe(true);
      expect(secondResult).toBe(true);

      const containers = document.querySelectorAll(
        '#better-reader-view-container'
      );
      expect(containers).toHaveLength(1);

      // クリーンアップ
      deactivateReader(document);
      expect(
        document.getElementById('better-reader-view-container')
      ).toBeFalsy();
    });

    it('Given: 無効なコンテンツ, When: リーダービュー有効化, Then: 失敗して元ページが保持される', () => {
      // Given: コンテンツが不十分なドキュメント
      const jsdom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <head><title>テスト</title></head>
          <body><p>短い</p></body>
        </html>
      `);
      const document = jsdom.window.document;
      const originalDisplay = document.body.style.display;

      // When: リーダービューの有効化を試行
      const result = activateReader(document);

      // Then: 失敗し、元のページが保持される
      expect(result).toBe(false);
      expect(document.body.style.display).toBe(originalDisplay);
      expect(
        document.getElementById('better-reader-view-container')
      ).toBeFalsy();
    });
  });

  describe('エラーハンドリング', () => {
    it('Given: sessionStorageエラー, When: 設定保存, Then: エラーが適切に処理される', () => {
      // Given: sessionStorageでエラーが発生する状況をシミュレート
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      // When & Then: エラーが発生してもクラッシュしない
      expect(() => {
        styleController.setTheme('dark');
        styleController.saveToStorage();
      }).not.toThrow();

      // クリーンアップ
      sessionStorage.setItem = originalSetItem;
    });

    it('Given: 破損したsessionStorageデータ, When: 設定読み込み, Then: デフォルト設定で継続する', () => {
      // Given: 破損したJSONデータ
      sessionStorage.setItem('readerViewStyleConfig', 'invalid json data');

      // サイレントロガーを使用してエラーメッセージを抑制
      const silentLogger = { warn: () => {} };
      const testStyleController = new StyleController(undefined, silentLogger);

      // When: 設定読み込みを試行
      const loadResult = testStyleController.loadFromStorage();

      // Then: 失敗し、デフォルト設定が保持される
      expect(loadResult).toBe(false);
      const config = testStyleController.getConfig();
      expect(config.theme).toBe('light');
      expect(config.fontSize).toBe('medium');
      expect(config.fontFamily).toBe('sans-serif');
    });
  });

  describe('パフォーマンス考慮', () => {
    it('Given: 大きなドキュメント, When: リーダービュー有効化, Then: 適切な時間内で処理される', async () => {
      // Given: 大きなコンテンツを持つドキュメント
      const largeContent = Array(100)
        .fill(0)
        .map(
          (_, i) =>
            `<p>段落${i}: これは大きなドキュメントのテストです。Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>`
        )
        .join('');

      const jsdom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <head><title>大きなドキュメント</title></head>
          <body><article>${largeContent}</article></body>
        </html>
      `);
      const document = jsdom.window.document;

      // When: 処理時間を測定
      const startTime = window.performance.now();
      const result = activateReader(document);
      const endTime = window.performance.now();

      // Then: 合理的な時間内で処理される（1秒以内）
      expect(result).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000);

      // クリーンアップ
      deactivateReader(document);
    });
  });
});
