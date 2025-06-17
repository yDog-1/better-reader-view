import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing";

export default defineConfig({
  plugins: [WxtVitest(), vanillaExtractPlugin()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup.ts"],
  },
});
