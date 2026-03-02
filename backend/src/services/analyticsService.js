const logger = require("../config/logger");

class AnalyticsService {
  constructor() {
    this.metrics = {
      content: {
        total: 0,
        byType: {},
        byStatus: {},
        recent: [],
      },
      users: {
        total: 0,
        active: 0,
        byRole: {},
        recentLogins: [],
      },
      performance: {
        apiCalls: 0,
        responseTime: 0,
        errorRate: 0,
        uptime: 0,
      },
    };
  }

  // Atualizar métricas de conteúdo
  updateContentMetrics(contentData) {
    this.metrics.content.total = contentData.length;

    // Contar por tipo
    this.metrics.content.byType = contentData.reduce((acc, item) => {
      acc[item.page_type] = (acc[item.page_type] || 0) + 1;
      return acc;
    }, {});

    // Contar por status
    this.metrics.content.byStatus = contentData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    // Conteúdo recente (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    this.metrics.content.recent = contentData
      .filter((item) => new Date(item.created_at) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    logger.info("[ANALYTICS] Métricas de conteúdo atualizadas");
  }

  // Atualizar métricas de usuários
  updateUserMetrics(userData) {
    this.metrics.users.total = userData.length;
    this.metrics.users.active = userData.filter((user) => user.isActive).length;

    // Contar por role
    this.metrics.users.byRole = userData.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Logins recentes (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    this.metrics.users.recentLogins = userData
      .filter(
        (user) => user.lastLogin && new Date(user.lastLogin) >= sevenDaysAgo,
      )
      .sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin))
      .slice(0, 10);

    logger.info("[ANALYTICS] Métricas de usuários atualizadas");
  }

  // Atualizar métricas de performance
  updatePerformanceMetrics(apiCalls = 0, responseTime = 0, errors = 0) {
    this.metrics.performance.apiCalls += apiCalls;
    this.metrics.performance.responseTime = responseTime;
    this.metrics.performance.errorRate = errors;
    this.metrics.performance.uptime = process.uptime();

    logger.info("[ANALYTICS] Métricas de performance atualizadas");
  }

  // Obter métricas gerais
  getGeneralMetrics() {
    return {
      overview: {
        totalContent: this.metrics.content.total,
        totalUsers: this.metrics.users.total,
        activeUsers: this.metrics.users.active,
        uptime: Math.floor(this.metrics.performance.uptime / 3600), // em horas
      },
      content: this.metrics.content,
      users: this.metrics.users,
      performance: this.metrics.performance,
    };
  }

  // Obter métricas de conteúdo
  getContentMetrics() {
    return {
      total: this.metrics.content.total,
      byType: this.metrics.content.byType,
      byStatus: this.metrics.content.byStatus,
      recent: this.metrics.content.recent,
      trends: this.generateContentTrends(),
    };
  }

  // Obter métricas de usuários
  getUserMetrics() {
    return {
      total: this.metrics.users.total,
      active: this.metrics.users.active,
      byRole: this.metrics.users.byRole,
      recentLogins: this.metrics.users.recentLogins,
      trends: this.generateUserTrends(),
    };
  }

  // Obter métricas de performance
  getPerformanceMetrics() {
    return {
      apiCalls: this.metrics.performance.apiCalls,
      responseTime: this.metrics.performance.responseTime,
      errorRate: this.metrics.performance.errorRate,
      uptime: this.metrics.performance.uptime,
      health: this.calculateHealthScore(),
    };
  }

  // Gerar tendências de conteúdo (mock)
  generateContentTrends() {
    const days = 7;
    const trends = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      trends.push({
        date: date.toISOString().split("T")[0],
        hotels: Math.floor(Math.random() * 5) + 1,
        promotions: Math.floor(Math.random() * 3) + 1,
        attractions: Math.floor(Math.random() * 4) + 1,
      });
    }

    return trends;
  }

  // Gerar tendências de usuários (mock)
  generateUserTrends() {
    const days = 7;
    const trends = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      trends.push({
        date: date.toISOString().split("T")[0],
        logins: Math.floor(Math.random() * 10) + 1,
        newUsers: Math.floor(Math.random() * 3),
      });
    }

    return trends;
  }

  // Calcular score de saúde do sistema
  calculateHealthScore() {
    const uptime = this.metrics.performance.uptime;
    const errorRate = this.metrics.performance.errorRate;
    const responseTime = this.metrics.performance.responseTime;

    let score = 100;

    // Penalizar por tempo de resposta alto
    if (responseTime > 1000) score -= 20;
    else if (responseTime > 500) score -= 10;

    // Penalizar por taxa de erro alta
    if (errorRate > 0.1) score -= 30;
    else if (errorRate > 0.05) score -= 15;

    // Bonus por uptime alto
    if (uptime > 86400) score += 10; // Mais de 24h

    return Math.max(0, Math.min(100, score));
  }

  // Obter relatório completo
  getFullReport() {
    return {
      timestamp: new Date().toISOString(),
      general: this.getGeneralMetrics(),
      content: this.getContentMetrics(),
      users: this.getUserMetrics(),
      performance: this.getPerformanceMetrics(),
      summary: this.generateSummary(),
    };
  }

  // Gerar resumo executivo
  generateSummary() {
    const healthScore = this.calculateHealthScore();
    const totalContent = this.metrics.content.total;
    const activeUsers = this.metrics.users.active;

    let status = "excellent";
    if (healthScore < 80) status = "good";
    if (healthScore < 60) status = "warning";
    if (healthScore < 40) status = "critical";

    return {
      status,
      healthScore,
      totalContent,
      activeUsers,
      message: this.getStatusMessage(status, healthScore),
    };
  }

  // Obter mensagem de status
  getStatusMessage(status, score) {
    const messages = {
      excellent: `Sistema funcionando perfeitamente! Score: ${score}/100`,
      good: `Sistema estável com pequenas otimizações necessárias. Score: ${score}/100`,
      warning: `Sistema requer atenção. Score: ${score}/100`,
      critical: `Sistema com problemas críticos! Score: ${score}/100`,
    };

    return messages[status] || "Status desconhecido";
  }
}

module.exports = new AnalyticsService();
