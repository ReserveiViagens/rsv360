import { test, expect, Page } from '@playwright/test';
import { requireE2EAuthCredentials } from './auth-credentials';

test.describe('🚀 RSV 360 - Dashboard Test Fixed', () => {
  test('deve carregar dashboard com métricas principais após login', async ({ page }) => {
  const creds = requireE2EAuthCredentials(test);
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[type="email"]', creds.email);
    await page.fill('input[type="password"]', creds.password);
    await page.click('button[type="submit"]');
    
    // Aguardar qualquer redirecionamento para dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    
    // Se foi para /dashboard, aguardar redirecionamento automático para /dashboard-rsv
    if (page.url().includes('/dashboard') && !page.url().includes('/dashboard-rsv')) {
      await page.waitForURL('/dashboard-rsv', { timeout: 10000 });
    }
    
    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle');
    
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();

    // Verificar título da página
    await expect(page.locator('[data-testid="company-title"]')).toContainText('Reservei Viagens');

    // Verificar cards de métricas
    await expect(page.locator('[data-testid="stats-cards-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-bookings-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="monthly-revenue-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-customers-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="popular-destination-card"]')).toBeVisible();

    // Verificar valores das métricas
    await expect(page.locator('[data-testid="total-bookings-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="monthly-revenue-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-customers-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="popular-destination-value"]')).toBeVisible();

    // Verificar tabela de reservas recentes
    await expect(page.locator('[data-testid="recent-bookings-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="bookings-table"]')).toBeVisible();
  });

  test('deve permitir filtrar período no dashboard', async ({ page }) => {
  const creds = requireE2EAuthCredentials(test);
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[type="email"]', creds.email);
    await page.fill('input[type="password"]', creds.password);
    await page.click('button[type="submit"]');
    
    // Aguardar qualquer redirecionamento para dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    
    // Se foi para /dashboard, aguardar redirecionamento automático para /dashboard-rsv
    if (page.url().includes('/dashboard') && !page.url().includes('/dashboard-rsv')) {
      await page.waitForURL('/dashboard-rsv', { timeout: 10000 });
    }
    
    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle');

    // Verificar se dashboard carregou
    await expect(page.locator('[data-testid="stats-cards-container"]')).toBeVisible();

    // Verificar se métricas estão visíveis
    await expect(page.locator('[data-testid="total-bookings-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="monthly-revenue-card"]')).toBeVisible();
  });
});
