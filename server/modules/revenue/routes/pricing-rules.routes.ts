import { Router, type Response } from 'express';
import { ZodError } from 'zod';
import { pricingRulesService } from '../services';
import {
  PricingRuleCreateSchema,
  PricingRuleReorderSchema,
  PricingRuleToggleSchema,
  PricingRuleUpdateSchema,
  parsePositiveIntId,
} from '../schemas/revenue-write.schema';
import { badRequest as badRequestShared } from '../../../lib/bad-request';

const router = Router();

function badRequest(res: import('express').Response, error: unknown) {
  return badRequestShared(res, error, { successEnvelope: true });
}

router.get('/', async (_req, res) => {
  const rules = await pricingRulesService.listRules({
    is_active: _req.query.is_active === 'true' ? true : _req.query.is_active === 'false' ? false : undefined,
    roomTypeId: _req.query.roomTypeId ? Number(_req.query.roomTypeId) : undefined,
    channel: _req.query.channel as string | undefined,
    property_id: _req.query.property_id ? Number(_req.query.property_id) : undefined,
  });
  res.json({ success: true, data: rules });
});

router.post('/', async (req, res) => {
  try {
    const body = PricingRuleCreateSchema.parse(req.body);
    const rule = await pricingRulesService.createRule(body);
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    return badRequest(res, error);
  }
});

/** SKIP body: seed uses query only. */
router.post('/seed', async (_req, res) => {
  const rules = await pricingRulesService.seedDefaults(_req.query.property_id ? Number(_req.query.property_id) : undefined);
  res.json({ success: true, data: { count: rules.length } });
});

router.post('/validate', async (req, res) => {
  try {
    const body = PricingRuleUpdateSchema.parse(req.body ?? {});
    const result = pricingRulesService.validateRule(body);
    res.json({ success: true, data: result });
  } catch (error) {
    return badRequest(res, error);
  }
});

// Static path before /:id (prevents id=reorder match)
router.put('/reorder', async (req, res) => {
  try {
    const body = PricingRuleReorderSchema.parse(req.body);
    const ids = body.ruleIds || body.rule_ids || [];
    await pricingRulesService.reorderRules(ids);
    res.json({ success: true });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const rule = await pricingRulesService.getRuleById(id);
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' });
    res.json({ success: true, data: rule });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = PricingRuleUpdateSchema.parse(req.body);
    const rule = await pricingRulesService.updateRule(id, body);
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' });
    res.json({ success: true, data: rule });
  } catch (error) {
    return badRequest(res, error);
  }
});

/** SKIP body: delete has no req.body mass-assignment surface. */
router.delete('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    await pricingRulesService.deleteRule(id);
    res.json({ success: true });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id/toggle', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = PricingRuleToggleSchema.parse(req.body ?? {});
    const rule = await pricingRulesService.toggleRule(id, Boolean(body.isActive ?? body.is_active));
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' });
    res.json({ success: true, data: rule });
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;
