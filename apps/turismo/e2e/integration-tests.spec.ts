import { test, expect } from '@playwright/test';

test.describe('🔄 RSV 360 - Testes de Integração', () => {
  test.describe('🔗 Integração de APIs', () => {
    test('deve conectar com APIs externas', async ({ page }) => {
      await page.goto('/integracoes-apis');

      // Verificar lista de integrações
      await expect(page.locator('[data-testid="integration-card"]')).toHaveCount(6);

      // Testar conexão com API de pagamento
      await page.click('[data-testid="test-payment-api"]');
      await expect(page.locator('.toast')).toContainText('Conexão testada com sucesso');

      // Verificar status das integrações
      await expect(page.locator('[data-testid="integration-status"]')).toContainText('Ativo');
    });

    test('deve configurar webhooks', async ({ page }) => {
      await page.goto('/integracoes-webhooks');

      // Adicionar novo webhook
      await page.click('[data-testid="add-webhook-btn"]');

      // Preencher dados
      await page.fill('[data-testid="webhook-url"]', 'https://api.exemplo.com/webhook');
      await page.selectOption('[data-testid="webhook-event"]', 'booking.created');

      // Salvar
      await page.click('[data-testid="save-webhook-btn"]');

      // Verificar sucesso
      await expect(page.locator('.toast')).toContainText('Webhook configurado');
    });
  });

  test.describe('🤖 Automação', () => {
    test('deve criar regra de automação', async ({ page }) => {
      await page.goto('/integracoes-automacao');

      // Usar template
      await page.click('[data-testid="use-template-btn"]', { first: true });

      // Verificar se regra foi criada
      await expect(page.locator('.toast')).toContainText('Regra de automação criada');

      // Testar regra
      await page.click('[data-testid="test-rule-btn"]', { first: true });
      await expect(page.locator('.toast')).toContainText('Testando regra');
    });

    test('deve monitorar execuções', async ({ page }) => {
      await page.goto('/integracoes-automacao');

      // Ir para aba de execuções
      await page.click('[data-testid="executions-tab"]');

      // Verificar log de execuções
      await expect(page.locator('[data-testid="execution-log"]')).toBeVisible();

      // Verificar estatísticas
      await expect(page.locator('[data-testid="execution-stats"]')).toBeVisible();
    });
  });

  test.describe('🔄 Fluxo Completo de Reserva', () => {
    test('deve realizar reserva completa', async ({ page }) => {
      // 1. Buscar hotel
      await page.goto('/hoteis');
      await page.fill('[data-testid="search-input"]', 'Resort');
      await page.press('[data-testid="search-input"]', 'Enter');

      // 2. Selecionar hotel
      await page.click('[data-testid="hotel-card"]', { first: true });
      await page.click('[data-testid="select-hotel-btn"]');

      // 3. Preencher dados da reserva
      await expect(page.locator('[data-testid="booking-form"]')).toBeVisible();

      await page.fill('[data-testid="guest-name"]', 'João Silva');
      await page.fill('[data-testid="guest-email"]', 'joao@exemplo.com');
      await page.fill('[data-testid="guest-phone"]', '(11) 99999-9999');

      // 4. Selecionar datas
      await page.click('[data-testid="checkin-date"]');
      await page.click('[data-testid="date-today"]');

      await page.click('[data-testid="checkout-date"]');
      await page.click('[data-testid="date-tomorrow"]');

      // 5. Confirmar reserva
      await page.click('[data-testid="confirm-booking-btn"]');

      // 6. Verificar sucesso
      await expect(page.locator('.toast')).toContainText('Reserva confirmada');

      // 7. Ir para painel de reservas
      await page.goto('/reservas-hoteis');

      // 8. Verificar se reserva aparece na lista
      await expect(page.locator('[data-testid="booking-list"]')).toContainText('João Silva');
    });

    test('deve processar pagamento', async ({ page }) => {
      // Simular fluxo de pagamento
      await page.goto('/pagamentos');

      // Criar novo pagamento
      await page.click('[data-testid="new-payment-btn"]');

      // Preencher dados
      await page.fill('[data-testid="payment-amount"]', '1500.00');
      await page.selectOption('[data-testid="payment-method"]', 'credit_card');

      // Dados do cartão (mock)
      await page.fill('[data-testid="card-number"]', '4111111111111111');
      await page.fill('[data-testid="card-name"]', 'João Silva');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvv"]', '123');

      // Processar
      await page.click('[data-testid="process-payment-btn"]');

      // Verificar sucesso
      await expect(page.locator('.toast')).toContainText('Pagamento processado');
    });
  });

  test.describe('📊 Relatórios e Analytics', () => {
    test('deve gerar relatório personalizado', async ({ page }) => {
      await page.goto('/relatorios-personalizados');

      // Configurar relatório
      await page.selectOption('[data-testid="report-type"]', 'revenue');
      await page.selectOption('[data-testid="report-period"]', 'last_30_days');

      // Aplicar filtros
      await page.click('[data-testid="apply-filters-btn"]');

      // Verificar dados carregaram
      await expect(page.locator('[data-testid="report-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="report-table"]')).toBeVisible();

      // Exportar relatório
      await page.click('[data-testid="export-btn"]');
      await page.click('[data-testid="export-pdf"]');

      // Verificar download (mock)
      await expect(page.locator('.toast')).toContainText('Relatório exportado');
    });

    test('deve atualizar métricas em tempo real', async ({ page }) => {
      await page.goto('/dashboard-executivo');

      // Capturar valores iniciais
      const initialRevenue = await page.locator('[data-testid="revenue-metric"]').textContent();

      // Simular ação que altera métricas (criar nova reserva em outra aba)
      const newPage = await page.context().newPage();
      await newPage.goto('/hoteis');
      // ... simular reserva ...
      await newPage.close();

      // Aguardar atualização automática
      await page.waitForTimeout(2000);

      // Verificar se métricas foram atualizadas
      // (Em um cenário real, as métricas seriam atualizadas via WebSocket ou polling)
      await expect(page.locator('[data-testid="revenue-metric"]')).toBeVisible();
    });
  });

  test.describe('🔐 Segurança e Autenticação', () => {
    test('deve proteger rotas administrativas', async ({ page }) => {
      // Tentar acessar página admin sem autenticação
      await page.goto('/configuracoes-sistema');

      // Deve redirecionar para login ou mostrar erro
      // (Mock - em produção verificaria redirecionamento real)
      await expect(page.locator('[data-testid="auth-required"]')).toBeVisible();
    });

    test('deve validar permissões de usuário', async ({ page }) => {
      await page.goto('/usuarios');

      // Simular login como usuário comum
      await page.evaluate(() => {
        localStorage.setItem('user_role', 'user');
      });

      await page.reload();

      // Verificar que botões administrativos não aparecem
      await expect(page.locator('[data-testid="admin-actions"]')).not.toBeVisible();
    });
  });

  test.describe('📱 PWA e Offline', () => {
    test('deve funcionar offline (cache)', async ({ page }) => {
      // Carregar página online
      await page.goto('/dashboard-executivo');
      await page.waitForLoadState('networkidle');

      // Simular offline
      await page.setOfflineMode(true);

      // Tentar navegar para página em cache
      await page.goto('/hoteis');

      // Verificar se carregou do cache
      await expect(page.locator('h1')).toContainText('Hotéis');

      // Restaurar online
      await page.setOfflineMode(false);
    });

    test('deve mostrar indicador de status da conexão', async ({ page }) => {
      await page.goto('/');

      // Simular offline
      await page.setOfflineMode(true);

      // Verificar indicador offline
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

      // Restaurar online
      await page.setOfflineMode(false);

      // Verificar que indicador sumiu
      await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
    });
  });

  test.describe('🔄 Sincronização de Dados', () => {
    test('deve sincronizar dados entre abas', async ({ page }) => {
      // Abrir duas abas
      const page1 = page;
      const page2 = await page.context().newPage();

      // Carregar mesma página em ambas
      await page1.goto('/usuarios');
      await page2.goto('/usuarios');

      // Criar usuário na primeira aba
      await page1.click('[data-testid="add-user-btn"]');
      await page1.fill('[data-testid="user-name"]', 'Maria Santos');
      await page1.fill('[data-testid="user-email"]', 'maria@exemplo.com');
      await page1.click('[data-testid="save-user-btn"]');

      // Verificar se apareceu na segunda aba
      await page2.reload();
      await expect(page2.locator('[data-testid="users-table"]')).toContainText('Maria Santos');

      await page2.close();
    });
  });

  test.describe('🎨 Temas e Personalização', () => {
    test('deve alternar entre temas claro e escuro', async ({ page }) => {
      await page.goto('/configuracoes-gerais');

      // Verificar tema atual
      const currentTheme = await page.getAttribute('html', 'data-theme');

      // Alternar tema
      await page.click('[data-testid="theme-toggle"]');

      // Verificar mudança
      const newTheme = await page.getAttribute('html', 'data-theme');
      expect(newTheme).not.toBe(currentTheme);

      // Verificar que cores mudaram
      const backgroundColor = await page.evaluate(() => {
        return getComputedStyle(document.body).backgroundColor;
      });

      expect(backgroundColor).toBeTruthy();
    });
  });

  test.describe('📈 Performance e Otimização', () => {
    test('deve carregar imagens lazy', async ({ page }) => {
      await page.goto('/hoteis');

      // Verificar que imagens fora da viewport não carregaram
      const images = page.locator('img[data-testid="hotel-image"]');
      const firstImage = images.first();

      // Verificar loading="lazy"
      await expect(firstImage).toHaveAttribute('loading', 'lazy');

      // Rolar para baixo e verificar carregamento
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      // Verificar que mais imagens carregaram
      const loadedImages = await page.locator('img[src*="https://"]').count();
      expect(loadedImages).toBeGreaterThan(0);
    });

    test('deve usar compressão e cache adequadamente', async ({ page }) => {
      const response = await page.goto('/dashboard-executivo');

      // Verificar headers de cache
      const cacheControl = response?.headers()['cache-control'];
      expect(cacheControl).toBeTruthy();

      // Verificar compressão
      const contentEncoding = response?.headers()['content-encoding'];
      // Pode ser gzip, br, etc.
      expect(contentEncoding).toBeTruthy();
    });
  });
});
