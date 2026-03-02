// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Configuração do Playwright para testes E2E, Performance e Segurança
 */
module.exports = defineConfig({
  testDir: './tests',
  
  // Timeout para cada teste
  timeout: 30 * 1000,
  
  // Timeout para expectativas
  expect: {
    timeout: 5000
  },
  
  // Executar testes em paralelo
  fullyParallel: true,
  
  // Falhar no CI se você deixou test.only acidentalmente
  forbidOnly: !!process.env.CI,
  
  // Retry em CI
  retries: process.env.CI ? 2 : 0,
  
  // Workers em CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  // Compartilhar configuração entre projetos
  use: {
    // URL base para testes
    baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    
    // Rastrear traces em falhas
    trace: 'on-first-retry',
    
    // Screenshots em falhas
    screenshot: 'only-on-failure',
    
    // Vídeo em falhas
    video: 'retain-on-failure',
  },

  // Configurar projetos para diferentes tipos de teste
  projects: [
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'performance',
      testDir: './tests/performance',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'security',
      testDir: './tests/security',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Servidor web para desenvolvimento (opcional)
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:5000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
