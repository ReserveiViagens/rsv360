import { Router } from 'express';
import { WebhookService } from '../services/webhook.service';

/** Staff-only webhook ops — mounted after JWT fail-closed on payments router. */
const router = Router();
const webhookService = new WebhookService();

router.get('/events', async (_req, res) => {
  try {
    const result = await webhookService.getEventLog();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/retry', async (_req, res) => {
  try {
    await webhookService.retryFailedEvents();
    res.json({ message: 'Retry initiated' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
module.exports = router;
