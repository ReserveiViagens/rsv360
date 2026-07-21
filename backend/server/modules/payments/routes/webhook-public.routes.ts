import { Router } from 'express';
import { WebhookService } from '../services/webhook.service';

/**
 * Explicit public webhooks — provider callbacks verify signature inside the service.
 * /events and /retry stay on the parent router behind JWT (fail-closed).
 */
const router = Router();
const webhookService = new WebhookService();

router.post('/stripe', async (req, res) => {
  try {
    await webhookService.processStripeWebhook(
      JSON.stringify(req.body),
      req.headers['stripe-signature'] as string,
    );
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/mercadopago', async (req, res) => {
  try {
    await webhookService.processMPWebhook(req.body);
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
module.exports = router;
