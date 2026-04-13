import { Router } from 'express';
import { SubscriptionService } from '../services/subscription.service';

const router = Router();
const subscriptionService = new SubscriptionService();

router.post('/plans', async (req, res) => {
  try {
    const result = await subscriptionService.createPlan(req.body.enterpriseId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/plans', async (req, res) => {
  try {
    const result = await subscriptionService.listPlans(req.query.enterpriseId as string);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/plans/:id', async (req, res) => {
  try {
    const result = await subscriptionService.updatePlan(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/plans/:id', async (req, res) => {
  try {
    await subscriptionService.deletePlan(req.params.id);
    res.json({ message: 'Plan deleted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await subscriptionService.createSubscription(req.body.enterpriseId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await subscriptionService.listSubscriptions(req.query.enterpriseId as string);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await subscriptionService.getSubscription(req.params.id);
    if (!result) return res.status(404).json({ error: 'Subscription not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const result = await subscriptionService.cancelSubscription(req.params.id, req.body.atPeriodEnd);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:id/pause', async (req, res) => {
  try {
    const result = await subscriptionService.pauseSubscription(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:id/resume', async (req, res) => {
  try {
    const result = await subscriptionService.resumeSubscription(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:id/change-plan', async (req, res) => {
  try {
    const result = await subscriptionService.changePlan(req.params.id, req.body.newPlanId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const result = await subscriptionService.getSubscriptionStats(req.query.enterpriseId as string);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;