import { defineConfig } from '@playwright/test';

const siteBase = process.env.RSV_FASE5_SITE_URL || 'http://localhost:3000';
const turismoBase = process.env.RSV_FASE5_TURISMO_URL || 'http://localhost:3005';

export default defineConfig({
  testDir: './fase5',
  timeout: 90_000,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'site-publico',
      use: { baseURL: siteBase },
      testMatch: /proposta-publica\.spec\.ts/,
    },
    {
      name: 'turismo',
      use: { baseURL: turismoBase },
      testMatch: /proposta-(editor|hitl)\.spec\.ts/,
    },
    {
      name: 'taxa-hospede',
      use: { baseURL: siteBase },
      testMatch: /taxa-hospede-wizard\.spec\.ts/,
      dependencies: ['site-publico', 'turismo'],
    },
  ],
  reporter: [['list'], ['html', { outputFolder: 'tests/e2e/artifacts/fase5-report', open: 'never' }]],
});
