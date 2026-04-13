const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import security configuration
const { SecurityConfig } = require('./src/middleware/security-config');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize security middleware
async function initializeSecurity() {
  try {
    await SecurityConfig.initialize(app);
    console.log('[SECURITY] SecurityShield360 Phase 2 initialized successfully');
  } catch (error) {
    console.error('[SECURITY] Failed to initialize security middleware:', error);
    process.exit(1);
  }
}

// Initialize security before setting up routes
initializeSecurity().then(() => {
  // Additional middleware (after security)
  app.use(cors());
  
  // Raw body for Stripe webhooks (BEFORE express.json())
  app.use('/api/v1/payments/webhooks/stripe', express.raw({ type: 'application/json' }));
  
  app.use(express.json());

  // Import routes
  const brandingRoutes = require('./src/api/v1/branding/routes');
  const enterprisesRoutes = require('./src/api/v1/enterprises/routes');
  const propertiesRoutes = require('./src/api/v1/properties/routes');
  const accommodationsRoutes = require('./src/api/v1/accommodations/routes');
  const parksRoutes = require('./src/api/v1/parks/routes');
  const attractionsRoutes = require('./src/api/v1/attractions/routes');
  const promotionsRoutes = require('./src/api/v1/promotions/routes');
  const travelRoutes = require('./src/api/v1/travel/routes');
  const recommendationsRoutes = require('./src/api/v1/recommendations/routes');
  const searchRoutes = require('./src/api/v1/search/routes');
  const leadsRoutes = require('./src/api/v1/leads/routes');
  const productsRoutes = require('./src/api/v1/products/routes');
  const paymentsRoutes = require('./server/modules/payments/routes');

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'RSV360 Backend API Server',
      security: 'SecurityShield360 Phase 2 Active'
    });
  });

  // Setup security health check
  SecurityConfig.setupHealthCheck(app);

  // API routes - Commenting out missing routes for testing payments module
  // app.use('/api/v1/branding', brandingRoutes);
  // app.use('/api/v1/enterprises', enterprisesRoutes);
  // app.use('/api/v1/properties', propertiesRoutes);
  // app.use('/api/v1/accommodations', accommodationsRoutes);
  // app.use('/api/v1/parks', parksRoutes);
  // app.use('/api/v1/attractions', attractionsRoutes);
  // app.use('/api/v1/promotions', promotionsRoutes);
  // app.use('/api/v1/travel', travelRoutes);
  // app.use('/api/v1/recommendations', recommendationsRoutes);
  // app.use('/api/v1/search', searchRoutes);
  // app.use('/api/v1/leads', leadsRoutes);
  // app.use('/api/v1/products', productsRoutes);
  app.use('/api/v1/payments', paymentsRoutes);

  // Error handling
  app.use((err, req, res, next) => {
    console.error('[SERVER] Error:', err.message);

    // Log security events
    if (err.message.includes('CORS') || err.message.includes('rate limit')) {
      SecurityConfig.logSecurityEvent('security_violation', {
        type: 'middleware_error',
        message: err.message,
        ip: req.ip,
        path: req.path
      });
    }

    res.status(500).json({ success: false, error: 'Internal server error' });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  app.listen(PORT, () => {
    console.log(`[SERVER] RSV360 Backend API Server running on port ${PORT}`);
    console.log(`[SERVER] Health check: http://localhost:${PORT}/health`);
    console.log(`[SECURITY] Security health check: http://localhost:${PORT}/health/security`);
  });
}).catch((error) => {
  console.error('[INIT] Failed to initialize security:', error);
  process.exit(1);
});