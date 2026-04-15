import { Router } from 'express';
import { pricingRulesService } from '../services';

const router = Router();

router.get('/', async (_req, res) => {
  const rules = await pricingRulesService.listRules({
    is_active: _req.query.is_active === 'true' ? true : _req.query.is_active === 'false' ? false : undefined,
    roomTypeId: _req.query.roomTypeId ? Number(_req.query.roomTypeId) : undefined,
    channel: _req.query.channel as string | undefined,
  });
  res.json({ success: true, data: rules });
});

router.post('/', async (req, res) => {
  try {
    const rule = await pricingRulesService.createRule(req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/seed', async (_req, res) => {
  const rules = await pricingRulesService.seedDefaults();
  res.json({ success: true, data: { count: rules.length } });
});

router.post('/validate', async (req, res) => {
  const result = pricingRulesService.validateRule(req.body);
  res.json({ success: true, data: result });
});

router.get('/:id', async (req, res) => {
  const rule = await pricingRulesService.getRuleById(Number(req.params.id));
  if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' });
  res.json({ success: true, data: rule });
});

router.put('/:id', async (req, res) => {
  try {
    const rule = await pricingRulesService.updateRule(Number(req.params.id), req.body);
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' });
    res.json({ success: true, data: rule });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  await pricingRulesService.deleteRule(Number(req.params.id));
  res.json({ success: true });
});

router.put('/:id/toggle', async (req, res) => {
  const rule = await pricingRulesService.toggleRule(Number(req.params.id), Boolean(req.body.isActive ?? req.body.is_active));
  if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' });
  res.json({ success: true, data: rule });
});

router.put('/reorder', async (req, res) => {
  await pricingRulesService.reorderRules((req.body.ruleIds || req.body.rule_ids || []).map((value: any) => Number(value)));
  res.json({ success: true });
});

export default router;
