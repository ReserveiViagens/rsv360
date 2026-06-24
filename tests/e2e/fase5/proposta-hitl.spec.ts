import { test, expect } from '@playwright/test';
import { createPublicProposta, loginStaffToken } from './helpers';

test.describe('Atendimento HITL (turismo)', () => {
  test('agente assume chat e envia mensagem', async ({ page, request }) => {
    const token = await loginStaffToken(request);
    const proposta = await createPublicProposta(request, token);

    await page.addInitScript((accessToken) => {
      localStorage.setItem('access_token', accessToken);
    }, token);

    await page.goto(`/propostas/${proposta.id}/atendimento`);

    await expect(page.getByText(/Atendimento —/)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('HITL:')).toBeVisible();

    const takeoverBtn = page.getByRole('button', { name: 'Assumir chat' });
    if (await takeoverBtn.isVisible()) {
      await takeoverBtn.click();
    }

    await page.getByPlaceholder('Resposta do consultor...').fill('Olá, sou seu consultor E2E', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByText('Olá, sou seu consultor E2E')).toBeVisible({ timeout: 15_000 });
  });
});
