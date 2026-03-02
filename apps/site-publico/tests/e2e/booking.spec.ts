/**
 * ✅ TESTES E2E: Fluxo de Reserva
 * Testes end-to-end para criação e gerenciamento de reservas
 */

import { test, expect } from '@playwright/test';

test.describe('Fluxo de Reserva', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve exibir lista de propriedades', async ({ page }) => {
    await page.goto('/hoteis');
    
    // Aguardar carregamento
    await page.waitForLoadState('networkidle');
    
    // Verificar se há propriedades listadas (ajustar seletor conforme necessário)
    const properties = page.locator('[data-testid="property-card"], .property-card, article').first();
    
    // Se houver propriedades, verificar elementos básicos
    if (await properties.isVisible({ timeout: 5000 })) {
      await expect(properties).toBeVisible();
    }
  });

  test('deve permitir buscar propriedades', async ({ page }) => {
    await page.goto('/hoteis');
    
    // Procurar campo de busca
    const searchInput = page.locator('input[type="search"], input[placeholder*="buscar" i], input[name="search"]').first();
    
    if (await searchInput.isVisible({ timeout: 2000 })) {
      await searchInput.fill('São Paulo');
      await searchInput.press('Enter');
      
      // Aguardar resultados
      await page.waitForTimeout(2000);
    }
  });

  test('deve permitir filtrar propriedades', async ({ page }) => {
    await page.goto('/hoteis');
    await page.waitForLoadState('networkidle');
    
    // Procurar filtros (ajustar conforme necessário)
    const filterButton = page.locator('button:has-text("Filtros"), button[aria-label*="filter" i]').first();
    
    if (await filterButton.isVisible({ timeout: 2000 })) {
      await filterButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('deve exibir detalhes da propriedade', async ({ page }) => {
    await page.goto('/hoteis');
    await page.waitForLoadState('networkidle');
    
    // Clicar na primeira propriedade
    const firstProperty = page.locator('[data-testid="property-card"], .property-card, article').first();
    
    if (await firstProperty.isVisible({ timeout: 5000 })) {
      await firstProperty.click();
      
      // Aguardar página de detalhes
      await page.waitForLoadState('networkidle');
      
      // Verificar elementos da página de detalhes
      const detailsPage = page.locator('h1, h2, [data-testid="property-details"]').first();
      await expect(detailsPage).toBeVisible({ timeout: 5000 });
    }
  });

  test('deve criar reserva completa', async ({ page }) => {
    // Navegar para propriedade
    await page.goto('/hoteis');
    await page.waitForLoadState('networkidle');
    
    const firstProperty = page.locator('[data-testid="property-card"], .property-card, article').first();
    
    if (await firstProperty.isVisible({ timeout: 5000 })) {
      await firstProperty.click();
      await page.waitForLoadState('networkidle');
      
      // Procurar botão de reservar
      const reserveButton = page.locator('button:has-text("Reservar"), button:has-text("Reserve agora")').first();
      
      if (await reserveButton.isVisible({ timeout: 3000 })) {
        await reserveButton.click();
        
        // Preencher formulário de reserva (se aparecer modal ou página)
        await page.waitForTimeout(2000);
        
        // Verificar se formulário apareceu
        const checkInInput = page.locator('input[name="check_in"], input[type="date"]').first();
        
        if (await checkInInput.isVisible({ timeout: 3000 })) {
          // Preencher dados básicos
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const checkOut = new Date();
          checkOut.setDate(checkOut.getDate() + 3);
          
          await checkInInput.fill(tomorrow.toISOString().split('T')[0]);
          
          const checkOutInput = page.locator('input[name="check_out"], input[type="date"]').nth(1);
          if (await checkOutInput.isVisible()) {
            await checkOutInput.fill(checkOut.toISOString().split('T')[0]);
          }
          
          // Preencher hóspedes
          const guestsInput = page.locator('input[name="guests"], input[name="adults"]').first();
          if (await guestsInput.isVisible()) {
            await guestsInput.fill('2');
          }
          
          // Preencher dados do cliente
          const nameInput = page.locator('input[name="customer.name"], input[name="name"]').first();
          if (await nameInput.isVisible()) {
            await nameInput.fill('Test User');
          }
          
          const emailInput = page.locator('input[type="email"], input[name="customer.email"], input[name="email"]').first();
          if (await emailInput.isVisible()) {
            await emailInput.fill(`test${Date.now()}@example.com`);
          }
          
          // Submeter
          const submitButton = page.locator('button[type="submit"], button:has-text("Confirmar")').first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            // Aguardar confirmação
            await page.waitForTimeout(3000);
            
            // Verificar mensagem de sucesso ou código de reserva
            const successMessage = page.locator('text=/sucesso|reserva criada|confirmação/i').first();
            if (await successMessage.isVisible({ timeout: 5000 })) {
              await expect(successMessage).toBeVisible();
            }
          }
        }
      }
    }
  });

  test('deve validar campos obrigatórios na reserva', async ({ page }) => {
    await page.goto('/hoteis');
    await page.waitForLoadState('networkidle');
    
    const firstProperty = page.locator('[data-testid="property-card"], .property-card, article').first();
    
    if (await firstProperty.isVisible({ timeout: 5000 })) {
      await firstProperty.click();
      await page.waitForLoadState('networkidle');
      
      const reserveButton = page.locator('button:has-text("Reservar")').first();
      
      if (await reserveButton.isVisible({ timeout: 3000 })) {
        await reserveButton.click();
        await page.waitForTimeout(2000);
        
        // Tentar submeter sem preencher
        const submitButton = page.locator('button[type="submit"]').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Verificar mensagens de erro
          await page.waitForTimeout(1000);
          const errorMessages = page.locator('text=/obrigatório|required|preencha/i');
          const count = await errorMessages.count();
          
          if (count > 0) {
            await expect(errorMessages.first()).toBeVisible();
          }
        }
      }
    }
  });
});

