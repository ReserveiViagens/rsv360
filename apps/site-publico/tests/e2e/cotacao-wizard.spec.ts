import { expect, test } from '@playwright/test';

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function calendarDayLabel(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function pickCalendarDay(page: import('@playwright/test').Page, iso: string) {
  const target = new Date(`${iso}T12:00:00`);
  const label = calendarDayLabel(iso);

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const dayButton = page.getByRole('button', { name: label });
    if (await dayButton.isVisible().catch(() => false)) {
      await dayButton.click();
      return;
    }

    const caption = page.locator('[class*="caption_label"], .rdp-caption_label').first();
    const captionText = ((await caption.textContent().catch(() => '')) ?? '').toLowerCase();
    const targetMonth = target.toLocaleDateString('pt-BR', { month: 'long' }).toLowerCase();
    const targetYear = String(target.getFullYear());

    if (captionText.includes(targetMonth) && captionText.includes(targetYear)) {
      throw new Error(`Dia não encontrado no calendário: ${iso}`);
    }

    await page.locator('button.rdp-button_next, .rdp-button_next').first().click();
  }

  throw new Error(`Não foi possível navegar até a data: ${iso}`);
}

async function selectWizardDateRange(
  page: import('@playwright/test').Page,
  checkIn: string,
  checkOut: string,
) {
  await page.getByTestId('wizard-date-range-trigger').first().click();
  await pickCalendarDay(page, checkIn);
  await pickCalendarDay(page, checkOut);
  await expect(page.getByTestId('wizard-date-range-trigger').first()).toContainText(
    formatDisplayDate(checkIn),
  );
}

async function navigateToStep7(page: import('@playwright/test').Page) {
  const checkIn = futureDate(14);
  const checkOut = futureDate(17);

  await selectWizardDateRange(page, checkIn, checkOut);
  await page.getByRole('button', { name: /Próximo: escolher hotel/i }).click();
  await expect(page.getByText(/Passo 2 de 8/i)).toBeVisible({ timeout: 16000 });

  const hotelCard = page.getByRole('button', { name: /Selecionar/i }).first();
  if (await hotelCard.isVisible().catch(() => false)) {
    await hotelCard.click();
  }
  await page.getByRole('button', { name: /Próximo: diversão/i }).click();
  const nextAttractions = page.getByRole('button', { name: /Próximo: atrações/i });
  await expect(nextAttractions).toBeVisible({ timeout: 20000 });
  await expect(nextAttractions).toBeEnabled({ timeout: 30000 });
  await nextAttractions.click();
  await page.getByRole('button', { name: /Próximo: café da manhã/i }).click();
  await page.getByRole('button', { name: /Selecionar/i }).first().click();
  await page.getByRole('button', { name: /Próximo: kit acomodação/i }).click();
  await page.getByRole('button', { name: /Selecionar/i }).first().click();
  await page.getByRole('button', { name: /Ver meu roteiro/i }).click();
  await expect(page.getByText(/Passo 7 de 8/i)).toBeVisible({ timeout: 16000 });
  await expect(page.getByTestId('roteiro-sticky-header')).toBeVisible();
}

async function navigateToStep8(page: import('@playwright/test').Page) {
  await navigateToStep7(page);
  await page.getByRole('button', { name: /Aprovar Roteiro/i }).click();
  await expect(page.getByText(/Passo 8 de 8/i)).toBeVisible();
}

test.describe('Wizard Cotação — fluxo completo', () => {
  test('carrega wizard 8 passos na /cotacao', async ({ page }) => {
    await page.goto('/cotacao');
    await expect(page.getByText(/Passo 1 de 8/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Datas e hóspedes/i).first()).toBeVisible();
    await expect(page.getByTestId('wizard-date-range-trigger')).toBeVisible();
  });

  test('restaura datas do draft após reload', async ({ page }) => {
    test.setTimeout(60000);
    const checkIn = futureDate(14);
    const checkOut = futureDate(17);

    await page.goto('/cotacao');
    await selectWizardDateRange(page, checkIn, checkOut);
    await page.reload();
    await expect(page.getByText(/Passo 1 de 8/i)).toBeVisible({ timeout: 15000 });

    const trigger = page.getByTestId('wizard-date-range-trigger').first();
    await expect(trigger).toContainText(formatDisplayDate(checkIn));
    await expect(trigger).toContainText(formatDisplayDate(checkOut));
  });

  test('navega steps 0-7 com preview imersivo antes do pagamento', async ({ page }) => {
    await page.goto('/cotacao');
    await navigateToStep8(page);
    await expect(page.getByText(/Contato e pagamento|Falta pouco/i).first()).toBeVisible();
    await expect(page.getByLabel(/Seu nome|Nome/i)).toBeVisible();
  });

  test('submete passo 8 e redireciona para proposta comercial', async ({ page }) => {
    await page.route('**/api/cotacao/gerar-proposta', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          propostaId: 1,
          tokenPublico: 'rt-e2e-test-token',
          url: '/proposta/rt-e2e-test-token',
        }),
      });
    });

    await page.goto('/cotacao');
    await navigateToStep8(page);

    await page.getByLabel(/Seu nome|Nome/i).fill('Cliente E2E');
    await page.getByLabel(/WhatsApp|Telefone/i).fill('64999998888');
    await page.getByRole('button', { name: /Prefiro Pix/i }).click();
    await page.getByRole('button', { name: /Confirmar e gerar proposta/i }).click();

    await expect(page).toHaveURL(/\/proposta\/rt-e2e-test-token/, { timeout: 20000 });
  });

  test('API disponibilidade responde com configuracoesPainel', async ({ request }) => {
    const checkIn = futureDate(10);
    const checkOut = futureDate(13);
    const res = await request.get(
      `/api/cotacao/disponibilidade?checkIn=${checkIn}&checkOut=${checkOut}&adults=2&children=0`,
    );
    expect(res.status()).toBeLessThan(500);
    const json = await res.json();
    expect(json).toHaveProperty('success');
    if (json.success) {
      expect(json.data).toHaveProperty('configuracoesPainel');
    }
  });

  test('roteiro inválido mostra erro amigável', async ({ page }) => {
    await page.goto('/roteiro/token-invalido-teste');
    await expect(page.getByText(/não encontrado|Roteiro/i).first()).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Wizard Cotação — navegação premium do roteiro (Passo 7)', () => {
  test('controles prev/next disabled nos limites e navegação entre dias', async ({ page }) => {
    await page.goto('/cotacao');
    await navigateToStep7(page);

    await expect(page.getByTestId('roteiro-overview-compact')).toBeVisible();
    await expect(page.getByTestId('roteiro-day-indicator')).toHaveText(/Dia 1 de \d+/);
    await expect(page.getByTestId('roteiro-day-prev')).toBeDisabled();

    await page.getByTestId('roteiro-day-next').click();
    await expect(page.getByTestId('roteiro-day-indicator')).toHaveText(/Dia 2 de \d+/);
    await expect(page.getByTestId('roteiro-day-prev')).toBeEnabled();

    await page.getByRole('button', { name: 'Dia 3', exact: true }).click();
    await expect(page.getByTestId('roteiro-day-indicator')).toHaveText(/Dia 3 de \d+/);
    await expect(page.getByRole('button', { name: 'Dia 3', exact: true })).toHaveAttribute(
      'aria-current',
      'step',
    );

    const indicatorText = await page.getByTestId('roteiro-day-indicator').textContent();
    const totalMatch = indicatorText?.match(/de (\d+)/);
    const totalDays = totalMatch ? parseInt(totalMatch[1], 10) : 3;

    for (let day = 3; day < totalDays; day += 1) {
      await page.getByTestId('roteiro-day-next').click();
    }
    await expect(page.getByTestId('roteiro-day-indicator')).toHaveText(
      new RegExp(`Dia ${totalDays} de ${totalDays}`),
    );
    await expect(page.getByTestId('roteiro-day-next')).toBeDisabled();
  });

  test('exibe alça de swipe para navegação mobile no roteiro', async ({ page }) => {
    await page.goto('/cotacao');
    await navigateToStep7(page);

    await expect(page.getByTestId('roteiro-day-indicator')).toHaveText(/Dia 1 de \d+/);
    await expect(page.getByTestId('roteiro-swipe-handle')).toBeVisible();
    await expect(page.getByTestId('roteiro-day-slide')).toBeVisible();
  });

  test('teclado ArrowRight avança o dia no roteiro', async ({ page }) => {
    await page.goto('/cotacao');
    await navigateToStep7(page);

    await page.getByTestId('roteiro-day-slide').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('roteiro-day-indicator')).toHaveText(/Dia 2 de \d+/);
  });

  test('reset para Dia 1 ao voltar e reentrar no Passo 7', async ({ page }) => {
    await page.goto('/cotacao');
    await navigateToStep7(page);

    await page.getByTestId('roteiro-day-next').click();
    await page.getByTestId('roteiro-day-next').click();
    await expect(page.getByTestId('roteiro-day-indicator')).toHaveText(/Dia 3 de \d+/);

    await page.getByRole('button', { name: /Voltar: kit acomodação/i }).click();
    await expect(page.getByText(/Passo 6 de 8/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Ver meu roteiro/i }).click();
    await expect(page.getByText(/Passo 7 de 8/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('roteiro-day-indicator')).toHaveText(/Dia 1 de \d+/);
  });
});
