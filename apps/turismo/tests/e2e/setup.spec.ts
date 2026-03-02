import { test, expect } from '@playwright/test';

test.describe('Setup e Configuração', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se a página carrega
    await expect(page).toHaveTitle(/RSV|Reservei|Dashboard/);
    
    // Verificar se não há erros de console
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Aguardar um pouco para capturar erros
    await page.waitForTimeout(2000);
    
    // Verificar se não há erros críticos
    expect(consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('analytics') &&
      !error.includes('ads')
    )).toHaveLength(0);
  });

  test('deve ter estrutura básica de componentes', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se elementos básicos estão presentes
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('main, #__next, .app')).toBeVisible();
  });

  test('deve ser responsivo', async ({ page }) => {
    // Testar desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // Testar mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
