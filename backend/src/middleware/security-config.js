class SecurityConfig {
  static async initialize(app) {
    // Basic security configuration for testing
    this.configure(app);
    console.log('[SECURITY] Basic security configuration applied');
  }

  static configure(app) {
    // Add basic security headers
    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });
  }

  static setupHealthCheck(app) {
    // Basic health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'RSV360 Backend API',
        security: 'Basic Security Active',
        author: 'Douglas P. Figueiredo',
        copyright: '© 2024-2026 Reservei Viagens LTDA',
        website: 'https://www.reserveiviagens.com.br'
      });
    });

    app.get('/health/security', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'RSV360 Backend API',
        security: {
          headers: 'active',
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
    const raw =
      process.env.CORS_ORIGIN ||
      'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3005';
    const origin = raw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    return {
      origin,
      credentials: true,
    };
  }
}

module.exports = { SecurityConfig };
