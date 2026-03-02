import { test, expect, Page } from '@playwright/test';

test.describe('🚀 RSV 360 - Fluxos Críticos', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');

    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle');
  });

  test.describe('📊 Dashboard Principal', () => {
    test('deve carregar dashboard com métricas principais', async () => {
      await page.goto('/dashboard-executivo');

      // Verificar título da página
      await expect(page.locator('h1')).toContainText('Dashboard Executivo');

      // Verificar cards de métricas
      await expect(page.locator('[data-testid="metric-card"]')).toHaveCount(4);

      // Verificar gráficos carregaram
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="bookings-chart"]')).toBeVisible();

      // Verificar tabela de reservas recentes
      await expect(page.locator('[data-testid="recent-bookings"]')).toBeVisible();
    });

    test('deve permitir filtrar período no dashboard', async () => {
      await page.goto('/dashboard-executivo');

      // Clicar no filtro de período
      await page.click('[data-testid="period-filter"]');

      // Selecionar "Últimos 30 dias"
      await page.click('text="Últimos 30 dias"');

      // Aguardar atualização dos dados
      await page.waitForTimeout(1000);

      // Verificar se métricas foram atualizadas
      await expect(page.locator('[data-testid="metric-card"]').first()).toBeVisible();
    });
  });

  test.describe('🏨 Gestão de Hotéis', () => {
    test('deve listar hotéis cadastrados', async () => {
      await page.goto('/hoteis');

      // Verificar título
      await expect(page.locator('h1')).toContainText('Hotéis');

      // Verificar lista de hotéis
      await expect(page.locator('[data-testid="hotel-card"]')).toHaveCount(6);

      // Verificar informações do primeiro hotel
      const firstHotel = page.locator('[data-testid="hotel-card"]').first();
      await expect(firstHotel.locator('h3')).toBeVisible();
      await expect(firstHotel.locator('[data-testid="hotel-rating"]')).toBeVisible();
      await expect(firstHotel.locator('[data-testid="hotel-price"]')).toBeVisible();
    });

    test('deve permitir buscar hotéis', async () => {
      await page.goto('/hoteis');

      // Digitar no campo de busca
      await page.fill('[data-testid="search-input"]', 'Resort');
      await page.press('[data-testid="search-input"]', 'Enter');

      // Aguardar resultados
      await page.waitForTimeout(500);

      // Verificar se resultados contêm "Resort"
      const hotelCards = page.locator('[data-testid="hotel-card"]');
      const count = await hotelCards.count();

      for (let i = 0; i < count; i++) {
        const title = await hotelCards.nth(i).locator('h3').textContent();
        expect(title?.toLowerCase()).toContain('resort');
      }
    });

    test('deve abrir modal de detalhes do hotel', async () => {
      await page.goto('/hoteis');

      // Clicar no primeiro hotel
      await page.click('[data-testid="hotel-card"]', { first: true });

      // Verificar se modal abriu
      await expect(page.locator('[data-testid="hotel-modal"]')).toBeVisible();

      // Verificar conteúdo do modal
      await expect(page.locator('[data-testid="hotel-modal"] h2')).toBeVisible();
      await expect(page.locator('[data-testid="hotel-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="hotel-amenities"]')).toBeVisible();

      // Fechar modal
      await page.click('[data-testid="close-modal"]');
      await expect(page.locator('[data-testid="hotel-modal"]')).not.toBeVisible();
    });
  });

  test.describe('👥 Gestão de Clientes', () => {
    test('deve listar clientes cadastrados', async () => {
      await page.goto('/usuarios');

      // Verificar título
      await expect(page.locator('h1')).toContainText('Usuários');

      // Verificar tabela de clientes
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();

      // Verificar headers da tabela
      await expect(page.locator('th')).toContainText(['Nome', 'Email', 'Status', 'Ações']);

      // Verificar pelo menos um cliente listado
      await expect(page.locator('[data-testid="user-row"]')).toHaveCount(5);
    });

    test('deve permitir adicionar novo cliente', async () => {
      await page.goto('/usuarios');

      // Clicar em "Novo Cliente"
      await page.click('[data-testid="add-user-btn"]');

      // Verificar se modal abriu
      await expect(page.locator('[data-testid="user-modal"]')).toBeVisible();

      // Preencher formulário
      await page.fill('[data-testid="user-name"]', 'João Silva');
      await page.fill('[data-testid="user-email"]', 'joao@exemplo.com');
      await page.fill('[data-testid="user-phone"]', '(11) 99999-9999');

      // Salvar
      await page.click('[data-testid="save-user-btn"]');

      // Verificar mensagem de sucesso
      await expect(page.locator('.toast')).toContainText('Usuário criado com sucesso');

      // Verificar se modal fechou
      await expect(page.locator('[data-testid="user-modal"]')).not.toBeVisible();
    });
  });

  test.describe('💰 Sistema Financeiro', () => {
    test('deve carregar relatórios financeiros', async () => {
      await page.goto('/relatorios-financeiros');

      // Verificar título
      await expect(page.locator('h1')).toContainText('Relatórios Financeiros');

      // Verificar cards de métricas financeiras
      await expect(page.locator('[data-testid="financial-metric"]')).toHaveCount(4);

      // Verificar gráfico de receita
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();

      // Verificar tabela de transações
      await expect(page.locator('[data-testid="transactions-table"]')).toBeVisible();
    });

    test('deve permitir filtrar relatórios por período', async () => {
      await page.goto('/relatorios-financeiros');

      // Abrir filtro de período
      await page.click('[data-testid="period-selector"]');

      // Selecionar período personalizado
      await page.click('text="Período Personalizado"');

      // Verificar se calendário abriu
      await expect(page.locator('[data-testid="date-picker"]')).toBeVisible();
    });
  });

  test.describe('📞 Central de Atendimento', () => {
    test('deve carregar central de atendimento', async () => {
      await page.goto('/central-atendimento');

      // Verificar título
      await expect(page.locator('h1')).toContainText('Central de Atendimento');

      // Verificar cards de métricas
      await expect(page.locator('[data-testid="support-metric"]')).toHaveCount(4);

      // Verificar lista de tickets
      await expect(page.locator('[data-testid="tickets-list"]')).toBeVisible();
    });

    test('deve permitir criar novo ticket', async () => {
      await page.goto('/central-atendimento');

      // Clicar em "Novo Ticket"
      await page.click('[data-testid="new-ticket-btn"]');

      // Verificar modal
      await expect(page.locator('[data-testid="ticket-modal"]')).toBeVisible();

      // Preencher dados
      await page.fill('[data-testid="ticket-title"]', 'Problema com reserva');
      await page.fill('[data-testid="ticket-description"]', 'Cliente não consegue finalizar reserva');
      await page.selectOption('[data-testid="ticket-priority"]', 'high');

      // Salvar
      await page.click('[data-testid="save-ticket-btn"]');

      // Verificar sucesso
      await expect(page.locator('.toast')).toContainText('Ticket criado com sucesso');
    });
  });

  test.describe('🎯 Marketing e Campanhas', () => {
    test('deve carregar campanhas de marketing', async () => {
      await page.goto('/campanhas');

      // Verificar título
      await expect(page.locator('h1')).toContainText('Campanhas');

      // Verificar lista de campanhas
      await expect(page.locator('[data-testid="campaign-card"]')).toHaveCount(4);

      // Verificar métricas das campanhas
      const firstCampaign = page.locator('[data-testid="campaign-card"]').first();
      await expect(firstCampaign.locator('[data-testid="campaign-reach"]')).toBeVisible();
      await expect(firstCampaign.locator('[data-testid="campaign-conversion"]')).toBeVisible();
    });
  });

  test.describe('⚙️ Configurações', () => {
    test('deve carregar configurações gerais', async () => {
      await page.goto('/configuracoes-gerais');

      // Verificar título
      await expect(page.locator('h1')).toContainText('Configurações Gerais');

      // Verificar seções de configuração
      await expect(page.locator('[data-testid="company-config"]')).toBeVisible();
      await expect(page.locator('[data-testid="system-config"]')).toBeVisible();
      await expect(page.locator('[data-testid="notification-config"]')).toBeVisible();
    });

    test('deve permitir alterar configurações', async () => {
      await page.goto('/configuracoes-gerais');

      // Alterar nome da empresa
      await page.fill('[data-testid="company-name"]', 'Reservei Viagens RSV 360');

      // Salvar
      await page.click('[data-testid="save-config-btn"]');

      // Verificar sucesso
      await expect(page.locator('.toast')).toContainText('Configurações salvas com sucesso');
    });
  });

  test.describe('📱 Responsividade', () => {
    test('deve funcionar em dispositivos móveis', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Verificar se menu mobile aparece
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

      // Abrir menu mobile
      await page.click('[data-testid="mobile-menu-button"]');

      // Verificar navegação mobile
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

      // Fechar menu
      await page.click('[data-testid="mobile-menu-close"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
    });

    test('deve funcionar em tablets', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard-executivo');

      // Verificar layout tablet
      await expect(page.locator('[data-testid="metric-card"]')).toHaveCount(4);

      // Verificar que gráficos são responsivos
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    });
  });

  test.describe('🔍 Performance', () => {
    test('deve carregar páginas rapidamente', async () => {
      const pages = [
        '/dashboard-executivo',
        '/hoteis',
        '/usuarios',
        '/relatorios-financeiros',
        '/central-atendimento',
        '/campanhas'
      ];

      for (const pagePath of pages) {
        const startTime = Date.now();
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        // Páginas devem carregar em menos de 3 segundos
        expect(loadTime).toBeLessThan(3000);
        console.log(`📄 ${pagePath}: ${loadTime}ms`);
      }
    });
  });

  test.describe('♿ Acessibilidade', () => {
    test('deve ter estrutura semântica adequada', async () => {
      await page.goto('/dashboard-executivo');

      // Verificar heading hierarchy
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h2, h3, h4')).toHaveCountGreaterThan(0);

      // Verificar landmarks
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();

      // Verificar alt text em imagens
      const images = page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });

    test('deve ser navegável por teclado', async () => {
      await page.goto('/hoteis');

      // Focar no primeiro elemento interativo
      await page.keyboard.press('Tab');

      // Verificar se foco é visível
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Navegar por alguns elementos
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        await expect(page.locator(':focus')).toBeVisible();
      }
    });
  });
});
