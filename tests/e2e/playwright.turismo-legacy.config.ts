import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './turismo-legacy-auth',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
  reporter: [['list']],
});
