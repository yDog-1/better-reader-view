/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

export default defineConfig({
  // @ts-ignore
  plugins: [WxtVitest(), vanillaExtractPlugin()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
  },
})