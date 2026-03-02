/**
 * Testes E2E para fluxo completo de fidelidade
 */

import { test, expect } from '@playwright/test';

test.describe('Programa de Fidelidade', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Implementar login antes dos testes
    // await page.goto('/login');
    // await page.fill('[name="email"]', 'test@example.com');
    // await page.fill('[name="password"]', 'password');
    // await page.click('button[type="submit"]');
  });

  test('deve visualizar pontos de fidelidade', async ({ page }) => {
    await page.goto('/loyalty');
    
    // Navegar para aba de pontos
    await page.click('text=Meus Pontos');
    
    // Verificar se pontos são exibidos
    await expect(page.locator('text=/\\d+/')).toBeVisible();
  });

  test('deve visualizar tiers disponíveis', async ({ page }) => {
    await page.goto('/loyalty');
    
    // Navegar para aba de tiers
    await page.click('text=Níveis');
    
    // Verificar se tiers são exibidos
    await expect(page.locator('text=Bronze')).toBeVisible();
    await expect(page.locator('text=Silver')).toBeVisible();
  });

  test('deve visualizar catálogo de recompensas', async ({ page }) => {
    await page.goto('/loyalty/rewards');
    
    // Verificar se recompensas são exibidas
    await expect(page.locator('text=Catálogo de Recompensas')).toBeVisible();
  });

  test('deve resgatar recompensa', async ({ page }) => {
    await page.goto('/loyalty/rewards');
    
    // Clicar em resgatar primeira recompensa disponível
    const redeemButton = page.locator('button:has-text("Resgatar")').first();
    
    if (await redeemButton.isVisible()) {
      await redeemButton.click();
      
      // Verificar se dialog de confirmação aparece
      await expect(page.locator('text=Confirmar Resgate')).toBeVisible();
      
      // Confirmar resgate
      await page.click('button:has-text("Confirmar")');
      
      // Verificar mensagem de sucesso
      await expect(page.locator('text=Resgate Confirmado')).toBeVisible();
    }
  });

  test('deve visualizar histórico de transações', async ({ page }) => {
    await page.goto('/loyalty');
    
    // Navegar para aba de histórico
    await page.click('text=Histórico');
    
    // Verificar se tabela de transações é exibida
    await expect(page.locator('text=Histórico de Transações')).toBeVisible();
  });
});

