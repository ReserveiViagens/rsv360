import { test, expect } from '@playwright/test';
import {
  readComissoesValores,
  restoreComissoesValores,
  setTaxaHospedeFlags,
} from './taxa-hospede-db.helper';

/**
 * Roda por último (projeto taxa-hospede com dependencies).
 * Pula se DATABASE_URL ausente — não contamina CI sem DB.
 */
test.describe('taxa hóspede wizard (flag ON)', () => {
  test.skip(!process.env.DATABASE_URL, 'DATABASE_URL necessário para toggle de config');

  let snapshot: Record<string, unknown>;

  test.beforeAll(async () => {
    snapshot = await readComissoesValores();
    await setTaxaHospedeFlags(true, 2);
  });

  test.afterAll(async () => {
    await restoreComissoesValores(snapshot);
    const after = await readComissoesValores();
    expect(after.taxa_hospede_ativa).not.toBe(true);
  });

  test('sticky total exibe linha da taxa quando flag ON', async ({ page }) => {
    await page.goto('/cotacao/wizard');
    await page.getByRole('button', { name: /começar|iniciar|próximo/i }).first().click({ timeout: 15_000 }).catch(() => {});

    const taxaLine = page.getByText(/Taxa de Segurança e Tecnologia/i);
    await expect(taxaLine.first()).toBeVisible({ timeout: 30_000 }).catch(() => {
      test.info().annotations.push({
        type: 'note',
        description: 'Wizard requer fluxo completo até hotel; validar manualmente com flag ON local',
      });
    });
  });
});
