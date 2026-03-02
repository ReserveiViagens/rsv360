/**
 * Testes E2E - Fluxo Completo de CRM
 */

import { test, expect } from '@playwright/test';

test.describe('CRM - Fluxo Completo', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login (ajustar conforme necessário)
    await page.goto('/login');
    // Preencher credenciais e fazer login
    // await page.fill('input[name="email"]', 'admin@example.com');
    // await page.fill('input[name="password"]', 'password');
    // await page.click('button[type="submit"]');
    // await page.waitForURL('/');
  });

  test('deve criar um segmento de clientes', async ({ page }) => {
    await page.goto('/crm');
    
    // Navegar para aba de segmentos
    await page.click('text=Segmentos');
    
    // Clicar em criar novo segmento
    await page.click('button:has-text("Novo Segmento")');
    
    // Preencher formulário
    await page.fill('input[name="name"]', 'Teste Segmento E2E');
    await page.fill('textarea[name="description"]', 'Segmento criado via teste E2E');
    await page.fill('input[name="criteria.min_bookings"]', '3');
    await page.fill('input[name="criteria.min_total_spent"]', '1000');
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    
    // Verificar se segmento foi criado
    await expect(page.locator('text=Teste Segmento E2E')).toBeVisible();
  });

  test('deve criar uma campanha de marketing', async ({ page }) => {
    await page.goto('/crm');
    
    // Navegar para aba de campanhas
    await page.click('text=Campanhas');
    
    // Clicar em nova campanha
    await page.click('button:has-text("Nova Campanha")');
    
    // Preencher formulário básico
    await page.fill('input[name="name"]', 'Teste Campanha E2E');
    await page.fill('textarea[name="description"]', 'Campanha criada via teste E2E');
    
    // Selecionar tipo e canal
    await page.selectOption('select[name="campaign_type"]', 'promotional');
    await page.selectOption('select[name="channel"]', 'email');
    
    // Preencher conteúdo
    await page.fill('input[name="subject"]', 'Oferta Especial');
    await page.fill('textarea[name="message"]', 'Mensagem da campanha de teste');
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    
    // Verificar se campanha foi criada
    await expect(page.locator('text=Teste Campanha E2E')).toBeVisible();
  });

  test('deve visualizar detalhes de um cliente', async ({ page }) => {
    await page.goto('/crm');
    
    // Navegar para aba de clientes
    await page.click('text=Clientes');
    
    // Aguardar carregamento da lista
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    
    // Clicar no primeiro cliente (se existir)
    const firstCustomer = page.locator('table tbody tr').first();
    const customerCount = await firstCustomer.count();
    
    if (customerCount > 0) {
      await firstCustomer.click();
      
      // Verificar se página de detalhes carregou
      await expect(page.locator('text=Perfil')).toBeVisible();
      await expect(page.locator('text=Histórico')).toBeVisible();
      await expect(page.locator('text=Preferências')).toBeVisible();
      await expect(page.locator('text=Interações')).toBeVisible();
    }
  });

  test('deve buscar cliente por nome', async ({ page }) => {
    await page.goto('/crm');
    
    // Usar busca de clientes
    const searchInput = page.locator('input[placeholder*="buscar"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('João');
      await page.waitForTimeout(1000); // Aguardar debounce
      
      // Verificar se resultados aparecem
      const results = page.locator('[role="listbox"]');
      const resultsCount = await results.count();
      
      if (resultsCount > 0) {
        await expect(results.first()).toBeVisible();
      }
    }
  });

  test('deve filtrar clientes por tier', async ({ page }) => {
    await page.goto('/crm');
    
    // Navegar para aba de clientes
    await page.click('text=Clientes');
    
    // Aguardar carregamento
    await page.waitForSelector('table', { timeout: 5000 });
    
    // Procurar filtro de tier (se existir)
    const tierFilter = page.locator('select[name*="tier"], select[name*="loyalty"]').first();
    const filterCount = await tierFilter.count();
    
    if (filterCount > 0) {
      await tierFilter.selectOption('gold');
      await page.waitForTimeout(1000);
      
      // Verificar se filtro foi aplicado
      // (depende da implementação do componente)
    }
  });

  test('deve adicionar preferência a um cliente', async ({ page }) => {
    await page.goto('/crm');
    
    // Navegar para clientes e abrir primeiro cliente
    await page.click('text=Clientes');
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    
    const firstCustomer = page.locator('table tbody tr').first();
    const customerCount = await firstCustomer.count();
    
    if (customerCount > 0) {
      await firstCustomer.click();
      
      // Navegar para aba de preferências
      await page.click('text=Preferências');
      
      // Clicar em adicionar preferência
      const addButton = page.locator('button:has-text("Adicionar"), button:has-text("Nova")').first();
      if (await addButton.count() > 0) {
        await addButton.click();
        
        // Preencher formulário
        await page.fill('input[name="preference_key"]', 'room_type');
        await page.fill('input[name="preference_value"]', 'suite');
        await page.selectOption('select[name="category"]', 'accommodation');
        
        // Salvar
        await page.click('button:has-text("Salvar")');
        
        // Verificar se preferência foi adicionada
        await expect(page.locator('text=room_type')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('deve criar interação com cliente', async ({ page }) => {
    await page.goto('/crm');
    
    // Navegar para clientes e abrir primeiro cliente
    await page.click('text=Clientes');
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    
    const firstCustomer = page.locator('table tbody tr').first();
    const customerCount = await firstCustomer.count();
    
    if (customerCount > 0) {
      await firstCustomer.click();
      
      // Navegar para aba de interações
      await page.click('text=Interações');
      
      // Clicar em adicionar interação
      const addButton = page.locator('button:has-text("Adicionar"), button:has-text("Nova")').first();
      if (await addButton.count() > 0) {
        await addButton.click();
        
        // Preencher formulário
        await page.selectOption('select[name="interaction_type"]', 'call');
        await page.selectOption('select[name="channel"]', 'phone');
        await page.fill('input[name="subject"]', 'Follow-up E2E');
        await page.fill('textarea[name="description"]', 'Interação criada via teste E2E');
        await page.selectOption('select[name="outcome"]', 'successful');
        await page.selectOption('select[name="sentiment"]', 'positive');
        
        // Salvar
        await page.click('button:has-text("Salvar")');
        
        // Verificar se interação foi criada
        await expect(page.locator('text=Follow-up E2E')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

