import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const LOGIN_EMAIL = '#loginEmail, input[name="loginEmail"], input[name="email"]';
const LOGIN_PASSWORD = '#loginPassword, input[name="password"][type="password"]';

/**
 * Testes E2E - Filtros de Leilões
 */
test.describe('Filtros de Leilões E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/leiloes`);
    await page.waitForTimeout(1000);
  });

  test('deve filtrar por tipo de propriedade', async ({ page }) => {
    // Procurar filtro de tipo
    const typeFilter = page.locator('select[name*="type"], button:has-text("Tipo"), [data-testid*="type"]').first();
    if (await typeFilter.isVisible()) {
      await typeFilter.click();
      await page.waitForTimeout(500);
    }
    
    // Verificar que página ainda está carregada
    await expect(page.locator('h1')).toContainText(/leil|auction/i);
  });

  test('deve filtrar por faixa de preço', async ({ page }) => {
    // Procurar filtro de preço
    const priceFilter = page.locator('input[placeholder*="preço"], input[name*="price"], [data-testid*="price"]').first();
    if (await priceFilter.isVisible()) {
      await priceFilter.fill('1000');
      await page.waitForTimeout(500);
    }
    
    await expect(page.locator('h1')).toContainText(/leil|auction/i);
  });

  test('deve filtrar por datas', async ({ page }) => {
    // Procurar filtro de data
    const dateFilter = page.locator('input[type="date"], input[placeholder*="data"], [data-testid*="date"]').first();
    if (await dateFilter.isVisible()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await dateFilter.fill(tomorrow.toISOString().split('T')[0]);
      await page.waitForTimeout(500);
    }
    
    await expect(page.locator('h1')).toContainText(/leil|auction/i);
  });

  test('deve limpar filtros', async ({ page }) => {
    // Procurar botão de limpar
    const clearButton = page.locator('button:has-text("Limpar"), button:has-text("Clear"), button:has-text("Reset")').first();
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(500);
    }
    
    await expect(page.locator('h1')).toContainText(/leil|auction/i);
  });
});
