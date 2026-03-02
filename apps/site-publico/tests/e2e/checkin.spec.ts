/**
 * Testes E2E para fluxo completo de Check-in Digital
 */

import { test, expect } from '@playwright/test';

test.describe('Check-in Digital - Fluxo Completo', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de autenticação
    await page.goto('/login');
    // Simular login (ajustar conforme necessário)
  });

  test('deve criar solicitação de check-in', async ({ page }) => {
    await page.goto('/checkin');
    
    // Preencher formulário
    await page.fill('input[name="booking_id"]', '1');
    await page.fill('input[name="property_id"]', '1');
    
    // Submeter
    await page.click('button[type="submit"]');
    
    // Verificar redirecionamento
    await expect(page).toHaveURL(/\/checkin\/\d+/);
    
    // Verificar se check-in foi criado
    await expect(page.locator('text=Check-in Solicitado')).toBeVisible();
  });

  test('deve exibir QR code após criação', async ({ page }) => {
    await page.goto('/checkin/1');
    
    // Verificar se QR code é exibido
    await expect(page.locator('img[alt*="QR Code"]')).toBeVisible();
    
    // Verificar código de check-in
    await expect(page.locator('text=/CHK-/')).toBeVisible();
  });

  test('deve permitir upload de documentos', async ({ page }) => {
    await page.goto('/checkin/1');
    
    // Clicar na aba de documentos
    await page.click('button:has-text("Documentos")');
    
    // Upload de documento
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'rg.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content')
    });
    
    // Verificar se documento foi enviado
    await expect(page.locator('text=Documento enviado')).toBeVisible();
  });

  test('deve processar check-in após verificação', async ({ page }) => {
    await page.goto('/checkin/1');
    
    // Simular verificação de documentos
    await page.click('button:has-text("Verificar Documentos")');
    
    // Aguardar processamento
    await expect(page.locator('text=Documentos verificados')).toBeVisible();
    
    // Processar check-in
    await page.click('button:has-text("Processar Check-in")');
    
    // Verificar status atualizado
    await expect(page.locator('text=Checked In')).toBeVisible();
  });

  test('deve processar check-out', async ({ page }) => {
    await page.goto('/checkin/1');
    
    // Verificar que check-in foi realizado
    await expect(page.locator('text=Checked In')).toBeVisible();
    
    // Processar check-out
    await page.click('button:has-text("Check-out")');
    
    // Preencher vistoria
    await page.fill('textarea[name="notes"]', 'Tudo em ordem');
    
    // Confirmar check-out
    await page.click('button:has-text("Confirmar Check-out")');
    
    // Verificar status atualizado
    await expect(page.locator('text=Checked Out')).toBeVisible();
  });

  test('deve escanear QR code', async ({ page }) => {
    await page.goto('/checkin/scan');
    
    // Simular escaneamento
    await page.fill('input[placeholder*="código"]', 'CHK-123456');
    
    // Verificar informações do check-in
    await expect(page.locator('text=Check-in encontrado')).toBeVisible();
    await expect(page.locator('text=/Booking ID:/')).toBeVisible();
  });
});
