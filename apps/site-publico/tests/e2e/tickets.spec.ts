/**
 * Testes E2E para fluxo completo de Tickets
 */

import { test, expect } from '@playwright/test';

test.describe('Sistema de Tickets - Fluxo Completo', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de autenticação
    await page.goto('/login');
    // Simular login (ajustar conforme necessário)
  });

  test('deve criar novo ticket', async ({ page }) => {
    await page.goto('/tickets');
    
    // Clicar em criar ticket
    await page.click('button:has-text("Novo Ticket")');
    
    // Preencher formulário
    await page.fill('input[name="subject"]', 'Problema no sistema');
    await page.fill('textarea[name="description"]', 'Descrição do problema');
    await page.selectOption('select[name="category"]', 'technical');
    await page.selectOption('select[name="priority"]', 'high');
    
    // Submeter
    await page.click('button[type="submit"]');
    
    // Verificar redirecionamento
    await expect(page).toHaveURL(/\/tickets\/\d+/);
    
    // Verificar se ticket foi criado
    await expect(page.locator('text=Problema no sistema')).toBeVisible();
  });

  test('deve listar tickets com filtros', async ({ page }) => {
    await page.goto('/tickets');
    
    // Aplicar filtro por status
    await page.selectOption('select[name="status"]', 'open');
    
    // Verificar que apenas tickets abertos são exibidos
    const tickets = page.locator('[data-testid="ticket-card"]');
    await expect(tickets.first()).toBeVisible();
  });

  test('deve adicionar comentário ao ticket', async ({ page }) => {
    await page.goto('/tickets/1');
    
    // Adicionar comentário
    await page.fill('textarea[name="comment"]', 'Comentário de teste');
    await page.click('button:has-text("Adicionar Comentário")');
    
    // Verificar se comentário foi adicionado
    await expect(page.locator('text=Comentário de teste')).toBeVisible();
  });

  test('deve atualizar status do ticket', async ({ page }) => {
    await page.goto('/tickets/1');
    
    // Alterar status
    await page.selectOption('select[name="status"]', 'in_progress');
    
    // Verificar atualização
    await expect(page.locator('text=Em Progresso')).toBeVisible();
  });

  test('deve atribuir ticket a usuário', async ({ page }) => {
    await page.goto('/tickets/1');
    
    // Atribuir ticket
    await page.click('button:has-text("Atribuir")');
    await page.selectOption('select[name="assign_to"]', '2');
    await page.click('button:has-text("Confirmar")');
    
    // Verificar atribuição
    await expect(page.locator('text=Atribuído a')).toBeVisible();
  });

  test('deve fazer upload de anexo', async ({ page }) => {
    await page.goto('/tickets/1');
    
    // Upload de arquivo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content')
    });
    
    // Verificar se anexo foi enviado
    await expect(page.locator('text=test.pdf')).toBeVisible();
  });
});
