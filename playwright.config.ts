import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 * @see https://playwright.dev/docs/chrome-extensions
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: Boolean(globalThis.process?.env?.CI),
  /* Retry on CI only */
  retries: globalThis.process?.env?.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: globalThis.process?.env?.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video recording */
    video: 'retain-on-failure',
  },

  /* Configure projects for browser extension testing */
  projects: [
    {
      name: 'chrome-extension',
      use: {
        ...devices['Desktop Chrome'],
        /* Use Chromium for extension testing */
        channel: 'chromium',
      },
    },
  ],

  /* Build extension before running tests */
  globalSetup: './tests/e2e/global-setup.ts',
});
