import { test, expect } from '@playwright/test'

async function assertNoConsoleErrors(page: any) {
  const errors: string[] = []
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  return () => {
    expect(errors, `Erros de console encontrados: \n${errors.join('\n')}`).toEqual([])
  }
}

test.describe('Páginas públicas', () => {
  test('Hoteis: carrega e renderiza cards dinamicamente', async ({ page }) => {
    const assertNoErrors = await assertNoConsoleErrors(page)
    await page.goto('/hoteis')

    await expect(page.getByRole('heading', { name: 'Hotéis em Caldas Novas' })).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Hotéis em Caldas Novas' })).toBeVisible()

    // Deve existir ao menos um CTA de reservar (conteúdo dinâmico)
    const reservarBtn = page.getByRole('button', { name: /RESERVAR AGORA/i })
    await expect(reservarBtn).toBeVisible({ timeout: 10000 })

    // Botão flutuante do WhatsApp
    await expect(page.getByRole('link', { name: 'Falar no WhatsApp' })).toBeVisible()

    assertNoErrors()
  })

  test('Promoções: carrega e possui CTAs visíveis', async ({ page }) => {
    const assertNoErrors = await assertNoConsoleErrors(page)
    await page.goto('/promocoes')

    await expect(page.getByRole('heading', { name: 'Promoções Especiais' })).toBeVisible()

    // CTA pode variar conforme destaque
    await expect(
      page.getByRole('button', { name: /APROVEITAR|QUERO ESTA OFERTA/i })
    ).toBeVisible()

    await expect(page.getByRole('link', { name: 'Falar no WhatsApp' })).toBeVisible()

    assertNoErrors()
  })

  test('Atrações: carrega e exibe CTA principal', async ({ page }) => {
    const assertNoErrors = await assertNoConsoleErrors(page)
    await page.goto('/atracoes')

    await expect(page.getByRole('heading', { name: 'Atrações Turísticas' })).toBeVisible()
    await expect(page.getByRole('button', { name: '📍 COMO CHEGAR + DICAS' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Falar no WhatsApp' })).toBeVisible()

    assertNoErrors()
  })

  test('Ingressos: carrega e exibe CTA de compra', async ({ page }) => {
    const assertNoErrors = await assertNoConsoleErrors(page)
    await page.goto('/ingressos')

    await expect(page.getByRole('heading', { name: 'Ingressos para Parques' })).toBeVisible()
    await expect(page.getByRole('button', { name: /COMPRAR/i })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Falar no WhatsApp' })).toBeVisible()

    assertNoErrors()
  })
})
