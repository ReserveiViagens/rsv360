const axios = require("axios");

const BASE_URL = "http://localhost:5000";

// Função para testar as APIs de Analytics
async function testAnalyticsAPIs() {
  console.log("📊 Iniciando testes das APIs de Analytics...\n");

  let authToken = null;

  try {
    // Teste 1: Login para obter token
    console.log("1️⃣ Fazendo login...");
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: "admin@rsv360.com",
      password: "admin123",
    });
    authToken = loginResponse.data.data.token;
    console.log("✅ Login realizado:", loginResponse.data.data.user.name);
    console.log("");

    // Teste 2: Overview das métricas
    console.log("2️⃣ Testando GET /api/analytics/overview...");
    const overviewResponse = await axios.get(
      `${BASE_URL}/api/analytics/overview`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );
    console.log("✅ Overview obtido:");
    console.log(
      "   Total de conteúdo:",
      overviewResponse.data.data.metrics.overview.totalContent,
    );
    console.log(
      "   Total de usuários:",
      overviewResponse.data.data.metrics.overview.totalUsers,
    );
    console.log(
      "   Usuários ativos:",
      overviewResponse.data.data.metrics.overview.activeUsers,
    );
    console.log(
      "   Uptime (horas):",
      overviewResponse.data.data.metrics.overview.uptime,
    );
    console.log("");

    // Teste 3: Métricas de conteúdo
    console.log("3️⃣ Testando GET /api/analytics/content...");
    const contentResponse = await axios.get(
      `${BASE_URL}/api/analytics/content`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );
    console.log("✅ Métricas de conteúdo:");
    console.log("   Total:", contentResponse.data.data.metrics.total);
    console.log("   Por tipo:", contentResponse.data.data.metrics.byType);
    console.log("   Por status:", contentResponse.data.data.metrics.byStatus);
    console.log(
      "   Tendências:",
      contentResponse.data.data.metrics.trends.length,
      "dias",
    );
    console.log("");

    // Teste 4: Métricas de usuários
    console.log("4️⃣ Testando GET /api/analytics/users...");
    const usersResponse = await axios.get(`${BASE_URL}/api/analytics/users`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ Métricas de usuários:");
    console.log("   Total:", usersResponse.data.data.metrics.total);
    console.log("   Ativos:", usersResponse.data.data.metrics.active);
    console.log("   Por role:", usersResponse.data.data.metrics.byRole);
    console.log(
      "   Tendências:",
      usersResponse.data.data.metrics.trends.length,
      "dias",
    );
    console.log("");

    // Teste 5: Métricas de performance
    console.log("5️⃣ Testando GET /api/analytics/performance...");
    const performanceResponse = await axios.get(
      `${BASE_URL}/api/analytics/performance`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );
    console.log("✅ Métricas de performance:");
    console.log(
      "   Chamadas de API:",
      performanceResponse.data.data.metrics.apiCalls,
    );
    console.log(
      "   Tempo de resposta:",
      performanceResponse.data.data.metrics.responseTime,
      "ms",
    );
    console.log(
      "   Taxa de erro:",
      performanceResponse.data.data.metrics.errorRate,
    );
    console.log(
      "   Uptime:",
      Math.floor(performanceResponse.data.data.metrics.uptime),
      "segundos",
    );
    console.log(
      "   Score de saúde:",
      performanceResponse.data.data.metrics.health,
    );
    console.log("");

    // Teste 6: Status de saúde
    console.log("6️⃣ Testando GET /api/analytics/health...");
    const healthResponse = await axios.get(`${BASE_URL}/api/analytics/health`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ Status de saúde:");
    console.log("   Status:", healthResponse.data.data.status);
    console.log("   Score:", healthResponse.data.data.healthScore);
    console.log("   Mensagem:", healthResponse.data.data.message);
    console.log("");

    // Teste 7: Tendências
    console.log("7️⃣ Testando GET /api/analytics/trends...");
    const trendsResponse = await axios.get(`${BASE_URL}/api/analytics/trends`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ Tendências:");
    console.log("   Período:", trendsResponse.data.data.period);
    console.log(
      "   Dados de conteúdo:",
      trendsResponse.data.data.content.length,
      "dias",
    );
    console.log(
      "   Dados de usuários:",
      trendsResponse.data.data.users.length,
      "dias",
    );
    console.log("");

    // Teste 8: Relatório completo
    console.log("8️⃣ Testando GET /api/analytics/report...");
    const reportResponse = await axios.get(`${BASE_URL}/api/analytics/report`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ Relatório completo:");
    console.log(
      "   Status geral:",
      reportResponse.data.data.report.summary.status,
    );
    console.log(
      "   Score de saúde:",
      reportResponse.data.data.report.summary.healthScore,
    );
    console.log(
      "   Total de conteúdo:",
      reportResponse.data.data.report.summary.totalContent,
    );
    console.log(
      "   Usuários ativos:",
      reportResponse.data.data.report.summary.activeUsers,
    );
    console.log(
      "   Mensagem:",
      reportResponse.data.data.report.summary.message,
    );
    console.log("");

    console.log("🎉 Todos os testes de Analytics passaram!");
    console.log("📊 Resumo dos testes:");
    console.log("   ✅ Overview das métricas");
    console.log("   ✅ Métricas de conteúdo");
    console.log("   ✅ Métricas de usuários");
    console.log("   ✅ Métricas de performance");
    console.log("   ✅ Status de saúde");
    console.log("   ✅ Tendências");
    console.log("   ✅ Relatório completo");
  } catch (error) {
    console.error("❌ Erro nos testes:", error.message);
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
    }
    if (error.code === "ECONNREFUSED") {
      console.log(
        "💡 Dica: Certifique-se de que o servidor está rodando na porta 5000",
      );
    }
  }
}

// Executar testes
testAnalyticsAPIs();
