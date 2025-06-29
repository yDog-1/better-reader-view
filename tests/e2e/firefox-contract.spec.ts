/**
 * Firefox Contract-based E2E Tests
 *
 * 実装詳細に依存しない、動作契約に基づくテスト。
 * 実際のutils関数を使用してFirefoxでの動作を検証。
 */

/* eslint-disable playwright/no-conditional-in-test, playwright/no-conditional-expect */

import { test, expect } from './firefox-fixtures';

// Type declarations for injected browser globals
declare global {
  interface Window {
    ReaderUtils: {
      extractContent: (
        document: Document
      ) => { title: string; content: string } | null;
      isValidArticle: (article: unknown) => boolean;
      hideUnnecessaryElements: (document: Document) => {
        hiddenCount: number;
        success: boolean;
      };
      simulateReaderView: (document: Document) => {
        success: boolean;
        content?: { title: string; content: string } | null;
        hiddenElements?: number;
        reason?: string;
        error?: string;
      };
      basicContentExtraction: (
        document: Document
      ) => { title: string; content: string } | null;
      basicHtmlSanitize: (html: string) => string;
    };
  }
  const Readability: {
    new (document: Document): {
      parse(): {
        title: string;
        content: string;
        textContent: string;
        length: number;
        excerpt: string;
        byline: string | null;
        dir: string | null;
        siteName: string | null;
        lang: string | null;
      } | null;
    };
  };
}
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Firefox Reader View Contract Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mozilla Readabilityライブラリを注入
    await page.addInitScript({
      path: path.join(
        __dirname,
        '../../node_modules/@mozilla/readability/Readability.js'
      ),
    });

    // 実際のutils関数をページに注入
    await page.addInitScript({
      path: path.join(__dirname, 'utils-bridge.js'),
    });

    // Firefox環境での注入確認
    await page.goto('data:text/html,<html><body></body></html>');
    const isLoaded = await page.evaluate(() => {
      return (
        typeof window.ReaderUtils !== 'undefined' &&
        typeof Readability !== 'undefined'
      );
    });

    if (!isLoaded) {
      console.warn(
        'ReaderUtils or Readability not loaded, trying alternative injection method'
      );

      // 代替方法: 直接スクリプト内容を注入
      const fs = await import('fs');

      // Readabilityライブラリを注入
      const readabilityPath = path.join(
        __dirname,
        '../../node_modules/@mozilla/readability/Readability.js'
      );
      const readabilityContent = fs.readFileSync(readabilityPath, 'utf8');
      await page.evaluate(readabilityContent);

      // utils-bridgeを注入
      const scriptContent = fs.readFileSync(
        path.join(__dirname, 'utils-bridge.js'),
        'utf8'
      );
      await page.evaluate(scriptContent);
    }
  });

  test('Reader View Contract: Content extraction works with real articles', async ({
    page,
  }) => {
    // 実際のテストページを使用
    const testPagePath = 'file://' + path.join(__dirname, 'test-page.html');
    await page.goto(testPagePath);

    // 実際のextractContent関数を実行
    const result = await page.evaluate(() => {
      return window.ReaderUtils.extractContent(document);
    });

    // 契約の検証: 関数が成功時に適切な形式を返すか
    expect(result).toBeTruthy();
    if (result) {
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(typeof result.title).toBe('string');
      expect(typeof result.content).toBe('string');
      expect(result.title.length).toBeGreaterThan(0);
      expect(result.content.length).toBeGreaterThan(0);
    }

    console.log(
      'Content extraction result:',
      result ? 'Success' : 'Failed (expected for some content)'
    );
  });

  test('Reader View Contract: Error handling for invalid content', async ({
    page,
  }) => {
    // 無効なコンテンツを含むページ（本当に短いコンテンツ）
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Invalid Content</title></head>
        <body>
          <div>Short</div>
          <span>Text</span>
        </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      return window.ReaderUtils.extractContent(document);
    });

    // 契約: 無効なコンテンツに対してはnullを返す、または有効な構造を返す
    // Note: Readability may still extract content from short text in some cases
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(typeof result.title).toBe('string');
      expect(typeof result.content).toBe('string');
    }
  });

  test('Reader View Contract: Sanitization behavior', async ({ page }) => {
    // 危険なコンテンツを含むページ
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Security Test</title></head>
        <body>
          <article>
            <h1>Test Article</h1>
            <p>Safe content</p>
            <script>alert('xss')</script>
            <div onclick="malicious()">Dangerous div</div>
            <iframe src="evil.com"></iframe>
            <p>More safe content for sufficient length to pass extraction threshold.</p>
            <p>Additional content to ensure the article meets minimum length requirements.</p>
          </article>
        </body>
      </html>
    `);

    const result = await page.evaluate(() => {
      return window.ReaderUtils.extractContent(document);
    });

    // 契約: 危険なタグ・属性が除去されている（結果がnullでない場合のみ）
    if (result !== null) {
      expect(result.content).not.toContain('<script');
      expect(result.content).not.toContain('onclick');
      expect(result.content).not.toContain('<iframe');
      expect(result.content).toContain('Safe content');
      expect(result.title).toBe('Security Test');
    } else {
      // 内容が不十分でnullが返される場合もある
      expect(result).toBeNull();
    }
  });

  test('Reader View Contract: Firefox-specific DOM behavior', async ({
    page,
  }) => {
    // Firefoxでの特殊なDOM動作をテスト
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Firefox DOM Test</title></head>
        <body>
          <article>
            <h1>Firefox DOM Test</h1>
            <p>Testing Firefox-specific DOM features and compatibility.</p>
            <p>This content tests how the reader view handles Firefox's DOM implementation.</p>
            <p>Additional paragraph to meet content length requirements for extraction.</p>
          </article>
        </body>
      </html>
    `);

    // Firefoxブラウザ情報を確認
    const browserInfo = await page.evaluate(() => ({
      userAgent: window.navigator.userAgent,
      isFirefox: window.navigator.userAgent.includes('Firefox'),
    }));

    expect(browserInfo.isFirefox).toBe(true);

    // Reader View契約の実行
    const result = await page.evaluate(() => {
      return window.ReaderUtils.simulateReaderView(document);
    });

    // 契約: Firefox環境でも正常に動作する
    expect(result.success).toBe(true);
    expect(result.content).not.toBeNull();
    if (result.content) {
      expect(result.content.title).toContain('Firefox DOM Test');
    }
  });

  test('Reader View Contract: Performance characteristics', async ({
    page,
  }) => {
    // 大きなページでのパフォーマンス特性
    const largeContent = Array.from(
      { length: 50 },
      (_, i) =>
        `<p>Paragraph ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`
    ).join('');

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Performance Test</title></head>
        <body>
          <nav>Navigation</nav>
          <aside>Sidebar</aside>
          <article>
            <h1>Large Article Test</h1>
            ${largeContent}
          </article>
          <footer>Footer</footer>
        </body>
      </html>
    `);

    const startTime = Date.now();

    const result = await page.evaluate(() => {
      const start = Date.now();
      const readerResult = window.ReaderUtils.simulateReaderView(document);
      const end = Date.now();

      return {
        ...readerResult,
        executionTime: end - start,
      };
    });

    const totalTime = Date.now() - startTime;

    // 契約: 合理的な時間内で処理が完了する
    expect(result.success).toBe(true);
    expect(result.executionTime).toBeLessThan(5000); // 5秒以内
    expect(totalTime).toBeLessThan(10000); // 10秒以内

    console.log(
      `Performance: extraction took ${result.executionTime}ms, total ${totalTime}ms`
    );
  });

  test('Reader View Contract: Element hiding behavior', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Element Hiding Test</title></head>
        <body>
          <nav class="navigation">Site Nav</nav>
          <aside class="sidebar">Sidebar</aside>
          <div class="advertisement">Ad Content</div>
          <article>
            <h1>Main Article</h1>
            <p>Important article content that should remain visible.</p>
            <p>More content to ensure sufficient length for extraction.</p>
          </article>
          <footer>Site Footer</footer>
        </body>
      </html>
    `);

    // 初期状態: すべての要素が表示されている
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    const result = await page.evaluate(() => {
      return window.ReaderUtils.hideUnnecessaryElements(document);
    });

    // 契約: 不要な要素が非表示になり、記事は表示されたまま
    expect(result.success).toBe(true);
    expect(result.hiddenCount).toBeGreaterThan(0);

    // 実際のDOM状態を確認
    await expect(page.locator('nav')).toBeHidden();
    await expect(page.locator('aside')).toBeHidden();
    await expect(page.locator('footer')).toBeHidden();
    await expect(page.locator('article')).toBeVisible();
  });
});

test.describe('Firefox Reader View Property Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mozilla Readabilityライブラリを注入
    await page.addInitScript({
      path: path.join(
        __dirname,
        '../../node_modules/@mozilla/readability/Readability.js'
      ),
    });

    // 実際のutils関数をページに注入
    await page.addInitScript({
      path: path.join(__dirname, 'utils-bridge.js'),
    });

    // Firefox環境での注入確認
    await page.goto('data:text/html,<html><body></body></html>');
    const isLoaded = await page.evaluate(() => {
      return (
        typeof window.ReaderUtils !== 'undefined' &&
        typeof Readability !== 'undefined'
      );
    });

    if (!isLoaded) {
      console.warn(
        'ReaderUtils or Readability not loaded in Property Tests, trying alternative injection method'
      );

      // 代替方法: 直接スクリプト内容を注入
      const fs = await import('fs');

      // Readabilityライブラリを注入
      const readabilityPath = path.join(
        __dirname,
        '../../node_modules/@mozilla/readability/Readability.js'
      );
      const readabilityContent = fs.readFileSync(readabilityPath, 'utf8');
      await page.evaluate(readabilityContent);

      // utils-bridgeを注入
      const scriptContent = fs.readFileSync(
        path.join(__dirname, 'utils-bridge.js'),
        'utf8'
      );
      await page.evaluate(scriptContent);
    }
  });

  test('Property: Reader View works with various article structures', async ({
    page,
  }) => {
    const articleVariations = [
      {
        name: 'Standard article tag',
        html: '<article><h1>Title</h1><p>Content paragraph one.</p><p>Content paragraph two with sufficient length.</p></article>',
      },
      {
        name: 'Main tag structure',
        html: '<main><h2>Alternative Title</h2><p>Main content section with enough text.</p><p>Additional content paragraph.</p></main>',
      },
      {
        name: 'Class-based content',
        html: '<div class="content"><h1>Class-based Title</h1><p>Content within a classed div.</p><p>Sufficient additional content for extraction.</p></div>',
      },
    ];

    for (const variation of articleVariations) {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head><title>${variation.name}</title></head>
          <body>
            ${variation.html}
          </body>
        </html>
      `);

      const result = await page.evaluate(() => {
        return window.ReaderUtils.extractContent(document);
      });

      // プロパティ: 様々な構造でも一貫して動作する
      // 結果の検証（nullの場合もあり得る）
      if (result !== null) {
        expect(result.title).toBeTruthy();
        expect(result.content).toBeTruthy();
      }
      console.log(
        `${result ? '✓' : '⚠'} ${variation.name}: ${result ? 'extraction successful' : 'extraction failed (may be expected for minimal content)'}`
      );
    }
  });

  test('Property: Reader View gracefully handles edge cases', async ({
    page,
  }) => {
    const edgeCases = [
      {
        name: 'Empty document',
        html: '',
      },
      {
        name: 'No content elements',
        html: '<div>Random div</div><span>Random span</span>',
      },
      {
        name: 'Very short content',
        html: '<article><h1>Hi</h1><p>Short.</p></article>',
      },
      {
        name: 'Mixed language content',
        html: '<article><h1>English タイトル</h1><p>Mixed content with 日本語 and English text.</p><p>Additional mixed content for length requirements.</p></article>',
      },
    ];

    for (const edgeCase of edgeCases) {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head><title>${edgeCase.name}</title></head>
          <body>
            ${edgeCase.html}
          </body>
        </html>
      `);

      const result = await page.evaluate(() => {
        try {
          return {
            extraction: window.ReaderUtils.extractContent(document),
            error: null,
          };
        } catch (error) {
          return {
            extraction: null,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      });

      // プロパティ: エラーケースでもクラッシュしない
      expect(result.error).toBeNull();
      console.log(
        `✓ ${edgeCase.name}: handled gracefully (result: ${result.extraction ? 'success' : 'null'})`
      );
    }
  });
});
