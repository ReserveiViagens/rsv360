// Communication Routes — Main Router

import { Router } from 'express';
import whatsappRoutes from './whatsapp.routes';
import emailRoutes from './email.routes';
import smsRoutes from './sms.routes';
import pushRoutes from './push.routes';
import templatesRoutes from './templates.routes';
import inboxRoutes from './inbox.routes';
import campaignsRoutes from './campaigns.routes';
import webhooksRoutes from './webhooks.routes';

const router = Router();

router.use((req, _res, next) => {
  const propertyId = (req as any).propertyId;
  if (propertyId !== undefined) {
    (req.query as any).property_id = (req.query as any).property_id || String(propertyId);
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      (req.body as any).property_id = (req.body as any).property_id || propertyId;
    }
  }
  next();
});

// Mount sub-routes
router.use('/whatsapp', whatsappRoutes);
router.use('/email', emailRoutes);
router.use('/sms', smsRoutes);
router.use('/push', pushRoutes);
router.use('/templates', templatesRoutes);
router.use('/inbox', inboxRoutes);
router.use('/campaigns', campaignsRoutes);
router.use('/webhooks', webhooksRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Communication module is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
