import { Router } from 'express';
import { ZodError } from 'zod';
import { SubscriptionService } from '../services/subscription.service';
import { parsePaymentUuidParam } from '../schemas/params.schema';
import {
  SubscriptionCancelSchema,
  SubscriptionChangePlanSchema,
  SubscriptionCreateSchema,
  SubscriptionPlanCreateSchema,
  SubscriptionPlanUpdateSchema,
} from '../schemas/subscription-write.schema';

const router = Router();
const subscriptionService = new SubscriptionService();

function badRequest(res: import('express').Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: error.flatten() });
  }
  return res.status(500).json({ error: (error as Error).message });
}

router.post('/plans', async (req, res) => {
  try {
    const parsed = SubscriptionPlanCreateSchema.parse(req.body);
    const { enterpriseId, ...plan } = parsed;
    const result = await subscriptionService.createPlan(enterpriseId, plan);
    res.json(result);
  } catch (error) {
    return badRequest(res, error);
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
    const id = parsePaymentUuidParam(req.params.id);
    const data = SubscriptionPlanUpdateSchema.parse(req.body);
    const result = await subscriptionService.updatePlan(id, data);
    res.json(result);
  } catch (error) {
    return badRequest(res, error);
  }
});

router.delete('/plans/:id', async (req, res) => {
  try {
    const id = parsePaymentUuidParam(req.params.id);
    await subscriptionService.deletePlan(id);
    res.json({ message: 'Plan deleted' });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/', async (req, res) => {
  try {
    const parsed = SubscriptionCreateSchema.parse(req.body);
    const { enterpriseId, ...sub } = parsed;
    const result = await subscriptionService.createSubscription(enterpriseId, sub);
    res.json(result);
  } catch (error) {
    return badRequest(res, error);
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

router.get('/stats', async (req, res) => {
  try {
    const result = await subscriptionService.getSubscriptionStats(req.query.enterpriseId as string);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parsePaymentUuidParam(req.params.id);
    const result = await subscriptionService.getSubscription(id);
    if (!result) return res.status(404).json({ error: 'Subscription not found' });
    res.json(result);
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const id = parsePaymentUuidParam(req.params.id);
    const { atPeriodEnd } = SubscriptionCancelSchema.parse(req.body ?? {});
    const result = await subscriptionService.cancelSubscription(id, atPeriodEnd);
    res.json(result);
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/:id/pause', async (req, res) => {
  try {
    const id = parsePaymentUuidParam(req.params.id);
    const result = await subscriptionService.pauseSubscription(id);
    res.json(result);
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/:id/resume', async (req, res) => {
  try {
    const id = parsePaymentUuidParam(req.params.id);
    const result = await subscriptionService.resumeSubscription(id);
    res.json(result);
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/:id/change-plan', async (req, res) => {
  try {
    const id = parsePaymentUuidParam(req.params.id);
    const { newPlanId } = SubscriptionChangePlanSchema.parse(req.body);
    const result = await subscriptionService.changePlan(id, newPlanId);
    res.json(result);
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;
