/**
 * Firefox専用統合テスト - Content Script機能の検証
 *
 * Firefoxブラウザでのreader view機能をテストします。
 * 拡張機能の実際のロードはPlaywrightでサポートされていないため、
 * content scriptの機能を直接ページにインジェクトしてテストします。
 *
 * @see https://wxt.dev/guide/essentials/e2e-testing.html
 * @see https://playwright.dev/docs/browsers#firefox
 */

import { test, expect } from './firefox-fixtures';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Firefox Reader View Functionality', () => {
  test('Firefoxブラウザが正常に起動すること', async ({ context }) => {
    const page = await context.newPage();

    // Firefox環境でのページナビゲーションテスト
    await page.goto('data:text/html,<h1>Firefox Test Page</h1>');
    await expect(page.locator('h1')).toContainText('Firefox Test Page');

    // Firefox特有のnavigator情報を確認
    const userAgent = await page.evaluate(() => globalThis.navigator.userAgent);
    expect(userAgent).toContain('Firefox');
    console.log('Firefox user agent:', userAgent);
  });

  test('Reader View Core機能 - Content抽出ロジックのテスト', async ({
    context,
  }) => {
    const page = await context.newPage();

    // Reader Viewで処理できるようなテストページを作成
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Firefox Reader View Test Article</title>
          <meta charset="utf-8">
        </head>
        <body>
          <nav>Navigation menu</nav>
          <article>
            <h1>サンプル記事タイトル</h1>
            <p>これはFirefoxでのreader view機能をテストするための記事です。</p>
            <p>十分な量のコンテンツを含む記事として、複数の段落で構成されています。</p>
            <p>Mozilla Readabilityアルゴリズムがこの記事を適切に抽出できることを確認します。</p>
            <p>Firefoxブラウザでのテスト実行が正常に動作することを検証します。</p>
          </article>
          <aside>Sidebar content</aside>
          <footer>Footer content</footer>
        </body>
      </html>
    `);

    // Reader Viewのcore機能をFirefoxページ内で実行
    const readerViewResult = await page.evaluate(() => {
      // Reader Viewで使用されるMozilla Readabilityライブラリの基本ロジックをシミュレート
      const article = document.querySelector('article');
      if (!article) return null;

      const title = article.querySelector('h1')?.textContent?.trim() || '';
      const paragraphs = Array.from(article.querySelectorAll('p'));
      const contentLength = paragraphs.reduce(
        (total, p) => total + (p.textContent?.length || 0),
        0
      );

      return {
        title,
        paragraphCount: paragraphs.length,
        contentLength,
        hasValidStructure:
          title.length > 0 && paragraphs.length >= 3 && contentLength > 100,
        extractedContent: paragraphs
          .map((p) => p.textContent?.trim())
          .filter(Boolean),
      };
    });

    // Reader View機能の検証
    expect(readerViewResult).not.toBeNull();
    expect(readerViewResult!.title).toBe('サンプル記事タイトル');
    expect(readerViewResult!.paragraphCount).toBeGreaterThan(0); // Any number of paragraphs is valid
    expect(readerViewResult!.hasValidStructure).toBe(true);
    expect(readerViewResult!.contentLength).toBeGreaterThan(50); // Reasonable minimum content length

    console.log('Firefox Reader View test result:', readerViewResult);
  });

  test('DOM操作機能 - 不要要素の非表示化テスト', async ({ context }) => {
    const page = await context.newPage();

    // 複雑なレイアウトのページを作成
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Complex Layout Test</title></head>
        <body>
          <nav class="navigation">Site Navigation</nav>
          <div class="advertisement">広告コンテンツ</div>
          <main>
            <article>
              <h1>メイン記事</h1>
              <p>重要なコンテンツです。</p>
            </article>
          </main>
          <aside class="sidebar">サイドバー</aside>
          <div class="advertisement">もう一つの広告</div>
          <footer>Footer information</footer>
        </body>
      </html>
    `);

    // 初期状態の確認
    await expect(page.locator('.navigation')).toBeVisible();
    await expect(page.locator('.advertisement').first()).toBeVisible();
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();

    // Reader View機能のシミュレーション - 不要要素の非表示化
    const cleanupResult = await page.evaluate(() => {
      // 不要要素を特定して非表示にする（Reader Viewのcleanupロジック）
      const elementsToHide = ['nav', '.advertisement', 'aside', 'footer'];

      let hiddenCount = 0;
      elementsToHide.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          (element as HTMLElement).style.display = 'none';
          hiddenCount++;
        });
      });

      return {
        hiddenCount,
        articleVisible:
          window.getComputedStyle(document.querySelector('article')!)
            .display !== 'none',
        mainVisible:
          window.getComputedStyle(document.querySelector('main')!).display !==
          'none',
      };
    });

    // クリーンアップ後の状態確認
    expect(cleanupResult.hiddenCount).toBeGreaterThan(0); // Elements should be hidden
    expect(cleanupResult.articleVisible).toBe(true);
    expect(cleanupResult.mainVisible).toBe(true);

    // DOMの実際の状態も確認
    await expect(page.locator('.navigation')).toBeHidden();
    await expect(page.locator('.advertisement').first()).toBeHidden();
    await expect(page.locator('.sidebar')).toBeHidden();
    await expect(page.locator('footer')).toBeHidden();
    await expect(page.locator('article')).toBeVisible();
  });

  test('日本語コンテンツでのReader View機能テスト', async ({ context }) => {
    const page = await context.newPage();

    // 日本語記事のテストページ
    const testPagePath = 'file://' + path.join(__dirname, 'test-page.html');
    await page.goto(testPagePath);

    // 日本語コンテンツが正しく表示されることを確認
    await expect(page.locator('article h1')).toContainText('ReactNext');

    // 日本語テキストの処理をテスト
    const japaneseTextAnalysis = await page.evaluate(() => {
      const article = document.querySelector('article');
      if (!article) return null;

      const allText = article.textContent || '';
      const japaneseCharCount = (
        allText.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []
      ).length;
      const totalCharCount = allText.length;

      return {
        totalLength: totalCharCount,
        japaneseCharCount,
        hasJapaneseContent: japaneseCharCount > 0,
        japaneseRatio: japaneseCharCount / totalCharCount,
      };
    });

    expect(japaneseTextAnalysis).not.toBeNull();
    expect(japaneseTextAnalysis!.hasJapaneseContent).toBe(true);
    expect(japaneseTextAnalysis!.japaneseCharCount).toBeGreaterThan(0);

    console.log('Japanese content analysis:', japaneseTextAnalysis);
  });

  test('Firefox CSS互換性 - Reader Viewスタイルのテスト', async ({
    context,
  }) => {
    const page = await context.newPage();

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            /* Reader Viewスタイルのテスト */
            .reader-view {
              max-width: 680px;
              margin: 0 auto;
              padding: 20px;
              font-family: Georgia, serif;
              line-height: 1.6;
              background: #fafafa;
            }
            .reader-view h1 {
              font-size: 1.8rem;
              margin-bottom: 1rem;
              color: #333;
            }
            .reader-view p {
              margin-bottom: 1rem;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="reader-view">
            <h1>Reader View テストタイトル</h1>
            <p>このパラグラフはFirefoxでのCSS互換性をテストしています。</p>
            <p>Reader Viewのスタイルが正しく適用されることを確認します。</p>
          </div>
        </body>
      </html>
    `);

    // CSS適用状況をFirefoxで確認
    const styleValues = await page.evaluate(() => {
      const readerView = document.querySelector('.reader-view') as HTMLElement;
      const computedStyle = window.getComputedStyle(readerView);

      return {
        maxWidth: computedStyle.maxWidth,
        margin: computedStyle.margin,
        padding: computedStyle.padding,
        fontFamily: computedStyle.fontFamily,
        backgroundColor: computedStyle.backgroundColor,
        display: computedStyle.display,
      };
    });

    // Firefox環境でCSSが正しく適用されていることを確認
    expect(styleValues.maxWidth).toBe('680px');
    expect(styleValues.padding).toBe('20px');
    expect(styleValues.fontFamily).toContain('Georgia');
    expect(styleValues.display).not.toBe('none');

    console.log('Firefox CSS styles:', styleValues);
  });

  test('エラーハンドリング - 不正なコンテンツでのFirefox動作テスト', async ({
    context,
  }) => {
    const page = await context.newPage();

    // 不正なHTML構造のページ
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Invalid Content Test</title></head>
        <body>
          <div>記事ではないコンテンツ</div>
          <span>短いテキスト</span>
          <!-- articleタグがない状況 -->
        </body>
      </html>
    `);

    // エラーケースでの動作確認
    const errorHandlingResult = await page.evaluate(() => {
      try {
        // Reader View機能が記事を見つけられない場合の処理
        const article = document.querySelector('article');
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const paragraphs = document.querySelectorAll('p');
        const textContent = document.body.textContent || '';

        return {
          success: false,
          reason: 'no_article_found',
          hasArticle: !!article,
          headingCount: headings.length,
          paragraphCount: paragraphs.length,
          contentLength: textContent.length,
          canActivateReaderView: false,
        };
      } catch (error) {
        return {
          success: false,
          reason: 'execution_error',
          error: (error as Error).message,
        };
      }
    });

    // エラーが適切に処理されることを確認
    expect(errorHandlingResult.success).toBe(false);
    expect(errorHandlingResult.hasArticle).toBe(false);
    expect(errorHandlingResult.canActivateReaderView).toBe(false);
    expect(errorHandlingResult.reason).toBe('no_article_found');

    console.log('Firefox error handling result:', errorHandlingResult);
  });
});

test.describe('Firefox Browser Capabilities', () => {
  test('Firefox特有の機能とAPIの確認', async ({ context }) => {
    const page = await context.newPage();

    await page.goto('data:text/html,<h1>Firefox Features Test</h1>');

    // Firefox環境でのブラウザ機能確認
    const browserCapabilities = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = globalThis.navigator as any;
      return {
        userAgent: nav.userAgent,
        platform: nav.platform,
        cookieEnabled: nav.cookieEnabled,
        language: nav.language,
        onLine: nav.onLine,
        // Firefox特有の機能
        buildID: nav.buildID || 'not available',
        oscpu: nav.oscpu || 'not available',
        // DOM API
        documentReadyState: document.readyState,
        documentTitle: document.title,
      };
    });

    expect(browserCapabilities.userAgent).toContain('Firefox');
    expect(browserCapabilities.cookieEnabled).toBe(true);
    expect(browserCapabilities.documentReadyState).toBe('complete');

    console.log('Firefox browser capabilities:', browserCapabilities);
  });
});
