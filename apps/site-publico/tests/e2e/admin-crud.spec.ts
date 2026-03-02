import { test, expect } from '@playwright/test';

test('Fluxo Admin: login, abrir CMS, criar/editar/deletar hotel', async ({ page }) => {
  // Login
  await page.goto('/admin/login');
  await page.getByLabel('Senha do administrador').fill('admin-token-123');
  await page.getByRole('button', { name: 'Entrar no painel admin' }).click();

  // CMS carregado
  await expect(page.getByRole('heading', { name: 'Dashboard CMS' })).toBeVisible();

  // Abrir Novo Hotel
  await page.getByRole('button', { name: 'Novo Hotel' }).click();
  await expect(page.getByRole('heading', { name: 'Novo Hotel' })).toBeVisible();

  // Preencher básicos
  await page.getByLabel('Título *').fill('Hotel E2E');
  await page.getByLabel('Localização *').fill('Centro E2E');
  await page.getByLabel('Descrição *').fill('Hotel criado por teste E2E.');
  await page.getByLabel('Preço (R$) *').fill('123.45');
  await page.getByLabel('Avaliação (0-5) *').fill('4.5');

  // Salvar (sem mídias)
  await page.getByRole('button', { name: 'Salvar Hotel' }).click();

  // Verifica aparição na lista (pode exigir um reload dos dados)
  await expect(page.getByText('Hotel E2E')).toBeVisible({ timeout: 10000 });

  // Editar
  const card = page.getByText('Hotel E2E').first();
  await card.locator('..').getByRole('button', { name: 'Editar' }).click();
  await page.getByLabel('Título *').fill('Hotel E2E (editado)');
  await page.getByRole('button', { name: 'Salvar Hotel' }).click();
  await expect(page.getByText('Hotel E2E (editado)')).toBeVisible({ timeout: 10000 });

  // Deletar
  const card2 = page.getByText('Hotel E2E (editado)').first();
  page.once('dialog', d => d.accept());
  await card2.locator('..').getByRole('button', { name: 'Deletar' }).click();
  await expect(page.getByText('Hotel E2E (editado)')).toHaveCount(0);
});
