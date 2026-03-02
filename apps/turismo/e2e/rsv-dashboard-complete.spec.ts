import { test, expect } from '@playwright/test';

test.describe('RSV 360 Dashboard - Testes Completos', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para o dashboard principal
    try {
      await page.goto('http://localhost:3000/dashboard-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    } catch (error) {
      console.log('Erro ao carregar página, tentando novamente:', error);
      await page.goto('http://localhost:3000/dashboard-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    }
    await page.waitForLoadState('networkidle');
  });

  test('Dashboard Principal - Carregamento e Elementos Básicos', async ({ page }) => {
    // Verificar título da página
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page).toHaveTitle(/Reservei Viagens/);
    
    // Verificar elementos principais do dashboard
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('h1')).toContainText('Dashboard');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Visão geral do seu negócio de viagens')).toBeVisible();
    
    // Verificar stats cards
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Total de Reservas')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Receita Mensal')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Clientes Ativos')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Destino Popular')).toBeVisible();
    
    // Verificar ações rápidas
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Ações Rápidas')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Nova Reserva')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Gestão de Reservas')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Catálogo de Viagens')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Sistema de Relatórios')).toBeVisible();
    
    // Verificar tabela de reservas recentes
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Reservas Recentes')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('table')).toBeVisible();
  });

  test('Sistema de Notificações - Funcionalidade Completa', async ({ page }) => {
    // Verificar se o sistema de notificações está presente
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Sistema de Notificações')).toBeVisible();
    
    // Testar botões de demonstração
    await page.click('text=Notificação de Sucesso');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('.toast')).toBeVisible();
    
    await page.click('text=Notificação de Erro');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('.toast')).toBeVisible();
    
    await page.click('text=Notificação de Aviso');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('.toast')).toBeVisible();
    
    await page.click('text=Notificação de Info');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('.toast')).toBeVisible();
  });

  test('Navegação - Ações Rápidas', async ({ page }) => {
    // Testar navegação para Analytics Dashboard
    await page.click('text=Analytics Dashboard');
    await page.waitForURL('**/analytics-dashboard');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('h1')).toContainText('Analytics Dashboard');
    
    // Voltar para o dashboard principal
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    // Testar navegação para Gestão de Reservas
    await page.click('text=Gestão de Reservas');
    await page.waitForURL('**/reservations-rsv');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('h1')).toContainText('Gestão de Reservas');
    
    // Voltar para o dashboard principal
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    // Testar navegação para Catálogo de Viagens
    await page.click('text=Catálogo de Viagens');
    await page.waitForURL('**/travel-catalog-rsv');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('h1')).toContainText('Catálogo de Viagens');
    
    // Voltar para o dashboard principal
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    // Testar navegação para Sistema de Relatórios
    await page.click('text=Sistema de Relatórios');
    await page.waitForURL('**/reports-rsv');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('h1')).toContainText('Sistema de Relatórios');
  });

  test('Responsividade - Mobile e Desktop', async ({ page }) => {
    // Testar em desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Testar em tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Testar em mobile
    await page.setViewportSize({ width: 375, height: 667 });
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Verificar se o menu mobile funciona
    const menuButton = page.locator('button[title="Abrir menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Reservas')).toBeVisible();
    }
  });

  test('Acessibilidade - ARIA Labels e Navegação por Teclado', async ({ page }) => {
    // Verificar se elementos têm títulos e aria-labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const title = await button.getAttribute('title');
      const ariaLabel = await button.getAttribute('aria-label');
      
      // Pelo menos um dos dois deve existir
      expect(title || ariaLabel).toBeTruthy();
    }
    
    // Testar navegação por teclado
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verificar se o foco está visível
    const focusedElement = page.locator(':focus');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Analytics Dashboard - Testes Completos', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('http://localhost:3000/analytics-dashboard', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    } catch (error) {
      console.log('Erro ao carregar página, tentando novamente:', error);
      await page.goto('http://localhost:3000/analytics-dashboard', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    }
    await page.waitForLoadState('networkidle');
  });

  test('Analytics Dashboard - Carregamento e Gráficos', async ({ page }) => {
    // Verificar título
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('h1')).toContainText('Analytics Dashboard');
    
    // Verificar se os gráficos estão presentes
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Receita Mensal')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Reservas por Status')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Destinos Populares')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Performance de Conversão')).toBeVisible();
    
    // Verificar se os gráficos Recharts estão renderizados
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('.recharts-wrapper')).toBeVisible();
  });

  test('Analytics Dashboard - Filtros e Interatividade', async ({ page }) => {
    // Testar filtros de período
    const periodFilter = page.locator('select[name="period"]');
    if (await periodFilter.isVisible()) {
      await periodFilter.selectOption('year');
      await page.waitForTimeout(1000);
    }
    
    // Testar filtros de métricas
    const metricsFilter = page.locator('select[name="metrics"]');
    if (await metricsFilter.isVisible()) {
      await metricsFilter.selectOption('revenue');
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Gestão de Reservas - Testes Completos', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('http://localhost:3000/reservations-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    } catch (error) {
      console.log('Erro ao carregar página, tentando novamente:', error);
      await page.goto('http://localhost:3000/reservations-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    }
    await page.waitForLoadState('networkidle');
  });

  test('Gestão de Reservas - Calendário e Funcionalidades', async ({ page }) => {
    // Verificar título
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('h1')).toContainText('Gestão de Reservas');
    
    // Verificar se o calendário está presente
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Calendário de Reservas')).toBeVisible();
    
    // Verificar filtros
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Filtros')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('input[placeholder*="buscar"]')).toBeVisible();
    
    // Testar filtros
    const searchInput = page.locator('input[placeholder*="buscar"]');
    await searchInput.fill('João');
    await page.waitForTimeout(500);
    
    // Testar filtro de status
    const statusFilter = page.locator('select[name="status"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('confirmed');
      await page.waitForTimeout(500);
    }
  });

  test('Gestão de Reservas - Modal de Reserva', async ({ page }) => {
    // Clicar no botão de nova reserva
    const newBookingButton = page.locator('button:has-text("Nova Reserva")');
    if (await newBookingButton.isVisible()) {
      await newBookingButton.click();
      
      // Verificar se o modal abriu
      // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Nova Reserva')).toBeVisible();
      
      // Testar preenchimento do formulário
      const customerSelect = page.locator('select[name="customerId"]');
      if (await customerSelect.isVisible()) {
        await customerSelect.selectOption({ index: 1 });
      }
      
      const packageSelect = page.locator('select[name="packageId"]');
      if (await packageSelect.isVisible()) {
        await packageSelect.selectOption({ index: 1 });
      }
      
      // Fechar modal
      const closeButton = page.locator('button:has-text("Cancelar")');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  });
});

test.describe('Catálogo de Viagens - Testes Completos', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('http://localhost:3000/travel-catalog-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    } catch (error) {
      console.log('Erro ao carregar página, tentando novamente:', error);
      await page.goto('http://localhost:3000/travel-catalog-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    }
    await page.waitForLoadState('networkidle');
  });

  test('Catálogo de Viagens - Filtros e Busca', async ({ page }) => {
    // Verificar título
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('h1')).toContainText('Catálogo de Viagens');
    
    // Verificar barra de busca
    const searchInput = page.locator('input[placeholder*="buscar"]');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(searchInput).toBeVisible();
    
    // Testar busca
    await searchInput.fill('Caldas Novas');
    await page.waitForTimeout(500);
    
    // Verificar filtros
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Destino')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Preço')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Duração')).toBeVisible();
    
    // Testar filtro de destino
    const destinationFilter = page.locator('select[name="destination"]');
    if (await destinationFilter.isVisible()) {
      await destinationFilter.selectOption('caldas-novas');
      await page.waitForTimeout(500);
    }
  });

  test('Catálogo de Viagens - Cards e Modal', async ({ page }) => {
    // Verificar se os cards de viagem estão presentes
    const travelCards = page.locator('.travel-card, [class*="card"]');
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(travelCards.first()).toBeVisible();
    
    // Clicar no primeiro card
    await travelCards.first().click();
    
    // Verificar se o modal abriu
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Detalhes da Viagem')).toBeVisible();
    
    // Fechar modal
    const closeButton = page.locator('button:has-text("Fechar"), button[aria-label*="fechar"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  });
});

test.describe('Sistema de Relatórios - Testes Completos', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('http://localhost:3000/reports-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    } catch (error) {
      console.log('Erro ao carregar página, tentando novamente:', error);
      await page.goto('http://localhost:3000/reports-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    }
    await page.waitForLoadState('networkidle');
  });

  test('Sistema de Relatórios - Funcionalidades Básicas', async ({ page }) => {
    // Verificar título
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('h1')).toContainText('Sistema de Relatórios');
    
    // Verificar seções principais
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Construtor de Relatórios')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Templates de Relatórios')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Exportação de Dados')).toBeVisible();
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Agendamento')).toBeVisible();
  });

  test('Sistema de Relatórios - Construtor de Relatórios', async ({ page }) => {
    // Testar formulário de criação de relatório
    const titleInput = page.locator('input[name="title"]');
    if (await titleInput.isVisible()) {
      await titleInput.fill('Relatório de Teste');
    }
    
    const descriptionInput = page.locator('textarea[name="description"]');
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('Descrição do relatório de teste');
    }
    
    // Testar seleção de formato
    const formatSelect = page.locator('select[name="format"]');
    if (await formatSelect.isVisible()) {
      await formatSelect.selectOption('pdf');
    }
    
    // Testar seleção de métricas
    const metricsCheckboxes = page.locator('input[type="checkbox"][name="metrics"]');
    const checkboxCount = await metricsCheckboxes.count();
    if (checkboxCount > 0) {
      await metricsCheckboxes.first().check();
    }
  });

  test('Sistema de Relatórios - Exportação', async ({ page }) => {
    // Testar botões de exportação
    const exportButtons = page.locator('button:has-text("Exportar")');
    const exportButtonCount = await exportButtons.count();
    
    if (exportButtonCount > 0) {
      // Testar exportação PDF
      const pdfButton = page.locator('button:has-text("PDF")');
      if (await pdfButton.isVisible()) {
        await pdfButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Testar exportação Excel
      const excelButton = page.locator('button:has-text("Excel")');
      if (await excelButton.isVisible()) {
        await excelButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });
});

test.describe('Performance e Acessibilidade - Testes Globais', () => {
  test('Performance - Tempo de Carregamento', async ({ page }) => {
    const startTime = Date.now();
    try {
      await page.goto('http://localhost:3000/dashboard-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    } catch (error) {
      console.log('Erro ao carregar página, tentando novamente:', error);
      await page.goto('http://localhost:3000/dashboard-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    }
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Verificar se o carregamento foi rápido (menos de 5 segundos)
    expect(loadTime).toBeLessThan(5000);
  });

  test('Acessibilidade - Verificação de ARIA', async ({ page }) => {
    try {
      await page.goto('http://localhost:3000/dashboard-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    } catch (error) {
      console.log('Erro ao carregar página, tentando novamente:', error);
      await page.goto('http://localhost:3000/dashboard-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    }
    
    // Verificar se elementos interativos têm labels apropriados
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
  });

  test('Responsividade - Breakpoints', async ({ page }) => {
    const breakpoints = [
      { width: 320, height: 568, name: 'Mobile Small' },
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Desktop Small' },
      { width: 1280, height: 720, name: 'Desktop' },
      { width: 1920, height: 1080, name: 'Desktop Large' }
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      try {
      await page.goto('http://localhost:3000/dashboard-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    } catch (error) {
      console.log('Erro ao carregar página, tentando novamente:', error);
      await page.goto('http://localhost:3000/dashboard-rsv', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    }
      await page.waitForLoadState('networkidle');
      
      // Verificar se o conteúdo principal está visível
      // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('h1')).toBeVisible();
      
      // Verificar se não há overflow horizontal
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = breakpoint.width;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Margem de erro
    }
  });
});
