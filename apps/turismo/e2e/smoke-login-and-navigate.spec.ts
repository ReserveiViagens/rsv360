import { test, expect } from '@playwright/test';

test('SMOKE: login e navegação básica (dashboard, analytics, reservas)', async ({ page }) => {
  // Login (modo demo/admin)
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.fill('#email, input[type="email"]', 'admin@onion360.com');
  await page.fill('#password, input[type="password"]', 'admin123');
  await page.click('button[type="submit"]:has-text("Entrar"), button:has-text("Entrar")');
  await page.waitForURL('**/dashboard-rsv', { timeout: 60000 });

  // Dashboard
  await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();

  // Analytics
  await page.goto('http://localhost:3000/analytics-dashboard', { waitUntil: 'networkidle', timeout: 60000 });
  const buildErrorOverlay = page.locator('dialog[aria-label="Build Error"], [role="dialog"]:has-text("Build Error")');
  await expect(buildErrorOverlay).toHaveCount(0);
  await expect(page.locator('h1, [data-testid="page-title"]')).toContainText(/Analytics Dashboard/i);

  // Reservas
  await page.goto('http://localhost:3000/reservations-rsv', { waitUntil: 'networkidle', timeout: 60000 });
  await expect(page.locator('h1, [data-testid="page-title"]')).toContainText(/Gestão de Reservas/i);
});


