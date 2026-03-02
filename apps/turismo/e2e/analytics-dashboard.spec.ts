import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard - Testes E2E', () => {
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
      await page.goto('http://localhost:3000/analytics-dashboard', {
        waitUntil: 'networkidle',
        timeout: 60000,
      });
    } catch (error) {
      console.log('Erro ao carregar página, tentando novamente:', error);
      await login(page);
      await page.goto('http://localhost:3000/analytics-dashboard', {
        waitUntil: 'networkidle',
        timeout: 60000,
      });
    }
    const buildErrorOverlay = page.locator('dialog[aria-label="Build Error"], [role="dialog"]:has-text("Build Error")');
    await expect(buildErrorOverlay).toHaveCount(0);
  });

  test('Analytics Dashboard - Carregamento e Elementos Principais', async ({ page }) => {
    // Verificar título sem depender do body
    const title = page.locator('h1, [data-testid="page-title"]');
    await expect(title).toContainText(/Analytics Dashboard/i);
    
    // Verificar seções principais
    await expect(page.locator('text=Métricas Principais')).toBeVisible();
    await expect(page.locator('text=Gráficos de Performance')).toBeVisible();
    await expect(page.locator('text=Análise de Tendências')).toBeVisible();
    
    // Verificar métricas
    await expect(page.locator('text=Receita Total')).toBeVisible();
    await expect(page.locator('text=Total de Reservas')).toBeVisible();
    await expect(page.locator('text=Taxa de Conversão')).toBeVisible();
    await expect(page.locator('text=Clientes Ativos')).toBeVisible();
  });

  test('Analytics Dashboard - Gráficos Interativos', async ({ page }) => {
    // Verificar se os gráficos Recharts estão presentes
    await expect(page.locator('.recharts-wrapper')).toBeVisible();
    
    // Verificar gráfico de receita mensal
    await expect(page.locator('text=Receita Mensal')).toBeVisible();
    
    // Verificar gráfico de reservas por status
    await expect(page.locator('text=Reservas por Status')).toBeVisible();
    
    // Verificar gráfico de destinos populares
    await expect(page.locator('text=Destinos Populares')).toBeVisible();
    
    // Verificar gráfico de performance de conversão
    await expect(page.locator('text=Performance de Conversão')).toBeVisible();
  });

  test('Analytics Dashboard - Filtros e Controles', async ({ page }) => {
    // Verificar filtros de período
    const periodFilter = page.locator('select[name="period"], [data-testid="period-filter"]');
    if (await periodFilter.isVisible()) {
      await periodFilter.selectOption('year');
      await page.waitForTimeout(1000);
      
      // Verificar se os gráficos atualizaram
      // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('.recharts-wrapper')).toBeVisible();
    }
    
    // Verificar filtros de métricas
    const metricsFilter = page.locator('select[name="metrics"], [data-testid="metrics-filter"]');
    if (await metricsFilter.isVisible()) {
      await metricsFilter.selectOption('revenue');
      await page.waitForTimeout(1000);
    }
    
    // Verificar filtros de segmentação
    const segmentFilter = page.locator('select[name="segment"], [data-testid="segment-filter"]');
    if (await segmentFilter.isVisible()) {
      await segmentFilter.selectOption('destination');
      await page.waitForTimeout(1000);
    }
  });

  test('Analytics Dashboard - Construtor de Relatórios', async ({ page }) => {
    // Verificar seção de construtor de relatórios
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Construtor de Relatórios')).toBeVisible();
    
    // Testar formulário de criação de relatório
    const titleInput = page.locator('input[name="title"], [data-testid="report-title"]');
    if (await titleInput.isVisible()) {
      await titleInput.fill('Relatório de Analytics - Teste');
    }
    
    const descriptionInput = page.locator('textarea[name="description"], [data-testid="report-description"]');
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('Relatório gerado automaticamente para teste');
    }
    
    // Testar seleção de formato
    const formatSelect = page.locator('select[name="format"], [data-testid="report-format"]');
    if (await formatSelect.isVisible()) {
      await formatSelect.selectOption('pdf');
    }
    
    // Testar seleção de métricas
    const metricsCheckboxes = page.locator('input[type="checkbox"][name="metrics"]');
    const checkboxCount = await metricsCheckboxes.count();
    if (checkboxCount > 0) {
      await metricsCheckboxes.first().check();
      await metricsCheckboxes.nth(1).check();
    }
    
    // Testar botão de gerar relatório
    const generateButton = page.locator('button:has-text("Gerar Relatório")');
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test('Analytics Dashboard - Exportação de Dados', async ({ page }) => {
    // Verificar seção de exportação
    // Verificar se página carregou
    await expect(page.locator('body')).toBeVisible();
    
    await expect(page.locator('text=Exportação de Dados')).toBeVisible();
    
    // Testar exportação PDF
    const pdfButton = page.locator('button:has-text("PDF"), button[data-testid="export-pdf"]');
    if (await pdfButton.isVisible()) {
      await pdfButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Testar exportação Excel
    const excelButton = page.locator('button:has-text("Excel"), button[data-testid="export-excel"]');
    if (await excelButton.isVisible()) {
      await excelButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Testar exportação CSV
    const csvButton = page.locator('button:has-text("CSV"), button[data-testid="export-csv"]');
    if (await csvButton.isVisible()) {
      await csvButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Analytics Dashboard - Responsividade', async ({ page }) => {
    // Testar em mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verificar se o dashboard ainda é funcional
    await expect(page.locator('h1')).toContainText('Analytics Dashboard');
    await expect(page.locator('.recharts-wrapper')).toBeVisible();
    
    // Testar em tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verificar se o dashboard ainda é funcional
    await expect(page.locator('h1')).toContainText('Analytics Dashboard');
    await expect(page.locator('.recharts-wrapper')).toBeVisible();
  });

  test('Analytics Dashboard - Acessibilidade', async ({ page }) => {
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
    
    // Verificar se gráficos têm descrições
    const charts = page.locator('.recharts-wrapper');
    const chartCount = await charts.count();
    
    for (let i = 0; i < chartCount; i++) {
      const chart = charts.nth(i);
      const ariaLabel = await chart.getAttribute('aria-label');
      const title = await chart.getAttribute('title');
      
      // Gráficos devem ter descrições para acessibilidade
      expect(ariaLabel || title).toBeTruthy();
    }
  });

  test('Analytics Dashboard - Performance', async ({ page }) => {
    const startTime = Date.now();
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
    const loadTime = Date.now() - startTime;
    
    // Verificar se o carregamento foi rápido (menos de 5 segundos)
    expect(loadTime).toBeLessThan(5000);
    
    // Verificar se os gráficos carregaram
    await expect(page.locator('.recharts-wrapper')).toBeVisible();
  });
});
