import { test, expect } from '@playwright/test';
import { createPublicProposta, loginStaffToken } from './helpers';

test.describe('Editor de proposta (turismo)', () => {
  test('carrega editor e permite editar título', async ({ page, request }) => {
    const token = await loginStaffToken(request);
    const proposta = await createPublicProposta(request, token);

    await page.addInitScript((accessToken) => {
      localStorage.setItem('access_token', accessToken);
    }, token);

    await page.goto(`/propostas/${proposta.id}`);

    await expect(page.getByText('Editor de proposta')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(`Editar proposta #${proposta.id}`)).toBeVisible();

    const tituloInput = page.locator('input').first();
    await tituloInput.fill('Proposta Editada E2E');
    await page.getByRole('button', { name: /salvar/i }).click();

    await expect(page.getByText('Proposta Editada E2E')).toBeVisible({ timeout: 10_000 });
  });
});
