import { Router } from 'express';
import paymentRoutes from './payment.routes';
import customerRoutes from './customer.routes';
import pixRoutes from './pix.routes';
import subscriptionRoutes from './subscription.routes';
import refundRoutes from './refund.routes';
import disputeRoutes from './dispute.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

// Mount sub-routers
router.use('/payments', paymentRoutes);
router.use('/customers', customerRoutes);
router.use('/pix', pixRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/refunds', refundRoutes);
router.use('/disputes', disputeRoutes);
router.use('/webhooks', webhookRoutes);

export default router;

// CommonJS export for compatibility
module.exports = router;