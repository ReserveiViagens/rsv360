const express = require('express');
const cors = require('cors');
require('tsx/cjs');
const { SecurityConfig } = require('./src/middleware/security-config');
const { portalRouter, adminRouter } = require('../server/modules/guest-portal/routes');
const { brandingHeaders } = require('./src/middleware/security-headers');
const { canonicalRedirect } = require('./src/middleware/canonical-redirect');
const { infoRouter } = require('./src/routes/info.route');
const { cloneAlertRouter } = require('./src/routes/clone-alert.route');
const { trackingRouter } = require('./src/routes/tracking.route');

async function createApp() {
  const app = express();

  await SecurityConfig.initialize(app);

  app.use(cors());
  app.use(brandingHeaders);
  app.use(canonicalRedirect);
  app.use('/api/v1/payments/webhooks/stripe', express.raw({ type: 'application/json' }));
  app.use(express.json());

  let tenantMiddleware = (req, _res, next) => {
    req.propertyId = 1;
    next();
  };

  try {
    const multiPropertyModule = require('../server/modules/multi-property');
    const loaded = await multiPropertyModule.registerMultiPropertyModule(app);
    tenantMiddleware = loaded.tenantMiddleware || tenantMiddleware;
    console.log('[BOOT] Multi-property module loaded');
  } catch (err) {
    console.warn('[BOOT] Multi-property module failed:', err.message);
  }

  app.use('/api', tenantMiddleware);

  const paymentsRoutes = require('./server/modules/payments/routes');

  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'RSV360 Backend API',
      message: 'RSV360 Backend API Server',
      security: 'SecurityShield360 Phase 2 Active',
      author: 'Douglas P. Figueiredo',
      copyright: '© 2024-2026 Reservei Viagens LTDA',
      website: 'https://www.reserveiviagens.com.br',
    });
  });

  SecurityConfig.setupHealthCheck(app);
  app.use('/api/info', infoRouter);
  app.use('/api/clone-alert', cloneAlertRouter);
  app.use('/api/tracking', trackingRouter);
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

  try {
    const revenueModule = require('../server/modules/revenue');
    revenueModule.registerRevenueModule(app);
    console.log('[MODULE] Revenue Engine carregado ✓');
  } catch (err) {
    console.warn('[MODULE] Revenue Engine não disponível:', err.message);
  }

  try {
    const crmModule = require('../server/modules/crm/index.ts');
    await crmModule.registerCrmModule(app);
    console.log('[BOOT] CRM & Loyalty module loaded');
  } catch (err) {
    console.warn('[BOOT] CRM module failed:', err.message);
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
