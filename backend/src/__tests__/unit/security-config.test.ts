const express = require('express');
const { SecurityConfig } = require('../../middleware/security-config');

describe('SecurityConfig', () => {
  it('retorna configuração padrão de CORS', () => {
    const corsOptions = SecurityConfig.getCorsOptions();
    expect(corsOptions.credentials).toBe(true);
  });

  it('adiciona endpoint de health check', async () => {
    const app = express();
    await SecurityConfig.initialize(app);
    SecurityConfig.setupHealthCheck(app);

    const routePaths = app.router.stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => layer.route.path);

    expect(routePaths).toContain('/health');
  });
});
