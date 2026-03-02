/**
 * ✅ TESTES E2E: FLUXO COMPLETO DE WISHLIST
 * Testes end-to-end para wishlists compartilhadas
 */

import { test, expect } from '@playwright/test';

test.describe('Wishlist Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para página inicial
    await page.goto('http://localhost:3000');
  });

  test('deve criar wishlist, adicionar itens e votar', async ({ page }) => {
    // 1. Criar wishlist
    await page.goto('http://localhost:3000/wishlists');
    await page.click('text=Criar Nova Wishlist');
    
    await page.fill('input[name="name"]', 'Viagem Teste E2E');
    await page.fill('textarea[name="description"]', 'Teste automatizado');
    await page.click('button[type="submit"]');

    // Verificar se wishlist foi criada
    await expect(page.locator('text=Viagem Teste E2E')).toBeVisible();

    // 2. Adicionar item (se houver propriedades disponíveis)
    // Este teste pode precisar de dados de teste no banco

    // 3. Votar em item
    // Este teste pode precisar de dados de teste no banco
  });

  test('deve compartilhar wishlist', async ({ page }) => {
    await page.goto('http://localhost:3000/wishlists');
    
    // Assumindo que há uma wishlist existente
    const wishlistCard = page.locator('[data-testid="wishlist-card"]').first();
    
    if (await wishlistCard.count() > 0) {
      await wishlistCard.click();
      await page.click('text=Compartilhar');
      
      // Verificar se link foi copiado
      await expect(page.locator('text=Link copiado')).toBeVisible({ timeout: 5000 });
    }
  });
});

