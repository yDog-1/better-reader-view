import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    environment: 'happy-dom',
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    setupFiles: ['./tests/setup-integration.ts'],
    include: ['tests/*-integration.test.{ts,tsx}'],
  },
});
