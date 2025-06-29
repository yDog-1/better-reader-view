import {
  test as base,
  chromium,
  firefox,
  type BrowserContext,
} from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * WXT拡張機能用のPlaywright Fixtures - Chrome & Firefox対応
 *
 * Chrome/Firefox拡張機能をロードしたコンテキストでテストを実行するためのセットアップ
 * @see https://playwright.dev/docs/chrome-extensions
 * @see https://wxt.dev/guide/essentials/e2e-testing.html
 */

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({ browserName }, use) => {
    let context: BrowserContext;

    if (browserName === 'firefox') {
      // Firefox拡張機能の設定
      const pathToExtension = path.join(
        globalThis.process?.cwd() || '',
        '.output/firefox-mv2'
      );

      console.log(`Loading Firefox extension from: ${pathToExtension}`);

      // Firefox拡張機能がビルドされているか確認
      if (!fs.existsSync(pathToExtension)) {
        throw new Error(
          `Firefox extension not found at ${pathToExtension}. Run 'bun run build:firefox' first.`
        );
      }

      // Firefoxでの拡張機能ロードは現在Playwrightでは公式サポートされていないため、
      // 基本的なFirefoxコンテキストを作成してcontent scriptの機能テストを実行
      const browser = await firefox.launch({
        headless: process.env.CI === 'true',
        slowMo: process.env.CI === 'true' ? 0 : 100,
      });

      context = await browser.newContext();
      console.log(
        'Firefox context created (extension loading not supported via Playwright)'
      );
    } else {
      // Chrome拡張機能の設定（既存の設定）
      const pathToExtension = path.join(
        globalThis.process?.cwd() || '',
        '.output/chrome-mv3'
      );

      console.log(`Loading Chrome extension from: ${pathToExtension}`);

      context = await chromium.launchPersistentContext('', {
        headless: process.env.CI === 'true', // CI環境ではheadlessモード
        channel: 'chromium',
        args: [
          '--disable-extensions-except=' + pathToExtension,
          '--load-extension=' + pathToExtension,
          '--no-first-run',
          '--disable-default-apps',
          '--disable-web-security', // 開発用
        ],
        slowMo: process.env.CI === 'true' ? 0 : 100, // CI環境ではスロー実行を無効
      });
    }

    await use(context);
    await context.close();
  },

  extensionId: async ({ context, browserName }, use) => {
    let extensionId: string;

    if (browserName === 'firefox') {
      // Firefox: 拡張機能のID取得は現在のPlaywrightではサポートされていないため、
      // ダミーIDを使用してcontent scriptのテストを実行
      extensionId = 'firefox-extension-test-id';
      console.log(
        `Firefox Extension Test ID: ${extensionId} (mock ID for testing)`
      );
    } else {
      // Chrome: Service Worker（background script）から拡張機能IDを取得
      let [background] = context.serviceWorkers();
      if (!background) {
        background = await context.waitForEvent('serviceworker');
      }

      extensionId = background.url().split('/')[2];
      console.log(`Chrome Extension ID: ${extensionId}`);
    }

    await use(extensionId);
  },
});

export const expect = test.expect;

// Chrome用のテストフィクスチャ（Chromiumブラウザを強制）
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const chromeTest = test.extend<{}>({
  // Chromiumブラウザ設定は playwright.config.ts の chrome-extension プロジェクトで処理
});

// Firefox用のテストフィクスチャ（Firefoxブラウザを強制）
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const firefoxTest = test.extend<{}>({
  // Firefoxブラウザ設定は playwright.config.ts の firefox-extension プロジェクトで処理
});
