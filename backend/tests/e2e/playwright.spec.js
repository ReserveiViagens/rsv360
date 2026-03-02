const { test, expect } = require('@playwright/test');

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const DASHBOARD_TURISMO_URL = process.env.DASHBOARD_TURISMO_URL || 'http://localhost:3005';

// Seletores da página de login (FormField usa id=loginEmail; senha usa id=loginPassword)
const LOGIN_EMAIL = '#loginEmail, input[name="loginEmail"], input[name="email"]';
const LOGIN_PASSWORD = '#loginPassword, input[name="password"][type="password"]';

/**
 * Testes E2E - Autenticação
 */
test.describe('Autenticação E2E', () => {
  test('deve fazer login e acessar área logada', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    
    // Preencher formulário de login (loginEmail, loginPassword na página real)
    await page.fill(LOGIN_EMAIL, 'admin@test.com');
    await page.fill(LOGIN_PASSWORD, 'password123');
    await page.click('button[type="submit"]');
    
    // Verificar redirecionamento (site redireciona para /minhas-reservas)
    await expect(page).toHaveURL(/\/(minhas-reservas|dashboard|reservas)/);
  });

  test('deve bloquear acesso sem autenticação', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/cms`);
    
    // Deve redirecionar para login
    await expect(page).toHaveURL(/.*login/);
  });
});

/**
 * Testes E2E - Leilões
 */
test.describe('Leilões E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.fill(LOGIN_EMAIL, 'admin@test.com');
    await page.fill(LOGIN_PASSWORD, 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(minhas-reservas|dashboard|admin\/cms)/);
  });

  test('deve criar um novo leilão', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/cms`);
    
    // Abrir tab Leilões e clicar em "Novo Leilão"
    await page.click('text=Leilões');
    await page.click('text=Novo Leilão');
    
    // Preencher formulário
    await page.fill('input[name="title"]', 'Test Auction E2E');
    await page.fill('input[name="start_price"]', '100');
    await page.fill('input[name="start_date"]', new Date().toISOString().split('T')[0]);
    await page.fill('input[name="end_date"]', new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    
    // Submeter
    await page.click('button[type="submit"]');
    
    // Verificar sucesso
    await expect(page.locator('.toast, .notification')).toContainText(/sucesso|success/i);
  });

  test('deve listar leilões ativos', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/leiloes`);
    
    await expect(page.locator('h1')).toContainText(/leil|auction/i);
    
    const hasAuctions = await page.locator('[data-testid="auction-card"], .auction-card, a[href*="/leiloes/"]').count() > 0;
    const hasEmptyMessage = await page.locator('text=Nenhum leilão').count() > 0;
    
    expect(hasAuctions || hasEmptyMessage).toBeTruthy();
  });

  test('deve fazer um lance em um leilão', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/leiloes`);
    
    const firstAuction = page.locator('[data-testid="auction-card"], .auction-card, a[href*="/leiloes/"]').first();
    if (await firstAuction.count() > 0) {
      await firstAuction.click();
      
      // Preencher valor do lance
      await page.fill('input[name="bid_amount"]', '150');
      await page.click('button:has-text("Fazer Lance")');
      
      // Verificar confirmação
      await expect(page.locator('.toast, .notification')).toContainText(/lance|bid/i);
    }
  });
});

/**
 * Testes E2E - Flash Deals
 */
test.describe('Flash Deals E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.fill(LOGIN_EMAIL, 'admin@test.com');
    await page.fill(LOGIN_PASSWORD, 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(minhas-reservas|dashboard|admin\/cms)/);
  });

  test('deve criar um flash deal', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/cms`);
    
    // Navegar para tab Flash Deals
    await page.click('text=Flash Deals');
    
    // Clicar em criar novo
    await page.click('button:has-text("Novo Flash Deal")');
    
    // Preencher formulário
    await page.fill('input[name="title"]', 'Test Flash Deal E2E');
    await page.fill('input[name="original_price"]', '200');
    await page.fill('input[name="discount_percentage"]', '20');
    
    // Submeter
    await page.click('button[type="submit"]');
    
    // Verificar sucesso
    await expect(page.locator('.toast, .notification')).toContainText(/sucesso|success/i);
  });

  test('deve reservar um flash deal', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/flash-deals`);
    
    const firstDeal = page.locator('[data-testid="flash-deal-card"], .auction-card, a[href*="/flash-deals/"], [class*="card"]').first();
    if (await firstDeal.count() > 0) {
      await firstDeal.click();
      
      // Clicar em reservar
      await page.click('button:has-text("Reservar")');
      
      // Verificar confirmação
      await expect(page.locator('.toast, .notification')).toContainText(/reserva|booking/i);
    }
  });
});

/**
 * Testes E2E - Marketplace
 */
test.describe('Marketplace E2E', () => {
  test('deve listar listagens do marketplace', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/marketplace`);
    
    await expect(page.locator('h1')).toContainText(/marketplace/i);
    
    // Aguardar carregamento (spinner ou resultado)
    await page.locator('text=Carregando listagens').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    
    await page.fill('input[placeholder*="Buscar"]', 'hotel');
    await page.waitForTimeout(500);
    
    // Listagens: link "Ver Detalhes" ou cards; vazio: "Nenhuma listagem encontrada"
    const hasListings = await page.locator('a[href^="/marketplace/"]').count() > 0;
    const hasEmptyMessage = await page.locator('text=Nenhuma listagem').count() > 0;
    
    expect(hasListings || hasEmptyMessage).toBeTruthy();
  });

  test('deve filtrar por preço', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/marketplace`);
    
    await page.locator('text=Carregando listagens').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    
    await page.fill('input[placeholder*="Preço mín"]', '100');
    await page.fill('input[placeholder*="Preço máx"]', '500');
    await page.waitForTimeout(500);
    
    // Página deve continuar exibindo o título (filtros aplicados sem erro)
    await expect(page.locator('h1')).toContainText(/marketplace/i);
  });
});

/**
 * Testes E2E - Google Hotel Ads
 */
test.describe('Google Hotel Ads E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.fill(LOGIN_EMAIL, 'admin@test.com');
    await page.fill(LOGIN_PASSWORD, 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(minhas-reservas|dashboard|admin\/cms)/);
  });

  test('deve criar um feed Google Hotel Ads', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/cms`);
    
    // Navegar para tab Google Hotel Ads
    await page.click('text=Google Hotel Ads');
    
    // Clicar em criar novo feed
    await page.click('button:has-text("Novo Feed")');
    
    // Preencher formulário
    await page.fill('input[name="feed_name"]', 'Test Feed E2E');
    await page.fill('input[name="generation_frequency"]', '60');
    
    // Submeter
    await page.click('button[type="submit"]');
    
    // Verificar sucesso
    await expect(page.locator('.toast, .notification')).toContainText(/sucesso|success/i);
  });

  test('deve gerar XML do feed', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/cms`);
    await page.click('text=Google Hotel Ads');
    
    // Clicar em gerar feed
    const generateButton = page.locator('button:has-text("Gerar")').first();
    if (await generateButton.count() > 0) {
      await generateButton.click();
      
      // Verificar confirmação
      await expect(page.locator('.toast, .notification')).toContainText(/gerado|generated/i);
    }
  });
});

/**
 * Testes E2E - Voice Commerce
 */
test.describe('Voice Commerce E2E', () => {
  test('deve visualizar chamadas de voice commerce', async ({ page }) => {
    // Dashboard Turismo (porta 3005)
    await page.goto(`${DASHBOARD_TURISMO_URL}/dashboard/voice-commerce`);
    
    await expect(page.locator('h1')).toContainText(/voice|commerce|chamadas/i);
  });
});

/**
 * Testes E2E - Afiliados
 */
test.describe('Afiliados E2E', () => {
  test('deve visualizar dashboard de afiliado', async ({ page }) => {
    // Dashboard Turismo (porta 3005)
    await page.goto(`${DASHBOARD_TURISMO_URL}/dashboard/affiliates`);
    
    await expect(page.locator('h1')).toContainText(/afiliado|affiliate/i);
  });
});

module.exports = {};
