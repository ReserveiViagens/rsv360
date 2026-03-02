import { test, expect } from '@playwright/test';

test.describe('Gestão de Reservas - Testes E2E', () => {
  async function login(page: import('@playwright/test').Page) {
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.fill('#email, input[type="email"]', 'admin@onion360.com');
    await page.fill('#password, input[type="password"]', 'admin123');
    await page.click('button[type="submit"]:has-text("Entrar"), button:has-text("Entrar")');
    await page.waitForURL('**/dashboard-rsv', { timeout: 60000 });
  }
  test.beforeEach(async ({ page }) => {
    try {
      await login(page);
      await page.goto('http://localhost:3000/reservations-rsv', {
        waitUntil: 'networkidle',
        timeout: 60000
      });
    } catch (error) {
      console.log('Erro ao carregar página, tentando novamente:', error);
      await login(page);
      await page.goto('http://localhost:3000/reservations-rsv', {
        waitUntil: 'networkidle',
        timeout: 60000
      });
    }
    const buildErrorOverlay = page.locator('dialog[aria-label="Build Error"], [role="dialog"]:has-text("Build Error")');
    await expect(buildErrorOverlay).toHaveCount(0);
  });

  test('Gestão de Reservas - Carregamento e Elementos Principais', async ({ page }) => {
    // Verificar título
    // Verificar se página carregou
    
    await expect(page.locator('h1')).toContainText('Gestão de Reservas');
    
    // Verificar seções principais
    await expect(page.locator('text=Calendário de Reservas')).toBeVisible();
    await expect(page.locator('text=Filtros')).toBeVisible();
    await expect(page.locator('text=Lista de Reservas')).toBeVisible();
    
    // Verificar botões de ação
    await expect(page.locator('button:has-text("Nova Reserva")')).toBeVisible();
    await expect(page.locator('button:has-text("Exportar")')).toBeVisible();
  });

  test('Gestão de Reservas - Calendário Interativo', async ({ page }) => {
    // Verificar se o calendário está presente
    await expect(page.locator('text=Calendário de Reservas')).toBeVisible();
    
    // Verificar controles do calendário
    await expect(page.locator('button:has-text("Mês")')).toBeVisible();
    await expect(page.locator('button:has-text("Semana")')).toBeVisible();
    await expect(page.locator('button:has-text("Dia")')).toBeVisible();
    
    // Testar navegação do calendário
    const nextButton = page.locator('button[aria-label*="próximo"], button[title*="próximo"]');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }
    
    const prevButton = page.locator('button[aria-label*="anterior"], button[title*="anterior"]');
    if (await prevButton.isVisible()) {
      await prevButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('Gestão de Reservas - Filtros e Busca', async ({ page }) => {
    // Verificar barra de busca
    const searchInput = page.locator('input[placeholder*="buscar"], input[placeholder*="pesquisar"]');
    await expect(searchInput).toBeVisible();
    
    // Testar busca
    await searchInput.fill('João Silva');
    await page.waitForTimeout(500);
    
    // Verificar filtros
    await expect(page.locator('text=Status')).toBeVisible();
    await expect(page.locator('text=Período')).toBeVisible();
    await expect(page.locator('text=Destino')).toBeVisible();
    
    // Testar filtro de status
    const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('confirmed');
      await page.waitForTimeout(500);
    }
    
    // Testar filtro de período
    const periodFilter = page.locator('select[name="period"], [data-testid="period-filter"]');
    if (await periodFilter.isVisible()) {
      await periodFilter.selectOption('this-month');
      await page.waitForTimeout(500);
    }
    
    // Testar filtro de destino
    const destinationFilter = page.locator('select[name="destination"], [data-testid="destination-filter"]');
    if (await destinationFilter.isVisible()) {
      await destinationFilter.selectOption('caldas-novas');
      await page.waitForTimeout(500);
    }
  });

  test('Gestão de Reservas - Modal de Nova Reserva', async ({ page }) => {
    // Clicar no botão de nova reserva
    await page.click('button:has-text("Nova Reserva")');
    
    // Verificar se o modal abriu
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Nova Reserva')).toBeVisible();
    
    // Testar preenchimento do formulário
    const customerSelect = page.locator('select[name="customerId"], [data-testid="customer-select"]');
    if (await customerSelect.isVisible()) {
      await customerSelect.selectOption({ index: 1 });
    }
    
    const packageSelect = page.locator('select[name="packageId"], [data-testid="package-select"]');
    if (await packageSelect.isVisible()) {
      await packageSelect.selectOption({ index: 1 });
    }
    
    // Testar campos de data
    const checkInInput = page.locator('input[name="checkIn"], [data-testid="checkin-input"]');
    if (await checkInInput.isVisible()) {
      await checkInInput.fill('2025-02-15');
    }
    
    const checkOutInput = page.locator('input[name="checkOut"], [data-testid="checkout-input"]');
    if (await checkOutInput.isVisible()) {
      await checkOutInput.fill('2025-02-18');
    }
    
    // Testar campo de valor
    const valueInput = page.locator('input[name="value"], [data-testid="value-input"]');
    if (await valueInput.isVisible()) {
      await valueInput.fill('1500');
    }
    
    // Testar seleção de status
    const statusSelect = page.locator('select[name="status"], [data-testid="status-select"]');
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('confirmed');
    }
    
    // Testar botão de salvar
    const saveButton = page.locator('button:has-text("Salvar"), button:has-text("Criar")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Fechar modal
    const closeButton = page.locator('button:has-text("Cancelar"), button[aria-label*="fechar"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  });

  test('Gestão de Reservas - Lista de Reservas', async ({ page }) => {
    // Verificar se a tabela de reservas está presente
    await expect(page.locator('table')).toBeVisible();
    
    // Verificar cabeçalhos da tabela
    await expect(page.locator('text=Cliente')).toBeVisible();
    await expect(page.locator('text=Destino')).toBeVisible();
    await expect(page.locator('text=Check-in')).toBeVisible();
    await expect(page.locator('text=Check-out')).toBeVisible();
    await expect(page.locator('text=Valor')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();
    await expect(page.locator('text=Ações')).toBeVisible();
    
    // Verificar se há dados na tabela
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Testar ações da tabela
    const firstRow = tableRows.first();
    const viewButton = firstRow.locator('button[title*="visualizar"], button[aria-label*="visualizar"]');
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(500);
    }
    
    const editButton = firstRow.locator('button[title*="editar"], button[aria-label*="editar"]');
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('Gestão de Reservas - Drag and Drop', async ({ page }) => {
    // Verificar se o calendário suporta drag and drop
    const calendar = page.locator('.calendar, [class*="calendar"]');
    if (await calendar.isVisible()) {
      // Testar drag and drop de reservas
      const bookingItem = page.locator('.booking-item, [class*="booking"]').first();
      if (await bookingItem.isVisible()) {
        const targetDate = page.locator('.calendar-day, [class*="day"]').nth(10);
        if (await targetDate.isVisible()) {
          await bookingItem.dragTo(targetDate);
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('Gestão de Reservas - Exportação', async ({ page }) => {
    // Testar exportação de dados
    const exportButton = page.locator('button:has-text("Exportar")');
    if (await exportButton.isVisible()) {
      await exportButton.click();
      
      // Verificar opções de exportação
      // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=PDF')).toBeVisible();
      // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Excel')).toBeVisible();
      // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=CSV')).toBeVisible();
      
      // Testar exportação PDF
      const pdfButton = page.locator('button:has-text("PDF")');
      if (await pdfButton.isVisible()) {
        await pdfButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('Gestão de Reservas - Responsividade', async ({ page }) => {
    // Testar em mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verificar se o dashboard ainda é funcional
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('h1')).toContainText('Gestão de Reservas');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('button:has-text("Nova Reserva")')).toBeVisible();
    
    // Testar em tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verificar se o dashboard ainda é funcional
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('h1')).toContainText('Gestão de Reservas');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('button:has-text("Nova Reserva")')).toBeVisible();
  });

  test('Gestão de Reservas - Acessibilidade', async ({ page }) => {
    // Verificar se elementos têm atributos de acessibilidade
    const interactiveElements = page.locator('button, input, select, textarea');
    const elementCount = await interactiveElements.count();
    
    for (let i = 0; i < elementCount; i++) {
      const element = interactiveElements.nth(i);
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      
      if (tagName === 'button') {
        const text = await element.textContent();
        const title = await element.getAttribute('title');
        const ariaLabel = await element.getAttribute('aria-label');
        
        // Botões devem ter texto, título ou aria-label
        expect(text || title || ariaLabel).toBeTruthy();
      }
    }
    
    // Verificar se a tabela tem cabeçalhos apropriados
    const tableHeaders = page.locator('th');
    const headerCount = await tableHeaders.count();
    expect(headerCount).toBeGreaterThan(0);
  });
});
