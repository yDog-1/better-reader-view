import { execSync } from 'child_process';
import type { FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright E2E tests
 *
 * WXTのPlaywright統合に従って、テスト実行前に拡張機能をビルドします。
 * @see https://wxt.dev/guide/essentials/e2e-testing.html
 */
async function globalSetup(_config: FullConfig) {
  console.log('Building extension for E2E tests...');

  try {
    // WXT拡張機能をChrome用にビルド
    execSync('bun run build', {
      stdio: 'inherit',
      cwd: globalThis.process?.cwd() || '',
    });
    console.log('Extension build completed successfully');
  } catch (error) {
    console.error('Failed to build extension:', error);
    throw error;
  }
}

export default globalSetup;
