const express = require('express');
const { SecurityConfig } = require('../../middleware/security-config');
const { DEV_CORS_ORIGIN_ALLOWLIST } = require('@rsv360/shared');

describe('SecurityConfig', () => {
  it('retorna CORS allowlist com admin :3004 e guest :3006 (localhost + 127.0.0.1)', () => {
    const prev = process.env.CORS_ORIGIN;
    delete process.env.CORS_ORIGIN;
    const corsOptions = SecurityConfig.getCorsOptions();
    expect(corsOptions.credentials).toBe(true);
    expect(corsOptions.origin).toEqual([...DEV_CORS_ORIGIN_ALLOWLIST]);
    expect(corsOptions.origin).toContain('http://localhost:3004');
    expect(corsOptions.origin).toContain('http://localhost:3006');
    expect(corsOptions.origin).toContain('http://127.0.0.1:3000');
    expect(corsOptions.origin).not.toContain('*');
    if (prev === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = prev;
  });

  it('adiciona endpoint de health check', async () => {
    const app = express();
    await SecurityConfig.initialize(app);
    SecurityConfig.setupHealthCheck(app);

    const routePaths = app.router.stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => layer.route.path);

    expect(routePaths).toContain('/health');
    expect(routePaths).toContain('/health/security');
  });
});
