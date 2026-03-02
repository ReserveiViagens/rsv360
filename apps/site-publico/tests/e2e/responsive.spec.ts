import { test, expect, devices } from '@playwright/test';

test.describe('Responsividade - Sistema RSV 360', () => {
  test('deve funcionar em desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/admin/dashboard');

    // Fazer login
    await page.fill('input[type="email"]', 'admin@rsv360.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Verificar se o dashboard está visível
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();

    // Verificar se a sidebar está visível
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Verificar se o conteúdo principal está visível
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
  });

  test('deve funcionar em tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/admin/dashboard');

    // Fazer login
    await page.fill('input[type="email"]', 'admin@rsv360.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Verificar se o dashboard está visível
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();

    // Verificar se a sidebar está colapsada ou em modo mobile
    const sidebar = page.locator('[data-testid="sidebar"]');
    const isCollapsed = await sidebar.getAttribute('data-collapsed');
    expect(isCollapsed).toBe('true');
  });

  test('deve funcionar em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/dashboard');

    // Fazer login
    await page.fill('input[type="email"]', 'admin@rsv360.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Verificar se o dashboard está visível
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();

    // Verificar se o menu mobile está presente
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

    // Verificar se a sidebar está oculta por padrão
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).not.toBeVisible();

    // Clicar no menu mobile
    await page.click('[data-testid="mobile-menu-button"]');

    // Verificar se a sidebar aparece
    await expect(sidebar).toBeVisible();
  });

  test('deve adaptar CMS para mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Fazer login
    await page.goto('/admin/dashboard');
    await page.fill('input[type="email"]', 'admin@rsv360.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Navegar para CMS
    await page.click('[data-testid="cms-link"]');

    // Verificar se o CMS está adaptado para mobile
    await expect(page.locator('[data-testid="cms-container"]')).toBeVisible();

    // Verificar se os cards de hotel estão em layout mobile
    const hotelCards = page.locator('[data-testid="hotel-card"]');
    await expect(hotelCards.first()).toBeVisible();

    // Verificar se os botões de ação estão acessíveis
    await expect(page.locator('[data-testid="add-hotel-button"]')).toBeVisible();
  });

  test('deve funcionar em diferentes orientações', async ({ page }) => {
    // Teste em landscape
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/admin/dashboard');

    await page.fill('input[type="email"]', 'admin@rsv360.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();

    // Teste em portrait
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();

    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
  });

  test('deve manter funcionalidade em telas pequenas', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }); // iPhone SE
    await page.goto('/admin/dashboard');

    // Fazer login
    await page.fill('input[type="email"]', 'admin@rsv360.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Verificar se ainda é funcional
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();

    // Verificar se os elementos não estão sobrepostos
    const mainContent = page.locator('[data-testid="main-content"]');
    const sidebar = page.locator('[data-testid="sidebar"]');

    // Em telas muito pequenas, a sidebar deve estar oculta
    await expect(sidebar).not.toBeVisible();
    await expect(mainContent).toBeVisible();
  });
});
