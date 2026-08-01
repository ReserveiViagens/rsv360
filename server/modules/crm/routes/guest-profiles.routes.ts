import { Router, type Response } from 'express';
import { ZodError } from 'zod';
import { guestProfileService } from '../services';
import {
  GuestBlacklistSchema,
  GuestMergeSchema,
  GuestProfileCreateSchema,
  GuestProfileUpdateSchema,
  GuestVipSchema,
  parsePositiveIntId,
} from '../schemas/crm-write.schema';
import { badRequest as badRequestShared } from '../../../lib/bad-request';

const router = Router();

function badRequest(res: import('express').Response, error: unknown) {
  return badRequestShared(res, error, { successEnvelope: true });
}

router.get('/', async (req, res) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  res.json({ success: true, data: await guestProfileService.list(req.query, page, limit) });
});

router.get('/search', async (req, res) => {
  res.json({
    success: true,
    data: await guestProfileService.search(String(req.query.q || ''), req.query.limit ? Number(req.query.limit) : 20),
  });
});

router.post('/merge', async (req, res) => {
  try {
    const { keepId, mergeId } = GuestMergeSchema.parse(req.body);
    const result = await guestProfileService.mergeProfiles(keepId, mergeId);
    res.json({ success: true, data: result });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/lifecycle/refresh', async (_req, res) => {
  res.json({ success: true, data: await guestProfileService.refreshAllLifecycles() });
});

router.post('/', async (req, res) => {
  try {
    const body = GuestProfileCreateSchema.parse(req.body);
    const profile = await guestProfileService.create(body);
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/:id/timeline', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json({ success: true, data: await guestProfileService.getTimeline(id) });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const profile = await guestProfileService.get(id);
    if (!profile) return res.status(404).json({ success: false, error: 'Perfil não encontrado' });
    res.json({ success: true, data: profile });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = GuestProfileUpdateSchema.parse(req.body);
    const profile = await guestProfileService.update(id, body);
    if (!profile) return res.status(404).json({ success: false, error: 'Perfil não encontrado' });
    res.json({ success: true, data: profile });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json({ success: true, deleted: await guestProfileService.delete(id) });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id/vip', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = GuestVipSchema.parse(req.body ?? {});
    const profile = await guestProfileService.update(id, { is_vip: Boolean(body.is_vip ?? true) });
    res.json({ success: true, data: profile });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/:id/blacklist', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = GuestBlacklistSchema.parse(req.body ?? {});
    const profile = await guestProfileService.update(id, {
      is_blacklisted: Boolean(body.is_blacklisted ?? true),
      blacklist_reason: body.blacklist_reason || body.reason,
    });
    res.json({ success: true, data: profile });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/:id/lifecycle', async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    res.json({ success: true, data: await guestProfileService.updateLifecycle(id) });
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;
