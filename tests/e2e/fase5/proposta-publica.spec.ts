import { test, expect } from '@playwright/test';
import { createPublicProposta, loginStaffToken } from './helpers';

test.describe('Proposta pública (site-publico)', () => {
  test('exibe proposta, chat e botões aceitar/recusar', async ({ page, request }) => {
    const token = await loginStaffToken(request);
    const proposta = await createPublicProposta(request, token);

    await page.goto(`/proposta/${proposta.id}`);

    await expect(page.getByText('Proposta comercial')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('heading', { name: proposta.titulo })).toBeVisible();
    await expect(page.getByText('Cliente E2E Fase5')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Aceitar proposta' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Recusar' })).toBeVisible();
    await expect(page.getByText('Chat com consultor')).toBeVisible();

    await page.getByPlaceholder('Digite sua mensagem...').fill('Mensagem E2E Fase5');
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByText('Mensagem E2E Fase5')).toBeVisible({ timeout: 15_000 });
  });
});
