import { Router, type Response } from 'express';
import { ZodError } from 'zod';
import { campaignService } from '../services';
import {
  CampaignAudienceSchema,
  CampaignCreateSchema,
  CampaignScheduleSchema,
  CampaignUpdateSchema,
  parsePositiveIntId,
} from '../schemas/crm-write.schema';
import { badRequest as badRequestShared } from '../../../lib/bad-request';

const router = Router();

function badRequest(res: import('express').Response, error: unknown) {
  return badRequestShared(res, error, { successEnvelope: true });
}

router.get('/', async (req, res) => {
  res.json({
    success: true,
    data: await campaignService.list(
      req.query,
      req.query.page ? Number(req.query.page) : 1,
      req.query.limit ? Number(req.query.limit) : 20,
    ),
  });
});

router.post('/', async (req, res) => {
  try {
    const body = CampaignCreateSchema.parse(req.body);
    const userId = Number(body.userId || body.user_id || 1);
    const item = await campaignService.create(userId, body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const item = await campaignService.get(id);
    if (!item) return res.status(404).json({ success: false, error: 'Campanha não encontrada' });
    res.json({ success: true, data: item });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = CampaignUpdateSchema.parse(req.body);
    const item = await campaignService.update(id, body);
    if (!item) return res.status(404).json({ success: false, error: 'Campanha não encontrada' });
    res.json({ success: true, data: item });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json({ success: true, deleted: await campaignService.delete(id) });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/:id/audience', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = CampaignAudienceSchema.parse(req.body ?? {});
    const campaign = await campaignService.get(id);
    const filter = body.filter || campaign?.segment_filter || {};
    res.json({ success: true, data: await campaignService.buildAudience(filter) });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/:id/schedule', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = CampaignScheduleSchema.parse(req.body);
    const scheduledAt = String(body.scheduledAt || body.scheduled_at);
    res.json({ success: true, data: await campaignService.schedule(id, scheduledAt) });
  } catch (error) {
    return badRequest(res, error);
  }
});

/** SKIP body: send has no req.body mass-assignment surface. */
router.post('/:id/send', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json({ success: true, data: await campaignService.send(id) });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/:id/stats', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json({ success: true, data: await campaignService.getStats(id) });
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;
