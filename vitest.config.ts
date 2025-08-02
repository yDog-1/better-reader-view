import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    environment: 'jsdom',
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
