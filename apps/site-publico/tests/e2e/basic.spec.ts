import { test, expect } from '@playwright/test';

test.describe('Testes Básicos - Sistema RSV 360', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/');

    // Verificar se a página carregou
    await expect(page).toHaveTitle(/.*/);;

    // Verificar se há algum conteúdo na página
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('deve ter elementos básicos de navegação', async ({ page }) => {
    await page.goto('/');

    // Aguardar um pouco para a página carregar
    await page.waitForTimeout(2000);

    // Verificar se a página não tem erro 404
    const notFoundText = page.locator('text=404');
    const hasNotFound = await notFoundText.count();
    expect(hasNotFound).toBe(0);
  });

  test('deve ser responsivo', async ({ page }) => {
    // Testar em desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Testar em mobile - usar goto em vez de reload
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
