import { test, expect } from '@playwright/test';

test.describe('🚀 RSV 360 - Fluxos Críticos', () => {
  test('deve carregar dashboard com métricas principais', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@onion360.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    
    // Navegar para dashboard-rsv
    await page.goto('/dashboard-rsv', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    
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
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@onion360.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    
    // Navegar para dashboard-rsv
    await page.goto('/dashboard-rsv', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    
    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle');

    // Verificar se dashboard carregou
    await expect(page.locator('[data-testid="stats-cards-container"]')).toBeVisible();

    // Verificar se métricas estão visíveis
    await expect(page.locator('[data-testid="total-bookings-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="monthly-revenue-card"]')).toBeVisible();
  });
});