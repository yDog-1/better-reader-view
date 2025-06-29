import { test as base, firefox, type BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Firefox専用のPlaywright Fixtures
 *
 * Firefoxブラウザでのcontent script機能テストに特化したシンプルなセットアップ
 * 拡張機能の実際のロードはPlaywrightでサポートされていないため、
 * content scriptの機能を直接テストします。
 */

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use, testInfo) => {
    // Increase setup timeout for Firefox
    testInfo.setTimeout(120000);
    // Firefox拡張機能がビルドされているか確認
    const pathToExtension = path.join(
      globalThis.process?.cwd() || '',
      '.output/firefox-mv2'
    );

    console.log(`Firefox extension expected at: ${pathToExtension}`);

    if (!fs.existsSync(pathToExtension)) {
      console.warn(
        `Firefox extension not found at ${pathToExtension}. Extension loading will be skipped.`
      );
    }

    // Firefox basic context for content script testing
    try {
      const browser = await firefox.launch({
        headless: true, // Force headless mode for WSL2 compatibility
        slowMo: 0,
        timeout: 120000,
        // Try to use specific Firefox path for WSL2
        executablePath: process.env.FIREFOX_PATH,
        firefoxUserPrefs: {
          // Firefox preferences for better stability in WSL2
          'browser.dom_window.dump.enabled': true,
          'devtools.console.stdout.chrome': true,
          'devtools.console.stdout.content': true,
        },
      });

      const context = await browser.newContext();
      console.log('Firefox context created for content script testing');

      await use(context);
      await context.close();
      await browser.close();
    } catch (error) {
      console.error('Firefox launch failed:', error);
      throw new Error(
        'Firefox is not available in this environment. Please run Firefox tests on a system with Firefox installed.'
      );
    }
  },

  extensionId: async ({}, use) => {
    // Firefox拡張機能のID取得は現在のPlaywrightではサポートされていないため、
    // テスト用のモックIDを使用
    const extensionId = 'firefox-extension-test-id';
    console.log(
      `Firefox Extension Test ID: ${extensionId} (mock ID for content script testing)`
    );

    await use(extensionId);
  },
});

export const expect = test.expect;
