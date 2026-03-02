import { test, expect } from '@playwright/test';

test.describe('Sistema de Notificações - Testes E2E', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('http://localhost:3000/dashboard-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    } catch (error) {
      console.log('Erro ao carregar página, tentando novamente:', error);
      await page.goto('http://localhost:3000/dashboard-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    }
    await page.waitForLoadState('networkidle');
  });

  test('Notificações - Demonstração de Diferentes Tipos', async ({ page }) => {
    // Verificar se o sistema de notificações está presente
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Sistema de Notificações')).toBeVisible();
    
    // Testar notificação de sucesso
    await page.click('text=Notificação de Sucesso');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('.toast, [class*="toast"]')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Operação realizada com sucesso')).toBeVisible();
    
    // Aguardar notificação desaparecer
    await page.waitForTimeout(3000);
    
    // Testar notificação de erro
    await page.click('text=Notificação de Erro');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('.toast, [class*="toast"]')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Erro ao processar solicitação')).toBeVisible();
    
    // Aguardar notificação desaparecer
    await page.waitForTimeout(3000);
    
    // Testar notificação de aviso
    await page.click('text=Notificação de Aviso');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('.toast, [class*="toast"]')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Atenção: Verifique os dados')).toBeVisible();
    
    // Aguardar notificação desaparecer
    await page.waitForTimeout(3000);
    
    // Testar notificação de info
    await page.click('text=Notificação de Info');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('.toast, [class*="toast"]')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Informação importante')).toBeVisible();
  });

  test('Notificações - Centro de Notificações', async ({ page }) => {
    // Verificar se o sino de notificações está presente
    const notificationBell = page.locator('[data-testid="notification-bell"], button[title*="notificação"]');
    if (await notificationBell.isVisible()) {
      await notificationBell.click();
      
      // Verificar se o centro de notificações abriu
      // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Centro de Notificações')).toBeVisible();
      
      // Verificar filtros
      // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Todas')).toBeVisible();
      // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Não lidas')).toBeVisible();
      
      // Fechar centro de notificações
      const closeButton = page.locator('button[aria-label*="fechar"], button[title*="fechar"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  });

  test('Notificações - Acessibilidade', async ({ page }) => {
    // Verificar se elementos têm atributos de acessibilidade
    const notificationElements = page.locator('[class*="notification"], [class*="toast"]');
    const elementCount = await notificationElements.count();
    
    if (elementCount > 0) {
      for (let i = 0; i < elementCount; i++) {
        const element = notificationElements.nth(i);
        const role = await element.getAttribute('role');
        const ariaLabel = await element.getAttribute('aria-label');
        
        // Elementos de notificação devem ter role ou aria-label
        expect(role || ariaLabel).toBeTruthy();
      }
    }
  });

  test('Notificações - Responsividade', async ({ page }) => {
    // Testar em mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verificar se o sistema de notificações ainda funciona
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Sistema de Notificações')).toBeVisible();
    
    // Testar notificação em mobile
    await page.click('text=Notificação de Sucesso');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('.toast, [class*="toast"]')).toBeVisible();
    
    // Testar em tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verificar se o sistema de notificações ainda funciona
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Sistema de Notificações')).toBeVisible();
  });
});
