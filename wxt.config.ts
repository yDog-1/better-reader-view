import { defineConfig } from 'wxt';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ['activeTab', 'scripting'],
    action: {},
  },
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [
      vanillaExtractPlugin({
        identifiers: 'short',
      }),
    ],
  }),
});
