const express = require('express');
const cors = require('cors');
require('tsx/cjs');
const { SecurityConfig } = require('./src/middleware/security-config');
const { portalRouter, adminRouter } = require('../server/modules/guest-portal/routes');

async function createApp() {
  const app = express();

  await SecurityConfig.initialize(app);

  app.use(cors());
  app.use('/api/v1/payments/webhooks/stripe', express.raw({ type: 'application/json' }));
  app.use(express.json());

  const paymentsRoutes = require('./server/modules/payments/routes');

  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'RSV360 Backend API Server',
      security: 'SecurityShield360 Phase 2 Active',
    });
  });

  SecurityConfig.setupHealthCheck(app);
  app.use('/api/v1/payments', paymentsRoutes);
  app.use('/api/portal', portalRouter);
  app.use('/api/admin/portal', adminRouter);

  try {
    const housekeepingModule = require('../server/modules/housekeeping');
    housekeepingModule.registerHousekeepingModule(app);
    console.log('[MODULE] Housekeeping carregado ✓');
  } catch (err) {
    console.warn('[MODULE] Housekeeping não disponível:', err.message);
  }

  app.use((err, req, res, next) => {
    console.error('[SERVER] Error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  });

  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  return app;
}

module.exports = { createApp };
