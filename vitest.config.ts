import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  plugins: [WxtVitest(), vanillaExtractPlugin()],
  test: {
    environment: 'happy-dom',
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
