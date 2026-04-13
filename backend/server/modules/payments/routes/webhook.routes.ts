import { Router } from 'express';
import { WebhookService } from '../services/webhook.service';

const router = Router();
const webhookService = new WebhookService();

router.post('/stripe', async (req, res) => {
  try {
    await webhookService.processStripeWebhook(JSON.stringify(req.body), req.headers['stripe-signature'] as string);
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

router.get('/events', async (req, res) => {
  try {
    const result = await webhookService.getEventLog();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/retry', async (req, res) => {
  try {
    await webhookService.retryFailedEvents();
    res.json({ message: 'Retry initiated' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;