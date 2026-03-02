/**
 * Testes E2E para fluxo completo de analytics
 */

import { test, expect } from '@playwright/test';

test.describe('Analytics', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Implementar login antes dos testes
  });

  test('deve visualizar dashboard de analytics', async ({ page }) => {
    await page.goto('/analytics');
    
    // Verificar se dashboard é exibido
    await expect(page.locator('text=Analytics')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('deve visualizar previsão de receita', async ({ page }) => {
    await page.goto('/analytics');
    
    // Navegar para aba de previsão
    await page.click('text=Previsão');
    
    // Verificar se gráfico é exibido
    await expect(page.locator('text=Previsão de Receita')).toBeVisible();
  });

  test('deve visualizar heatmap de demanda', async ({ page }) => {
    await page.goto('/analytics');
    
    // Navegar para aba de heatmap
    await page.click('text=Heatmap');
    
    // Verificar se heatmap é exibido
    await expect(page.locator('text=Heatmap de Demanda')).toBeVisible();
  });

  test('deve visualizar insights', async ({ page }) => {
    await page.goto('/analytics');
    
    // Navegar para aba de insights
    await page.click('text=Insights');
    
    // Verificar se insights são exibidos
    await expect(page.locator('text=Insights e Recomendações')).toBeVisible();
  });

  test('deve exportar dados do dashboard', async ({ page }) => {
    await page.goto('/analytics');
    
    // Clicar em exportar
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Exportar Dados")');
    
    // Verificar se download foi iniciado
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('analytics');
  });
});

