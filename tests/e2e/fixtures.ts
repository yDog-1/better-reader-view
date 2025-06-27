import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

/**
 * WXT拡張機能用のPlaywright Fixtures
 *
 * Chrome拡張機能をロードしたコンテキストでテストを実行するためのセットアップ
 * @see https://playwright.dev/docs/chrome-extensions
 * @see https://wxt.dev/guide/essentials/e2e-testing.html
 */

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    // WXTビルド出力ディレクトリ（Chrome用）
    const pathToExtension = path.join(
      globalThis.process?.cwd() || '',
      '.output/chrome-mv3'
    );

    console.log(`Loading extension from: ${pathToExtension}`);

    const context = await chromium.launchPersistentContext('', {
      headless: false, // 拡張機能テストではheadlessは無効
      channel: 'chromium',
      args: [
        '--disable-extensions-except=' + pathToExtension,
        '--load-extension=' + pathToExtension,
        '--no-first-run',
        '--disable-default-apps',
        '--disable-web-security', // 開発用
      ],
      slowMo: 100, // デバッグ用のスロー実行
    });

    await use(context);
    await context.close();
  },

  extensionId: async ({ context }, use) => {
    // Service Worker（background script）から拡張機能IDを取得
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }

    const extensionId = background.url().split('/')[2];
    console.log(`Extension ID: ${extensionId}`);

    await use(extensionId);
  },
});

export const expect = test.expect;
