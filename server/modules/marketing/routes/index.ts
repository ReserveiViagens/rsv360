import { Router } from 'express';

import campaignRoutes from './campaign.routes';
import broadcastRoutes from './broadcast.routes';
import analyticsRoutes from './analytics.routes';
import funnelRoutes from './funnel.routes';
import whatsappRoutes from './whatsapp.routes';
import abtestRoutes from './abtest.routes';

const router = Router();

// Mount sub-routes
router.use('/campaigns', campaignRoutes);
router.use('/broadcasts', broadcastRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/funnels', funnelRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/ab-tests', abtestRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    module: 'marketing',
    status: 'ok',
    timestamp: new Date().toISOString(),
    routes: {
      campaigns: '/api/v1/mkt/campaigns',
      broadcasts: '/api/v1/mkt/broadcasts',
      analytics: '/api/v1/mkt/analytics',
      funnels: '/api/v1/mkt/funnels',
      whatsapp: '/api/v1/mkt/whatsapp',
      abTests: '/api/v1/mkt/ab-tests',
    },
  });
});

export default router;