import { test, expect } from '@playwright/test';

test.describe('CMS Administrativo - Sistema RSV 360', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/admin/dashboard');
    await page.fill('input[type="email"]', 'admin@rsv360.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('deve acessar página CMS', async ({ page }) => {
    // Navegar para o CMS
    await page.click('[data-testid="cms-link"]');
    await expect(page).toHaveURL(/.*cms/);

    // Verificar se a página CMS carregou
    await expect(page.locator('h1')).toContainText('CMS');
  });

  test('deve listar hotéis existentes', async ({ page }) => {
    await page.goto('/admin/cms');

    // Verificar se a seção de hotéis está visível
    await expect(page.locator('[data-testid="hotels-section"]')).toBeVisible();

    // Verificar se há hotéis listados
    await expect(page.locator('[data-testid="hotel-card"]')).toHaveCount.greaterThan(0);
  });

  test('deve criar novo hotel', async ({ page }) => {
    await page.goto('/admin/cms');

    // Clicar no botão de adicionar hotel
    await page.click('[data-testid="add-hotel-button"]');

    // Preencher formulário
    await page.fill('[data-testid="hotel-title"]', 'Hotel Teste E2E');
    await page.fill('[data-testid="hotel-description"]', 'Descrição do hotel teste');
    await page.fill('[data-testid="hotel-price"]', '299.99');
    await page.fill('[data-testid="hotel-location"]', 'Caldas Novas, GO');
    await page.selectOption('[data-testid="hotel-stars"]', '4');

    // Salvar
    await page.click('[data-testid="save-hotel-button"]');

    // Verificar se o hotel foi criado
    await expect(page.locator('text=Hotel Teste E2E')).toBeVisible();
  });

  test('deve editar hotel existente', async ({ page }) => {
    await page.goto('/admin/cms');

    // Clicar no botão de editar do primeiro hotel
    await page.click('[data-testid="edit-hotel-button"]:first-of-type');

    // Modificar o título
    await page.fill('[data-testid="hotel-title"]', 'Hotel Editado E2E');

    // Salvar
    await page.click('[data-testid="save-hotel-button"]');

    // Verificar se a alteração foi salva
    await expect(page.locator('text=Hotel Editado E2E')).toBeVisible();
  });

  test('deve deletar hotel', async ({ page }) => {
    await page.goto('/admin/cms');

    // Contar hotéis antes da exclusão
    const initialCount = await page.locator('[data-testid="hotel-card"]').count();

    // Clicar no botão de deletar do primeiro hotel
    await page.click('[data-testid="delete-hotel-button"]:first-of-type');

    // Confirmar exclusão
    await page.click('[data-testid="confirm-delete-button"]');

    // Verificar se o hotel foi removido
    await expect(page.locator('[data-testid="hotel-card"]')).toHaveCount(initialCount - 1);
  });

  test('deve gerenciar promoções', async ({ page }) => {
    await page.goto('/admin/cms');

    // Navegar para seção de promoções
    await page.click('[data-testid="promotions-tab"]');

    // Verificar se a seção de promoções está visível
    await expect(page.locator('[data-testid="promotions-section"]')).toBeVisible();

    // Adicionar nova promoção
    await page.click('[data-testid="add-promotion-button"]');
    await page.fill('[data-testid="promotion-title"]', 'Promoção E2E');
    await page.fill('[data-testid="promotion-discount"]', '20');
    await page.click('[data-testid="save-promotion-button"]');

    // Verificar se a promoção foi criada
    await expect(page.locator('text=Promoção E2E')).toBeVisible();
  });

  test('deve gerenciar atrações', async ({ page }) => {
    await page.goto('/admin/cms');

    // Navegar para seção de atrações
    await page.click('[data-testid="attractions-tab"]');

    // Verificar se a seção de atrações está visível
    await expect(page.locator('[data-testid="attractions-section"]')).toBeVisible();

    // Adicionar nova atração
    await page.click('[data-testid="add-attraction-button"]');
    await page.fill('[data-testid="attraction-title"]', 'Atração E2E');
    await page.fill('[data-testid="attraction-price"]', '50.00');
    await page.click('[data-testid="save-attraction-button"]');

    // Verificar se a atração foi criada
    await expect(page.locator('text=Atração E2E')).toBeVisible();
  });
});
