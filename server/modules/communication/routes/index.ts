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