import { defineConfig } from '@playwright/test';

const siteBase = process.env.RSV_AUTH_OAUTH_SITE_URL || 'http://localhost:3000';
const backendBase = process.env.RSV_AUTH_V1_BACKEND_URL || 'http://localhost:3002';

export default defineConfig({
  testDir: './auth-oauth-mock',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: siteBase,
    extraHTTPHeaders: {
      Accept: 'text/html,application/json',
    },
  },
  projects: [
    {
      name: 'oauth-mock',
      use: { baseURL: siteBase },
    },
  ],
  reporter: [['list']],
  metadata: { backendBase },
});
