import { test, expect } from '@playwright/test';
import { requireE2EAuthCredentials } from './auth-credentials';

test.describe('🚀 Teste Simples - Verificação de Correções', () => {
  test('deve carregar página inicial sem erros', async ({ page }) => {
    // Navegar para a página inicial
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar se a página carregou
    await expect(page.locator('body')).toBeVisible();
    
    // Verificar se não há erros de JavaScript
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Aguardar um pouco para capturar erros
    await page.waitForTimeout(2000);
    
    // Verificar se não há erros críticos
    const criticalErrors = errors.filter(error => 
      error.includes('useAuth deve ser usado') || 
      error.includes('useNotifications deve ser usado')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('deve fazer login e carregar dashboard', async ({ page }) => {
  const creds = requireE2EAuthCredentials(test);
    // Fazer login
    await page.goto('/login');
    await page.fill('input[type="email"]', creds.email);
    await page.fill('input[type="password"]', creds.password);
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    
    // Verificar se dashboard carregou
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[data-testid="company-title"]')).toContainText('Reservei Viagens');
  });
});
