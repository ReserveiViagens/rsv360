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
        security: 'Basic Security Active'
      });
    });
  }

  static getCorsOptions() {
    return {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    };
  }
}

module.exports = { SecurityConfig };