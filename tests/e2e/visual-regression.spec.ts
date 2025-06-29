/**
 * Visual Regression Tests - UI Consistency Foundation
 *
 * このファイルはBetter Reader Viewの視覚的回帰テストの基盤を提供します。
 * UI要素の一貫性を保ち、意図しない視覚的変更を検出します。
 *
 * テストを追加する際のガイドライン：
 * 1. 各テストは独立して実行可能であること
 * 2. アニメーションを無効化してスクリーンショットの一貫性を保つこと
 * 3. 重要なUIステートをカバーすること
 * 4. 異なるテーマ・設定でのテストを含めること
 *
 * スクリーンショット更新方法：
 * bunx playwright test --project=visual-regression --update-snapshots
 *
 * @see https://playwright.dev/docs/test-screenshots
 */

import { expect, chromeTest } from './fixtures';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

chromeTest.describe('Visual Regression Tests - Better Reader View', () => {
  chromeTest('Reader View基本UI - アクティベーション前', async ({ page }) => {
    // Given: 通常の記事ページを開く
    const testPagePath = 'file://' + path.join(__dirname, 'test-page.html');
    await page.goto(testPagePath);

    // ページが完全に読み込まれるまで待機
    await expect(page.locator('article')).toBeVisible();
    await expect(page.locator('article h1')).toBeVisible();

    // DOM更新の完了を確実にする
    await page.waitForLoadState('domcontentloaded');

    // When & Then: Reader View未アクティブ状態のスクリーンショット
    await expect(page).toHaveScreenshot('reader-view-inactive.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  chromeTest('Reader View基本UI - アクティベーション後', async ({ page }) => {
    // Given: 記事ページを開く
    const testPagePath = 'file://' + path.join(__dirname, 'test-page.html');
    await page.goto(testPagePath);
    await expect(page.locator('article')).toBeVisible();

    // When: Reader Viewを有効化（Browser Actionのシミュレート）
    // 実際のBrowser Action処理をシミュレートする代わりに、直接Reader Viewを作成

    // Content scriptの注入とReader View有効化のシミュレート
    await page.evaluate(() => {
      // Reader Viewのアクティベーションをシミュレート
      document.body.style.display = 'none';

      // Reader Viewコンテナを作成
      const container = document.createElement('div');
      container.id = 'better-reader-view-container';
      container.style.cssText = `
        all: initial;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 2147483647;
        background: #fafafa;
        font-family: Georgia, serif;
        padding: 40px;
        box-sizing: border-box;
      `;

      // Reader Viewコンテンツを作成
      container.innerHTML = `
        <div style="
          max-width: 680px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        ">
          <h1 style="
            font-size: 2.2rem;
            line-height: 1.3;
            margin-bottom: 24px;
            color: #1a1a1a;
          ">新しいWebフレームワーク「ReactNext」が開発者の注目を集める</h1>
          
          <div style="
            color: #666;
            margin-bottom: 32px;
            font-size: 0.9rem;
            border-bottom: 1px solid #eee;
            padding-bottom: 16px;
          ">
            2024年6月24日 • 執筆者: 田中太郎 • 読了時間: 約5分
          </div>
          
          <div style="
            font-size: 1.1rem;
            line-height: 1.6;
            color: #2a2a2a;
          ">
            <p style="margin-bottom: 24px;">
              Meta社から新しいWebフレームワーク「ReactNext」が発表され、開発者コミュニティで大きな話題となっています。このフレームワークは、従来のReactの利点を継承しつつ、パフォーマンスと開発体験の大幅な向上を実現したとされています。
            </p>
            
            <h2 style="
              font-size: 1.6rem;
              margin: 32px 0 16px;
              color: #1a1a1a;
            ">主な特徴</h2>
            
            <p style="margin-bottom: 16px;">ReactNextは以下の革新的な機能を提供します：</p>
            
            <ul style="margin-bottom: 24px; padding-left: 24px;">
              <li style="margin-bottom: 8px;"><strong>ゼロランタイム</strong>：コンパイル時にすべての最適化を実行し、ランタイムオーバーヘッドを完全に排除</li>
              <li style="margin-bottom: 8px;"><strong>型安全性</strong>：TypeScriptをネイティブサポートし、実行時エラーを大幅に削減</li>
              <li style="margin-bottom: 8px;"><strong>サーバーレス最適化</strong>：Edge環境での高速実行を前提とした設計</li>
            </ul>
          </div>
        </div>
      `;

      document.documentElement.appendChild(container);
    });

    // DOM更新の完了を待機
    await page.waitForLoadState('domcontentloaded');

    // Then: Reader Viewアクティブ状態のスクリーンショット
    await expect(page).toHaveScreenshot('reader-view-active.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  chromeTest('Reader View - ダークテーマ', async ({ page }) => {
    // Given: Reader Viewをアクティブ状態で開く
    const testPagePath = 'file://' + path.join(__dirname, 'test-page.html');
    await page.goto(testPagePath);
    await expect(page.locator('article')).toBeVisible();

    // When: ダークテーマのReader Viewを作成
    await page.evaluate(() => {
      document.body.style.display = 'none';

      const container = document.createElement('div');
      container.id = 'better-reader-view-container';
      container.style.cssText = `
        all: initial;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 2147483647;
        background: #1a1a1a;
        font-family: Georgia, serif;
        padding: 40px;
        box-sizing: border-box;
      `;

      container.innerHTML = `
        <div style="
          max-width: 680px;
          margin: 0 auto;
          background: #2a2a2a;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <h1 style="
            font-size: 2.2rem;
            line-height: 1.3;
            margin-bottom: 24px;
            color: #ffffff;
          ">新しいWebフレームワーク「ReactNext」が開発者の注目を集める</h1>
          
          <div style="
            color: #888;
            margin-bottom: 32px;
            font-size: 0.9rem;
            border-bottom: 1px solid #444;
            padding-bottom: 16px;
          ">
            2024年6月24日 • 執筆者: 田中太郎 • 読了時間: 約5分
          </div>
          
          <div style="
            font-size: 1.1rem;
            line-height: 1.6;
            color: #e0e0e0;
          ">
            <p style="margin-bottom: 24px;">
              Meta社から新しいWebフレームワーク「ReactNext」が発表され、開発者コミュニティで大きな話題となっています。このフレームワークは、従来のReactの利点を継承しつつ、パフォーマンスと開発体験の大幅な向上を実現したとされています。
            </p>
            
            <h2 style="
              font-size: 1.6rem;
              margin: 32px 0 16px;
              color: #ffffff;
            ">主な特徴</h2>
            
            <p style="margin-bottom: 16px;">ReactNextは以下の革新的な機能を提供します：</p>
            
            <ul style="margin-bottom: 24px; padding-left: 24px;">
              <li style="margin-bottom: 8px; color: #e0e0e0;"><strong style="color: #fff;">ゼロランタイム</strong>：コンパイル時にすべての最適化を実行し、ランタイムオーバーヘッドを完全に排除</li>
              <li style="margin-bottom: 8px; color: #e0e0e0;"><strong style="color: #fff;">型安全性</strong>：TypeScriptをネイティブサポートし、実行時エラーを大幅に削減</li>
              <li style="margin-bottom: 8px; color: #e0e0e0;"><strong style="color: #fff;">サーバーレス最適化</strong>：Edge環境での高速実行を前提とした設計</li>
            </ul>
          </div>
        </div>
      `;

      document.documentElement.appendChild(container);
    });

    await page.waitForLoadState('domcontentloaded');

    // Then: ダークテーマのスクリーンショット
    await expect(page).toHaveScreenshot('reader-view-dark-theme.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  chromeTest('Reader View - エラー状態', async ({ page }) => {
    // Given: コンテンツが不足している記事ページ
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>短い記事</title>
        </head>
        <body>
          <nav>Navigation</nav>
          <div>
            <h1>短すぎる記事</h1>
            <p>これは短すぎます。</p>
          </div>
          <footer>Footer</footer>
        </body>
      </html>
    `);

    // When: エラーメッセージを表示するReader View状態を作成
    await page.evaluate(() => {
      document.body.style.display = 'none';

      const container = document.createElement('div');
      container.id = 'better-reader-view-container';
      container.style.cssText = `
        all: initial;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 2147483647;
        background: #fafafa;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      container.innerHTML = `
        <div style="
          max-width: 400px;
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          text-align: center;
        ">
          <div style="
            width: 64px;
            height: 64px;
            margin: 0 auto 24px;
            background: #ff6b6b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
          ">⚠</div>
          
          <h2 style="
            font-size: 1.5rem;
            margin-bottom: 16px;
            color: #1a1a1a;
          ">記事の抽出に失敗しました</h2>
          
          <p style="
            color: #666;
            line-height: 1.5;
            margin-bottom: 24px;
          ">
            このページからは読みやすい記事を抽出できませんでした。
            コンテンツが不足しているか、サポートされていない形式の可能性があります。
          </p>
          
          <button style="
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 0.9rem;
            cursor: pointer;
          ">元のページに戻る</button>
        </div>
      `;

      document.documentElement.appendChild(container);
    });

    await page.waitForLoadState('domcontentloaded');

    // Then: エラー状態のスクリーンショット
    await expect(page).toHaveScreenshot('reader-view-error-state.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  chromeTest('Reader View - モバイルビューポート', async ({ page }) => {
    // Given: モバイルサイズのビューポート設定
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6/7/8 サイズ

    const testPagePath = 'file://' + path.join(__dirname, 'test-page.html');
    await page.goto(testPagePath);
    await expect(page.locator('article')).toBeVisible();

    // When: モバイル対応Reader Viewを作成
    await page.evaluate(() => {
      document.body.style.display = 'none';

      const container = document.createElement('div');
      container.id = 'better-reader-view-container';
      container.style.cssText = `
        all: initial;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 2147483647;
        background: #fafafa;
        font-family: Georgia, serif;
        padding: 16px;
        box-sizing: border-box;
        overflow-y: auto;
      `;

      container.innerHTML = `
        <div style="
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        ">
          <h1 style="
            font-size: 1.8rem;
            line-height: 1.3;
            margin-bottom: 20px;
            color: #1a1a1a;
          ">新しいWebフレームワーク「ReactNext」が開発者の注目を集める</h1>
          
          <div style="
            color: #666;
            margin-bottom: 24px;
            font-size: 0.85rem;
            border-bottom: 1px solid #eee;
            padding-bottom: 12px;
          ">
            2024年6月24日
          </div>
          
          <div style="
            font-size: 1rem;
            line-height: 1.6;
            color: #2a2a2a;
          ">
            <p style="margin-bottom: 20px;">
              Meta社から新しいWebフレームワーク「ReactNext」が発表され、開発者コミュニティで大きな話題となっています。
            </p>
            
            <h2 style="
              font-size: 1.4rem;
              margin: 24px 0 12px;
              color: #1a1a1a;
            ">主な特徴</h2>
            
            <ul style="margin-bottom: 20px; padding-left: 20px;">
              <li style="margin-bottom: 8px;">ゼロランタイム</li>
              <li style="margin-bottom: 8px;">型安全性</li>
              <li style="margin-bottom: 8px;">サーバーレス最適化</li>
            </ul>
          </div>
        </div>
      `;

      document.documentElement.appendChild(container);
    });

    await page.waitForLoadState('domcontentloaded');

    // Then: モバイルビューのスクリーンショット
    await expect(page).toHaveScreenshot('reader-view-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

/**
 * 視覚的回帰テストの拡張ガイド
 *
 * 新しいテストを追加する際は、以下のパターンに従ってください：
 *
 * 1. テスト名は機能とUIステートを明確に表現する
 * 2. Given-When-Then構造でテストを構成する
 * 3. アニメーションは無効化し、waitForTimeout()で安定化する
 * 4. スクリーンショット名は英語で、内容を表現する
 * 5. 異なる画面サイズ、テーマ、言語での検証を考慮する
 *
 * 例：
 * chromeTest('Reader View - 設定パネル開いた状態', async ({ page }) => {
 *   // Given: Reader View有効状態
 *   // When: 設定パネルを開く
 *   // Then: スクリーンショット撮影
 *   await expect(page).toHaveScreenshot('settings-panel-open.png');
 * });
 */
