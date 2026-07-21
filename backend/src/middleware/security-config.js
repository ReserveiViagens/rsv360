/**
 * RSV360 — Express security middleware (PR-05a headers + PR-05b CORS).
 * Helmet is the single source for security headers; branding must not overwrite them.
 * CSP left as-is on branding (PR-16). HSTS only when ENABLE_HSTS=true.
 * CORS allowlist via @rsv360/shared getCorsOriginAllowlist (never '*').
 */
const helmet = require('helmet');
const { getCorsOriginAllowlist } = require('@rsv360/shared');

class SecurityConfig {
  static async initialize(app) {
    this.configure(app);
    console.log('[SECURITY] Helmet security configuration applied');
  }

  static configure(app) {
    const enableHsts = process.env.ENABLE_HSTS === 'true';

    app.use(
      helmet({
        // Existing API CSP stays in brandingHeaders until PR-16 — do not introduce a new policy here.
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        hsts: enableHsts
          ? {
              maxAge: 15_552_000, // 180 days
              includeSubDomains: true,
              preload: false,
            }
          : false,
        noSniff: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        xssFilter: true,
      }),
    );
  }

  static setupHealthCheck(app) {
    app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'RSV360 Backend API',
        security: 'Helmet Active',
        author: 'Douglas P. Figueiredo',
        copyright: '© 2024-2026 Reservei Viagens LTDA',
        website: 'https://www.reserveiviagens.com.br',
      });
    });

    app.get('/health/security', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'RSV360 Backend API',
        security: {
          headers: 'helmet',
          hsts: process.env.ENABLE_HSTS === 'true',
          cors: 'configured',
          shield: 'SecurityShield360 Phase 2',
        },
        author: 'Douglas P. Figueiredo',
        copyright: '© 2024-2026 Reservei Viagens LTDA',
        website: 'https://www.reserveiviagens.com.br',
      });
    });
  }

  static getCorsOptions() {
    const origin = getCorsOriginAllowlist();
    return {
      origin,
      credentials: true,
    };
  }
}

module.exports = { SecurityConfig };
