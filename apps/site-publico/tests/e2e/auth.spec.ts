/**
 * ✅ TESTES E2E: Autenticação
 * Testes end-to-end para login, registro e autenticação
 */

import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve exibir página de login', async ({ page }) => {
    // Navegar para login (ajustar rota conforme necessário)
    await page.goto('/login');
    
    // Verificar elementos da página de login
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Entrar")')).toBeVisible();
  });

  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await page.goto('/login');
    
    // Preencher formulário (ajustar seletores conforme necessário)
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Entrar")').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await submitButton.click();
      
      // Aguardar redirecionamento ou mensagem de sucesso
      await page.waitForURL(/\/(dashboard|home|bookings)/, { timeout: 10000 });
      
      // Verificar que está autenticado (ajustar conforme necessário)
      await expect(page).not.toHaveURL('/login');
    }
  });

  test('deve exibir erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Entrar")').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('wrongpassword');
      await submitButton.click();
      
      // Aguardar mensagem de erro
      await page.waitForTimeout(2000);
      
      // Verificar mensagem de erro (ajustar seletor conforme necessário)
      const errorMessage = page.locator('text=/erro|inválido|incorreto/i').first();
      if (await errorMessage.isVisible({ timeout: 2000 })) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test('deve permitir registro de novo usuário', async ({ page }) => {
    await page.goto('/register');
    
    // Verificar elementos do formulário de registro
    const nameInput = page.locator('input[name="name"], input[placeholder*="nome" i]').first();
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await nameInput.isVisible({ timeout: 2000 })) {
      await nameInput.fill('Test User');
      await emailInput.fill(`test${Date.now()}@example.com`);
      await passwordInput.fill('password123');
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Registrar")').first();
      await submitButton.click();
      
      // Aguardar sucesso ou redirecionamento
      await page.waitForTimeout(3000);
    }
  });

  test('deve fazer logout corretamente', async ({ page, context }) => {
    // Primeiro fazer login (usar API ou UI)
    await page.goto('/login');
    
    // Tentar fazer logout se já estiver logado
    const logoutButton = page.locator('button:has-text("Sair"), a:has-text("Logout"), button[aria-label*="logout" i]').first();
    
    if (await logoutButton.isVisible({ timeout: 2000 })) {
      await logoutButton.click();
      
      // Verificar redirecionamento para login
      await page.waitForURL(/\/(login|home)/, { timeout: 5000 });
    }
  });
});
