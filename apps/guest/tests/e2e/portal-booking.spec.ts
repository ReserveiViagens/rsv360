import { test, expect, type Page } from '@playwright/test'

const PORTAL_PATH = process.env.PORTAL_TEST_PATH ?? '/reservations'
const COOKIE_NAME = 'rsv360_guest_portal_token'

async function setPortalCookie(page: Page, value: string) {
  await page.context().addCookies([
    {
      name: COOKIE_NAME,
      value,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ])
}

test.describe('Phase 7-G.2 — Portal Booking smoke', () => {
  test('happy path: token válido renderiza reservation card', async ({ page }) => {
    const token = process.env.PORTAL_TEST_TOKEN
    expect(token, 'PORTAL_TEST_TOKEN deve ter sido populado pelo global-setup').toBeTruthy()

    await page.goto('/')
    await setPortalCookie(page, token!)
    const response = await page.goto(PORTAL_PATH, { waitUntil: 'networkidle' })

    expect(response?.status(), 'portal deve responder 200 OK').toBeLessThan(400)
    await expect(page.getByTestId('reservation-card')).toBeVisible()
    await expect(page.getByText('Nenhuma reserva encontrada')).toHaveCount(0)
  })

  test('sem token: redireciona para /login', async ({ page }) => {
    await page.context().clearCookies()
    const response = await page.goto(PORTAL_PATH, { waitUntil: 'networkidle' })
    // Aceita: redirect 30x para /login OU 200 em página /login OU 401/403
    const finalUrl = page.url()
    const status = response?.status() ?? 0
    const ok = finalUrl.includes('/login') || status === 401 || status === 403
    expect(
      ok,
      `esperado redirect para /login OU 401/403; got url=${finalUrl} status=${status}`
    ).toBeTruthy()
  })

  test('localStorage sem cookie: permanece em /login sem loop', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/login')
    await page.evaluate((cookieName) => {
      window.localStorage.setItem(cookieName, 'orphan-local-token-f029')
    }, COOKIE_NAME)

    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    expect(page.url()).toContain('/login')
  })

  test('token inválido: redireciona para /login', async ({ page }) => {
    await page.goto('/')
    await setPortalCookie(page, 'invalid-token-xxx-7g2')
    const response = await page.goto(PORTAL_PATH, { waitUntil: 'networkidle' })
    const finalUrl = page.url()
    const status = response?.status() ?? 0
    expect(
      finalUrl.includes('/login') || status === 401 || status === 403,
      `esperado redirect para /login OU 401/403; got url=${finalUrl} status=${status}`
    ).toBeTruthy()
  })
})
